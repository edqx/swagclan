import { ErrorCode, ScApiGetCommandAvailableGuildsResponse } from "@swagclan/shared";

import { GuildCommandModel } from "src/models/GuildCommand";
import { GuildPremiumModel } from "src/models/GuildPremium";

import { RequestInfo, ResponseInfo } from "src/api";
import { Unauthorized } from "src/api/responses";

import { canManage } from "../../../guilds/$guildid/middleware";
import { RequireAuth } from "src/api/hooks/auth";

export default class GetCommandAvailableGuilds {
    @RequireAuth
    static async handle(
        req: RequestInfo<void>,
        res: ResponseInfo<ScApiGetCommandAvailableGuildsResponse>
    ) {
        const guilds = await req.session?.getGuilds();

        if (!guilds)
            throw new Unauthorized(ErrorCode.NotLoggedIn);

        const managable = guilds.filter(canManage);

        const commands = await GuildCommandModel.find({
            $or: managable
                .map(guild => {
                    return {
                        guild_id: guild.id
                    };
                }),
            command_id: req.params.id
        });

        const available = managable
            .filter(guild => commands
                .every(gc => gc.guild_id !== guild.id)
            );

        const premiums = available.length ? await GuildPremiumModel.find({
            $or: available
                .map(guild => {
                    return {
                        guild_id: guild.id
                    };
                })
        }) : [];

        res.status(200).json(
            available.map(guild => {
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
