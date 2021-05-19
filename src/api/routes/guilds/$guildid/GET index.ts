import { ApiEndpoints } from "@wilsonjs/constants";
import { BasicGuild } from "@wilsonjs/models";

import { ErrorCode, ScApiGetGuildResponse } from "@swagclan/shared";

import { GuildPremiumModel } from "src/models/GuildPremium";

import { app, RequestInfo, ResponseInfo } from "src/api";
import { Forbidden, ResourceNotFound, Unauthorized } from "src/api/responses";

import { canManage } from "./middleware";
import { Cached } from "src/api/Session";
import { RequireAuth } from "src/api/hooks/auth";

export interface GuildPremiumResponse {
    started_at: number;
    expires_at: number;
    user_id: string;
}

export interface SwagClanGuild extends BasicGuild {
    premium?: GuildPremiumResponse;
}

async function getGuild(guildid: string): Promise<BasicGuild|null> {
    const cached = app.cache.get("guild." + guildid) as Cached<BasicGuild>;

    if (cached) {
        if (Date.now() > cached.cached_at + 90000) {
            return cached;
        }
    }

    try {
        const guild = await app.make<BasicGuild>(
            "GET",
            ApiEndpoints.GetGuild,
            { query: { with_counts: "true" } },
            /* Guild ID */ guildid
        );

        await app.cache.set("guild." + guildid, {
            ...guild,
            cached_at: Date.now()
        });

        return guild;
    } catch (e) {
        return null;
    }
}

export default class GetGuild {
    @RequireAuth
    static async handle(
        req: RequestInfo<void>,
        res: ResponseInfo<ScApiGetGuildResponse>
    ) {
        const guilds = await req.session?.getGuilds();

        if (!guilds)
            throw new Unauthorized(ErrorCode.NotLoggedIn);

        const as_user = guilds.find(g => g?.id === req.params.guildid);

        if (!as_user)
            throw new Forbidden(ErrorCode.UserNotInGuild);

        const guild = await getGuild(req.params.guildid);

        if (!guild)
            throw new ResourceNotFound(ErrorCode.BotNotInGuild);

        if (!canManage(as_user))
            throw new Forbidden(ErrorCode.CannotManageGuild);

        const doc = await GuildPremiumModel.findOne({
            guild_id: req.params.guildid
        });

        if (!doc) {
            return res.status(200).json(guild);
        }

        res.status(200).json({
            ...guild,
            premium: {
                guild_id: guild.id,
                started_at: doc.started_at,
                expires_at: doc.expires_at,
                user_id: doc.user_id
            }
        });
    }
}
