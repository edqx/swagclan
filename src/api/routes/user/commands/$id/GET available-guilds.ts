import { ScApiGetCommandAvailableGuildsResponse } from "@swagclan/shared";

import { AppReqHandler } from "src/api";
import { ErrorCode } from "src/api/errors";
import { Unauthorized } from "src/api/responses";
import { GuildCommandModel } from "src/models/GuildCommand";
import { GuildPremiumModel } from "src/models/GuildPremium";

import { canManage } from "../../../guilds/$guildid/middleware";

export default (async (req, res) => {
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
}) as AppReqHandler<void, ScApiGetCommandAvailableGuildsResponse>;
