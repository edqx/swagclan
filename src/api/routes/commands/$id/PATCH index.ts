
import { CreateGuildApplicationCommandResponse } from "@wilsonjs/models";
import { ApiEndpoints } from "@wilsonjs/constants";

import { ScApiUpdateCommandResponse } from "@swagclan/shared";

import { CustomCommandIdModel } from "src/models/CustomCommandId";
import {
    CustomCommandRequest,
    CustomCommandRequestSchema
} from "src/api/schema/CustomCommandId";

import { AppReqHandler, app } from "src/api";

import { validateSchema } from "../../../middleware/validate";
import { Forbidden, Unauthorized } from "src/api/responses";
import { ErrorCode } from "src/api/errors";
import { GuildCommandModel } from "src/models/GuildCommand";
import { CustomCommandDriver } from "src/drivers/CustomCommandDriver";
import { CustomCommandVersionModel } from "src/models/CustomCommandVersion";

export const middleware = [
    validateSchema(CustomCommandRequestSchema.partial())
];

export default (async (req, res) => {
    const user = await req.session?.getUser();

    if (!user)
        throw new Unauthorized(ErrorCode.NotLoggedIn);

    const doc = await CustomCommandIdModel.findOneAndUpdate(
        {
            id: req.params.id,
            author_id: user.id
        },
        { $set: req.body },
        { new: true }
    );

    if (!doc)
        throw new Forbidden(ErrorCode.NotCommandAuthor);

    if (doc.draft_guild_id) {
        const guild_doc = await GuildCommandModel.findOne({
            guild_id: doc.draft_guild_id,
            command_id: doc.id,
            command_version: "draft"
        });

        if (guild_doc) {
            const version = await CustomCommandVersionModel.findOne({
                command_id: doc.id,
                version: "draft"
            });

            if (version) {
                await app.make<CreateGuildApplicationCommandResponse>(
                    "PATCH",
                    ApiEndpoints.EditGuildApplicationCommand,
                    {
                        body: JSON.stringify(
                            CustomCommandDriver.createDiscordInteraction(
                                doc,
                                version
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
    }

    res.status(200).json({
        id: doc.id,
        name: doc.name,
        summary: doc.summary,
        tags: doc.tags,
        thumbnail: doc.thumbnail,
        author_id: doc.author_id,
        private: doc.private,
        deleted: doc.deleted,
        versions: doc.versions,
        latest: doc.latest,
        first: doc.first,
        guild_count: doc.guild_count
    });
}) as AppReqHandler<Partial<CustomCommandRequest>, ScApiUpdateCommandResponse>;
