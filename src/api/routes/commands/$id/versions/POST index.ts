import * as zod from "zod";

import { CreateGuildApplicationCommandResponse } from "@wilsonjs/models";
import { ApiEndpoints } from "@wilsonjs/constants";
import { ErrorCode, ScApiCreateCommandVersionResponse } from "@swagclan/shared";

import { CustomCommandVersionModel } from "src/models/CustomCommandVersion";
import { CustomCommandIdModel } from "src/models/CustomCommandId";
import { GuildCommandModel } from "src/models/GuildCommand";

import { Conflict, Forbidden, Unauthorized } from "src/api/responses";
import { app, RequestInfo, ResponseInfo } from "src/api";

import { CustomCommandDriver } from "src/drivers/CustomCommandDriver";

import { ValidateSchema } from "src/api/hooks/validate";
import { RequireAuth } from "src/api/hooks/auth";

export const CreateCustomCommandVersionSchema = zod.object({
    version: zod.string(),
    trigger: zod
        .string()
        .regex(
            /^[\w-]{1,32}$/,
            "Name must be less than 32 characters and may only contain A-Z, a-z and -."
        ),
    config: zod.record(
        zod.object({
            name: zod.string(),
            description: zod.string(),
            type: zod.string(),
            initial: zod.any()
        })
    ),
    params: zod.array(
        zod.object({
            name: zod.string(),
            description: zod.string(),
            type: zod.string(),
            required: zod.boolean()
        })
    ),
    variables: zod.record(
        zod.object({
            name: zod.string(),
            type: zod.string()
        })
    ),
    actions: zod.record(
        zod.object({
            type: zod.string(),
            rule: zod.string(),
            parent: zod.string().optional(),
            next: zod.string().optional(),
            fields: zod.record(
                zod.object({
                    type: zod.string(),
                    id: zod.string()
                })
            )
        })
    ),
    first: zod.string()
});


export default class CreateCommandVersion {
    @RequireAuth
    @ValidateSchema(CreateCustomCommandVersionSchema)
    static async handle(
        req: RequestInfo<zod.infer<typeof CreateCustomCommandVersionSchema>>,
        res: ResponseInfo<ScApiCreateCommandVersionResponse>
    ) {
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
                    /* Application ID */ app.config.client.client_id,
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
    }
}
