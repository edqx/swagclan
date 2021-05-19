import { ErrorCode, ScApiGetUserGuildsResponse } from "@swagclan/shared";

import { GuildPremiumModel } from "src/models/GuildPremium";

import { RequestInfo, ResponseInfo } from "src/api";
import { Unauthorized } from "src/api/responses";

import { canManage } from "../guilds/$guildid/middleware";
import { RequireAuth } from "src/api/hooks/auth";

export default class GetUserGuilds {
    @RequireAuth
    static async handle(
        req: RequestInfo<void>,
        res: ResponseInfo<ScApiGetUserGuildsResponse>
    ) {
        const guilds = await req.session?.getGuilds();

        if (!guilds)
            throw new Unauthorized(ErrorCode.NotLoggedIn);

        const managable = guilds.filter(canManage);

        const premiums = await GuildPremiumModel.find({
            $or: managable
                .map(guild => {
                    return {
                        guild_id: guild.id
                    };
                })
        });

        res.status(200).json(
            managable.map(guild => {
                const premium = premiums.find(premium => premium.guild_id === guild.id);

                if (!premium)
                    return guild;

                return {
                    ...guild,
                    premium: {
                        guild_id: guild.id,
                        started_at: premium.started_at,
                        expires_at: premium.expires_at,
                        user_id: premium.user_id
                    }
                };
            })
        );
    }
}
