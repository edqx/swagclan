import { CreateGuildApplicationCommandResponse } from "@wilsonjs/models";
import { ApiEndpoints } from "@wilsonjs/constants";
import { ErrorCode, ScApiRemoveGuildCommandResponse } from "@swagclan/shared";

import { CustomCommandIdModel } from "src/models/CustomCommandId";
import { CustomCommandVersionModel } from "src/models/CustomCommandVersion";
import { GuildCommandModel } from "src/models/GuildCommand";

import { app, RequestInfo, ResponseInfo } from "src/api";
import { ResourceNotFound } from "src/api/responses";

import { CustomCommandDriver } from "src/drivers/CustomCommandDriver";
import { RequireAuth } from "src/api/hooks/auth";

export default class RemoveGuildCommand {
    @RequireAuth
    static async handle(
        req: RequestInfo<void>,
        res: ResponseInfo<ScApiRemoveGuildCommandResponse>
    ) {
        const command_id = await CustomCommandIdModel.findOne({
            id: req.params.id
        });

        if (!command_id)
            throw new ResourceNotFound(ErrorCode.CommandNotFound);

        const doc = await GuildCommandModel.findOne({
            guild_id: req.params.guildid,
            command_id: req.params.id
        });

        if (!doc)
            throw new ResourceNotFound(ErrorCode.CommandNotInGuild);

        const command_version = await CustomCommandVersionModel.findOne({
            command_id: req.params.id,
            version: doc.command_version
        });

        if (!command_version)
            throw new ResourceNotFound(ErrorCode.CommandVersionNotFound);

        try {
            await app.make<CreateGuildApplicationCommandResponse>(
                "DELETE",
                ApiEndpoints.EditGuildApplicationCommand,
                {
                    body: JSON.stringify(
                        CustomCommandDriver.createDiscordInteraction(
                            command_id,
                            command_version
                        )
                    ),
                    headers: {
                        "Content-Type": "application/json"
                    }
                },
                /* Application ID */ app.config.client.client_id,
                /*       Guild ID */ req.params.guildid,
                /*     Command ID */ doc.application_command_id
            );
        } catch (e) {
            app.logger.warn("An error occurred while deleting a command:", e);
        }

        await doc.deleteOne();

        await command_id.updateOne({
            $inc: {
                guild_count: -1
            },
            ...(command_id.draft_guild_id
                ? {
                    $unset: {
                        draft_guild_id: 1
                    }
                }
                : {}
            )
        });

        if (command_version.version === "draft") {
            await command_id.updateOne({
                draft_guild_id: undefined
            });
        }

        res.status(204).end("");
    }
}
