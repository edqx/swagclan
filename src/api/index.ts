import "reflect-metadata";

import express from "express";
import http from "http";
import fs from "fs/promises";
import util from "util";
import chalk from "chalk";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";

import { SwagclanApp } from "src/application";
import { HttpError, HttpResponse, InternalServerError } from "./responses";
import { UserSession } from "./Session";
import { ErrorCode } from "../../shared";

const rename = {
    index: "",
    "404": "*"
};
type RenamePath = keyof typeof rename;

const verbs = ["GET", "POST", "PUT", "PATCH", "DELETE", "ALL"] as const;
type HttpVerb = typeof verbs[number];

export interface RequestInfo<ReqType> extends express.Request {
    body: ReqType;
    session?: UserSession;
}

export interface ResponseInfo<ResType> extends express.Response {
    json(body: ResType): this;
}

export type AppReqHandler<ReqType, ResType> = (
    req: RequestInfo<ReqType>,
    res: ResponseInfo<ResType>,
    next?: express.NextFunction
) => Promise<HttpError | any>;

export interface ParsedEndpoint {
    route: string;
    filename: string;
    method?: HttpVerb;
}

const verbClrs = {
    GET: chalk.green,
    POST: chalk.yellow,
    PUT: chalk.white.magenta,
    PATCH: chalk.blue,
    DELETE: chalk.red,
    ALL: chalk.white,
    MIDDLE: chalk.grey
} as Record<HttpVerb|"MIDDLE", chalk.ChalkFunction>;

function formatSeconds(num: number) {
    if (num <= 0.05) {
        return chalk.green(num.toFixed(2) + "s");
    }

    if (num <= 0.1) {
        return chalk.yellow(num.toFixed(2) + "s");
    }

    return chalk.red(num.toFixed(2) + "s");
}

function formatVerb(verb: HttpVerb|"MIDDLE") {
    return verbClrs[verb](verb).padStart(16);
}

const paramRegex = /(?<=\/):[a-zA-Z]+((?=\/)|$)/g;

function normaliseRoute(route: string) {
    if (route.endsWith("/")) {
        return route.substr(0, route.length - 1);
    }

    if (route.length === 0) {
        return "/";
    }

    return route;
}

function formatRoute(route: string) {
    return normaliseRoute(route).replace(paramRegex, x => chalk.cyan(x));
}

function formatStatus(status: number) {
    if (status < 200) {
        return chalk.grey(status);
    }

    if (status < 300) {
        return chalk.green(status);
    }

    if (status < 400) {
        return chalk.cyan(status);
    }

    if (status < 500) {
        return chalk.red(status);
    }

    if (status < 600) {
        return chalk.magenta(status);
    }

    return chalk.grey(status);
}

export async function parseFileTree(
    middlewares: ParsedEndpoint[],
    endpoints: ParsedEndpoint[],
    app: ApiApplication,
    base: string,
    dir: string
) {
    const files = await fs.readdir(dir);

    const filenames = files.map((file) => path.resolve(dir, file));

    const dirs: ParsedEndpoint[] = [];

    await Promise.all(
        filenames.map(async filename => {
            const stat = await fs.stat(filename);
            const basename = path.basename(filename, ".ts");
            const is_dir = stat.isDirectory();

            if (is_dir) {
                const route = rename[basename as RenamePath] ?? basename;
                dirs.push({ filename, route });
            } else {
                if (basename === "middleware") {
                    middlewares.push({ filename, route: base });
                } else {
                    const parts = basename.split(" ");
                    const method = parts[0] as HttpVerb;
                    const rest = parts.slice(1).join(" ");
                    const route = rename[rest as RenamePath] ?? rest;

                    if (!verbs.includes(method)) return;

                    if (rest === "404") {
                        endpoints.unshift({
                            method,
                            route: base + "/" + route,
                            filename
                        });
                    } else {
                        endpoints.push({
                            method,
                            route: base + "/" + route,
                            filename
                        });
                    }
                }
            }
        })
    );

    for (const dir of dirs) {
        await parseFileTree(middlewares, endpoints, app, base + "/" + dir.route, dir.filename);
    }
}

export class ApiApplication extends SwagclanApp {
    server!: express.Express;
    http!: http.Server;

    constructor() {
        super("api");
    }

