import { CreateGuildApplicationCommandResponse } from "@wilsonjs/models";
import { ApiEndpoints } from "@wilsonjs/constants";

import { ScApiCreateCommandVersionResponse } from "@swagclan/shared";

import { CustomCommandVersionModel } from "src/models/CustomCommandVersion";

import {
    CustomCommandVersionRequest,
    CustomCommandVersionRequestSchema
} from "src/api/schema/CustomCommandVersion";

import { AppReqHandler, app } from "src/api";

import { validateSchema } from "src/api/middleware/validate";
import { Conflict, Forbidden, Unauthorized } from "src/api/responses";
import { CustomCommandIdModel } from "src/models/CustomCommandId";
import { ErrorCode } from "src/api/errors";
import { GuildCommandModel } from "src/models/GuildCommand";
import { CustomCommandDriver } from "src/drivers/CustomCommandDriver";

export const middleware = [validateSchema(CustomCommandVersionRequestSchema)];

export default (async (req, res) => {
    const user = await req.session?.getUser();

    if (!user)
        throw new Unauthorized(ErrorCode.NotLoggedIn);

    const command = await CustomCommandIdModel.findOne({
        id: req.params.id,
        author_id: user.id
    });

    if (!command)
        throw new Forbidden(ErrorCode.NotCommandAuthor);

    if (req.body.version !== "draft") {
        if (command.versions[req.body.version])
            throw new Conflict(ErrorCode.CannotOverwriteVersion);

        if (!command.first) {
            command.first = req.body.version;
        }

        if (command.latest) {
            command.versions[command.latest].after = req.body.version;
        }

        command.versions[req.body.version] = {
            id: req.body.version,
            created_at: new Date().toISOString(),
            before: command.latest,
            after: null
        };

        command.latest = req.body.version;
    }

    const doc = await CustomCommandVersionModel.findOneAndUpdate(
        { command_id: req.params.id, version: req.body.version },
        {
            ...req.body,
            command_id: req.params.id
        },
        { upsert: true, new: true }
    ); // Update & upsert in case the version is "draft"

    command.markModified("versions");
    await command.save();

    if (req.body.version === "draft" && command.draft_guild_id) {
        const guild_doc = await GuildCommandModel.findOne({
            guild_id: command.draft_guild_id,
            command_id: req.params.id,
            command_version: "draft"
        });

        if (guild_doc) {
            await app.make<CreateGuildApplicationCommandResponse>(
                "PATCH",
                ApiEndpoints.EditGuildApplicationCommand,
                {
                    body: JSON.stringify(
                        CustomCommandDriver.createDiscordInteraction(
                            command,
                            doc
                        )
                    ),
                    headers: {
                        "Content-Type": "application/json"
                    }
                },
                /* Application ID */ process.env.CLIENT_ID,
                /*       Guild ID */ guild_doc.guild_id,
                /*     Command ID */ guild_doc.application_command_id
            );
        }
    }

    res.status(200).json({
        command_id: doc.command_id,
        version: doc.version,
        trigger: doc.trigger,
        config: doc.config,
        params: doc.params,
        variables: doc.variables,
        actions: doc.actions,
        first: doc.first
    });
}) as AppReqHandler<CustomCommandVersionRequest, ScApiCreateCommandVersionResponse>;
