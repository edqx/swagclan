import querystring from "querystring";

import { ApiEndpoints } from "@wilsonjs/constants";
import {
    AccessTokenResponse,
    BasicGuild,
    BasicUser,
    GetCurrentUserGuildsResponse,
    GetCurrentUserResponse
} from "@wilsonjs/models";

import { app } from "./index";
import { LoginSession, LoginSessionModel } from "src/models/LoginSession";

export type Cached<T> = T & { cached_at: number };

export class UserSession implements LoginSession {
    access_token!: string;
    refresh_token!: string;
    expires_at!: number;
    scope!: string;
    ip!: string;
    userAgent!: string;

    constructor(public readonly id: string) {}

    static async from(id: string) {
        const cached = app.cache.get("session." + id) as UserSession;

        if (cached) {
            return cached;
        } else {
            const doc = await LoginSessionModel.findOne({ id });

            if (doc) {
                const session = new UserSession(id);
                Object.assign(session, doc.toJSON());
                app.cache.set("session." + id, session);
                return session;
            } else {
                return new UserSession(id);
            }
        }
    }

    async save() {
        await LoginSessionModel.create({
            id: this.id,
            access_token: this.access_token,
            refresh_token: this.refresh_token,
            expires_at: this.expires_at,
            scope: this.scope,
            ip: this.ip,
            userAgent: this.userAgent
        });

        app.cache.set("session." + this.id, this);
    }

    async invalidate() {
        await LoginSessionModel.findOneAndDelete({ id: this.id });
        await app.cache.delete("session." + this.id);
    }

    async exchangeCode(code: string, ip: string, userAgent: string) {
        await this.invalidate();

        try {
            const exch = await app.make<AccessTokenResponse>(
                "POST",
                "/oauth2/token",
                {
                    body: querystring.stringify({
                        client_id: process.env.CLIENT_ID,
                        client_secret: process.env.CLIENT_SECRET,
                        grant_type: "authorization_code",
                        code: code,
                        redirect_uri: app.config.base_api + "/exchange",
                        scope: app.config.oauth.scopes.join(" ")
                    }),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );

            this.access_token = exch.access_token;
            this.refresh_token = exch.refresh_token;
            this.expires_at = Date.now() + exch.expires_in;
            this.scope = exch.scope;
            this.ip = ip;
            this.userAgent = userAgent;

            await this.save();

            return true;
        } catch (e) {
            return false;
        }
    }

    async getAccessToken() {
        const cached = app.cache.get("session." + this.id) as LoginSession;

        if (cached) {
            if (cached.expires_at <= Date.now()) {
                try {
                    const exch = await app.make<AccessTokenResponse>(
                        "POST",
                        "/oauth2/token",
                        {
                            body: querystring.stringify({
                                client_id: process.env.CLIENT_ID,
                                client_secret: process.env.CLIENT_SECRET,
                                grant_type: "refresh_token",
                                refresh_token: cached.refresh_token,
                                redirect_uri: app.config.base_api + "/exchange",
                                scope: app.config.oauth.scopes.join(" ")
                            }),
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            }
                        }
                    );

                    cached.access_token = exch.access_token;
                    cached.refresh_token = exch.refresh_token;
                    cached.expires_at = Date.now() + exch.expires_in;
                } catch (e) {
                    return null;
                }

                await app.cache.set(
                    "session." + this.id,
                    cached
                );
            }

            return cached.access_token;
        }

        return null;
    }

    async getUser(): Promise<GetCurrentUserResponse|null> {
        const cached = app.cache.get("user." + this.id) as Cached<BasicUser>;

        if (cached) {
            if (Date.now() < cached.cached_at + 30000) {
                return cached;
            }
        }

        const access_token = await this.getAccessToken();

        try {
            const user = await app.make<GetCurrentUserResponse>(
                "GET",
                ApiEndpoints.GetCurrentUser,
                {
                    headers: {
                        Authorization: "Bearer " + access_token
                    }
                }
            );

            await app.cache.set("user." + this.id, {
                ...user,
                cached_at: Date.now()
            });

            return user;
        } catch (e) {
            return null;
        }
    }

    async getGuilds(): Promise<GetCurrentUserGuildsResponse|null> {
        const cached = app.cache.get("guilds." + this.id) as Cached<{ guilds: BasicGuild[] }>;

        if (cached) {
            if (Date.now() < cached.cached_at + 90000) {
                return cached.guilds;
            }
        }

        const access_token = await this.getAccessToken();

        try {
            const guilds = await app.make<GetCurrentUserGuildsResponse>(
                "GET",
                ApiEndpoints.GetCurrentUserGuilds,
                {
                    headers: {
                        Authorization: "Bearer " + access_token
                    }
                }
            );

            await app.cache.set("guilds." + this.id, {
                guilds,
                cached_at: Date.now()
            });

            return guilds;
        } catch (e) {
            return null;
        }
    }
}
