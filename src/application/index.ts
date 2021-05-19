import mongoose from "mongoose";
import dotenv from "dotenv";
import winston from "winston";
import fs from "fs/promises";

import { v4 as uuidv4 } from "uuid";
import { Tedis } from "tedis";

import fetch, { Request } from "node-fetch";

import {
    HttpMethod,
    HttpRequestOptions,
    formatEndpoint,
    stringifyQuery,
    RichEmbed
} from "@wilsonjs/client";

import { ApiEndpoints, BaseUrls } from "@wilsonjs/constants";

import { GlobalConfig } from "./GlobalConfig";
import { FatalErrorModel } from "src/models/FatalError";

export class SwagclanApp {
    config!: GlobalConfig;
    db!: mongoose.Mongoose;
    redis!: Tedis;
    logger: winston.Logger;

    cache: Map<string, any>;

    constructor(public readonly namespace: string) {
        this.logger = winston.createLogger({
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.splat(),
                        winston.format.colorize(),
                        winston.format.label({ label: namespace }),
                        winston.format.printf(info => {
                            return `[${info.label}] ${info.level}: ${info.message}`;
                        }),
                    ),
                }),
                new winston.transports.File({
                    filename: "logs.txt",
                    format: winston.format.combine(
                        winston.format.splat(),
                        winston.format.simple()
                    )
                })
            ]
        });

        this.cache = new Map;
    }

    async make<T = any>(
        method: HttpMethod,
        path: string,
        options: HttpRequestOptions = {},
        ...params: any[]
    ): Promise<T> {
        const formatted = formatEndpoint(path, ...params);
        const query = options.query ? "?" + stringifyQuery(options.query) : "";

        const request_init = new Request(
            (formatted[0] === "/"
                ? "https://" + BaseUrls.API + "/v8" + formatted
                : formatted) + query,
            {
                method,
                ...options,
                headers: {
                    ...(this.config.bot.bot_token
                        ? {
                            Authorization: "Bot " + this.config.bot.bot_token
                        }
                        : {}),
                    ...options.headers
                }
            }
        );

        const res = await fetch(request_init);

        if (res.status >= 200 && res.status < 300) {
            if (res.status === 204) {
                return "" as any;
            }

            if (res.headers.get("Content-Type") === "application/json") {
                return (await res.json()) as T;
            } else if (res.headers.get("Content-Type") === "text/plain") {
                return (await res.text()) as any;
            }

            return (await res.blob()) as any;
        } else {
            throw res.status;
        }
    }

    async start() {
        this.logger.info("Starting " + this.namespace + " service..");

        dotenv.config();

        this.logger.info("Loaded environment variables.");

        const data = await fs.readFile(".config.json", "utf8");
        this.config = JSON.parse(data);

        this.logger.info("Loaded configuration.");

        this.db = await mongoose.connect(
            "mongodb://" +
                (this.config.mongo.username
                    ? this.config.mongo.username + ":" + this.config.mongo.password + "@"
                    : "")
                + this.config.mongo.host + ":"
                + this.config.mongo.port + "/"
                + this.config.mongo.database
                + "?retryWrites=true&w=majority",
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false
            }
        );

        this.logger.info("Successfully connected to MongoDB node.");

        this.redis = new Tedis(this.config.redis);

        this.redis.on("connect", () => {
            this.logger.info("Connected to Redis node.");
        });

        process.on("SIGINT", async () => {
            this.logger.info("Shutting app down gracefully..");
            await this.shutdown();
            process.exit(0);
        });
    }

    async logFatal(error: Error, details?: any) {
        const uuid = uuidv4();

        await FatalErrorModel.create({
            uuid,
            details,
            namespace: this.namespace,
            error: error.message,
            stack_trace: error.stack
        });

        const embed = new RichEmbed()
            .setTitle("📛 Fatal Error")
            .setBody("`" + error.message + "`")
            .setColor([ 255, 0, 0 ]);

        if (error.stack)
            embed.addField(
                "Stacktrace",
                "```" + error.stack
                    .split(process.cwd())
                    .join("") + "```"
            );

        await this.make(
            "POST",
            ApiEndpoints.ExecuteWebhook,
            {
                body: JSON.stringify({
                    embeds: [ embed.toJSON() ]
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            },
            this.config.webhook.webhook_id,
            this.config.webhook.webhook_token
        );

        return uuid;
    }

    async shutdown() {
        await Promise.all([this.db.disconnect(), this.redis.close()]);
        this.logger.info(
            "Closed MongoDB node connection and Redis connection."
        );
    }
}
