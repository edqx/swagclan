import * as zod from "zod";

import { CreateGuildApplicationCommandResponse } from "@wilsonjs/models";
import { ApiEndpoints } from "@wilsonjs/client";

import { ErrorCode, ScApiCreateGuildCommandResponse } from "@swagclan/shared";

import { GuildCommandModel } from "src/models/GuildCommand";
import { CustomCommandVersionModel } from "src/models/CustomCommandVersion";
import { CustomCommandIdModel } from "src/models/CustomCommandId";

import {
    Conflict,
    Forbidden,
    ResourceNotFound,
    Unauthorized
} from "src/api/responses";
import { app, RequestInfo, ResponseInfo } from "src/api";

import { CustomCommandDriver } from "src/drivers/CustomCommandDriver";

import { ValidateSchema } from "src/api/hooks/validate";
import { RequireAuth } from "src/api/hooks/auth";

export const CreateGuildCommandSchema = zod.object({
    command_id: zod.string(),
    command_version: zod.string(),
    enabled: zod.boolean(),
    timeout: zod.number(),
    config: zod.record(zod.any()),
    permissions: zod.array(
        zod.object({
            type: zod.string(),
            id: zod.string(),
            disallow: zod.boolean()
        })
    )
});

export default class CreateGuildCommand {
    @RequireAuth
    @ValidateSchema(CreateGuildCommandSchema)
    static async handle(
        req: RequestInfo<zod.infer<typeof CreateGuildCommandSchema>>,
        res: ResponseInfo<ScApiCreateGuildCommandResponse>
    ) {
        const user = await req.session?.getUser();

        if (!user)
            throw new Unauthorized(ErrorCode.NotLoggedIn);

        const num_guild_commands = await GuildCommandModel.countDocuments({
            guild_id: req.params.guildid
        });

        if (num_guild_commands >= 100)
            throw new Forbidden(ErrorCode.TooManyCommands);

        const guild_has_command = await GuildCommandModel.exists({
            guild_id: req.params.guildid,
            command_id: req.body.command_id
        });

        if (guild_has_command)
            throw new Conflict(ErrorCode.CommandAlreadyInGuild);

        const command_id = await CustomCommandIdModel.findOne({
            id: req.body.command_id,
            $or: [
                {
                    private: true,
                    author_id: user.id
                },
                {
                    private: false
                }
            ]
        });

        if (!command_id)
            throw new ResourceNotFound(ErrorCode.CommandNotFound);

        if (command_id.draft_guild_id)
            throw new Conflict(ErrorCode.DraftAlreadyInGuild);

        if (req.body.command_version === "draft" && command_id.author_id !== user.id)
            throw new Forbidden(ErrorCode.NotCommandAuthor);

        if (command_id.private && command_id.author_id !== user.id)
            throw new Forbidden(ErrorCode.CommandIsPrivate);

        const command_version = await CustomCommandVersionModel.findOne({
            command_id: req.body.command_id,
            version: req.body.command_version
        });

        if (!command_version)
            throw new ResourceNotFound(ErrorCode.CommandVersionNotFound);

        const app_command = await app.make<CreateGuildApplicationCommandResponse>(
            "POST",
            ApiEndpoints.CreateGuildApplicationCommand,
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
            /* Application ID */ process.env.CLIENT_ID,
            /* Guild ID */ req.params.guildid
        );

        const doc = await GuildCommandModel.create({
            ...req.body,
            application_command_id: app_command.id,
            guild_id: req.params.guildid,
            logs: []
        });

        await command_id.updateOne({
            $inc: {
                guild_count: 1
            },
            ...(req.body.command_version === "draft"
                ? { draft_guild_id: req.params.guildid }
                : {}
            )
        });

        res.status(200).json({
            application_command_id: app_command.id,
            guild_id: doc.guild_id,
            command_id: doc.command_id,
            command_version: doc.command_version,
            enabled: doc.enabled,
            timeout: doc.timeout,
            config: doc.config,
            permissions: doc.permissions,
            logs: doc.logs
        });
    }
}