    async start() {
        await super.start();

        this.server = express();
        this.server.use(
            cors({
                origin: this.config.base_web,
                credentials: true
            })
        );
        this.server.use(express.json());
        this.server.use(cookieParser());

        const middlewares: ParsedEndpoint[] = [];
        const endpoints: ParsedEndpoint[] = [];

        await parseFileTree(middlewares, endpoints, this, "", path.resolve(__dirname, "./routes"));

        const start_imports = Date.now();

        for (let i = 0; i < middlewares.length; i++) {
            const md = middlewares[i];
            const start = Date.now();
            const { default: middleware } = await import(md.filename);

            const replaced = md.route.replace(/\$/g, ":");

            const idx = (i + 1)
                .toString()
                .padStart(
                    (endpoints.length + middlewares.length)
                        .toString()
                        .length
                );

            const took = Date.now() - start;
            app.logger.info(
                "(%s/%s - %s) %s %s",
                idx, endpoints.length + middlewares.length,
                formatSeconds(took / 1000), formatVerb("MIDDLE"), formatRoute(md.route)
            );

            app.server.use(replaced, async (req: RequestInfo<any>, res: ResponseInfo<any>, next) => {
                try {
                    for (const md of middleware) {
                        await md(req, res);
                    }
                } catch (e) {
                    if (e instanceof HttpResponse) {
                        return res.status(e.code).json(e);
                    } else {
                        const user = await req.session?.getUser();
                        const uuid = await this.logFatal(e, {
                            user_id: user?.id
                        });
                        res.status(500).json(new InternalServerError(ErrorCode.Unknown, uuid));
                        throw e;
                    }
                }

                next();
            });
        }

        /*const imported = await Promise.all(
            endpoints.map(ep => {
                return import(ep.filename);
            })
        );*/

        for (let i = 0; i < endpoints.length; i++) {
            const ep = endpoints[i];
            const start = Date.now();
            const { default: handler, middleware } = await import(ep.filename);

            const replaced = ep.route.replace(/\$/g, ":");

            if (middleware) {
                for (const md of middleware) {
                    app.server.use(replaced, async (req: RequestInfo<any>, res: ResponseInfo<any>, next) => {
                        if (req.method !== ep.method) return next();

                        try {
                            await md(req, res);
                        } catch (e) {
                            if (e instanceof HttpResponse) {
                                return res.status(e.code).json(e);
                            } else {
                                const user = await req.session?.getUser();
                                const uuid = await this.logFatal(e, {
                                    user_id: user?.id
                                });
                                res.status(500).json(new InternalServerError(ErrorCode.Unknown, uuid));
                                throw e;
                            }
                        }

                        next();
                    });
                }
            }

            const idx = (i + middlewares.length + 1)
                .toString()
                .padStart(
                    (endpoints.length + middlewares.length)
                        .toString()
                        .length
                );

            const took = Date.now() - start;
            app.logger.info(
                "(%s/%s - %s) %s %s",
                idx, endpoints.length + middlewares.length,
                formatSeconds(took / 1000), formatVerb(ep.method as HttpVerb), formatRoute(replaced)
            );
            app.server[
                ep.method?.toLowerCase() as
                    | "get"
                    | "post"
                    | "put"
                    | "patch"
                    | "delete"
                    | "all"
            ](replaced, async (req: RequestInfo<any>, res: ResponseInfo<any>, next) => {
                try {
                    await handler.handle(req, res, next);
                } catch (e) {
                    if (e instanceof HttpError) {
                        res.status(e.code).json(e);
                    } else {
                        const user = await req.session?.getUser();
                        const uuid = await this.logFatal(e, {
                            user_id: user?.id
                        });
                        res.status(500).json(new InternalServerError(ErrorCode.Unknown, uuid));
                        throw e;
                    }
                }

                app.logger.info(
                    "%s %s -> %s",
                    formatVerb(req.method as HttpVerb),
                    normaliseRoute(replaced)
                        .replace(paramRegex, param =>
                            chalk.cyan(req.params[param.substr(1)])
                        ),
                    formatStatus(res.statusCode)
                );
            });
        }
        this.logger.info(
            "Took %ss",
            ((Date.now() - start_imports) / 1000).toFixed(2)
        );

        this.http = this.server.listen(this.config.api.port, () => {
            this.logger.info("Listening on *:" + this.config.api.port);
        });
    }

    async shutdown() {
        await super.shutdown();

        await util.promisify(this.http.close.bind(this.http))();

        this.logger.info("Closed HTTP server.");
    }
}

const app = new ApiApplication;

(async () => {
    await app.start();
})();

export { app };
