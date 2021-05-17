import { v4 as uuidv4 } from "uuid";
import { ScApiCreateCommandResponse } from "@swagclan/shared";

import { CustomCommandIdModel } from "src/models/CustomCommandId";
import {
    CustomCommandRequest,
    CustomCommandRequestSchema
} from "src/api/schema/CustomCommandId";
import { AppReqHandler } from "src/api";

import { validateSchema } from "../../middleware/validate";
import { Unauthorized } from "src/api/responses";
import { ErrorCode } from "src/api/errors";
import { CustomCommandVersion, CustomCommandVersionModel } from "src/models/CustomCommandVersion";

export const middleware = [validateSchema(CustomCommandRequestSchema)];

const initial_version: Partial<CustomCommandVersion> = {
    version: "draft",
    trigger: "new-command",
    config: {},
    params: [],
    variables: {},
    actions: {
        mxfamvb: {
            type: "action",
            rule: "send_message",
            fields: {
                channel: {
                    type: "action_ref",
                    id: "lgrkdiu"
                },
                message: {
                    type: "input",
                    id: "Hello, world!"
                }
            }
        },
        lgrkdiu: {
            type: "action",
            rule: "channel",
            parent: "mxfamvb",
            fields: {}
        }
    },
    first: "mxfamvb"
};

export default (async (req, res) => {
    const user = await req.session?.getUser();

    if (!user)
        throw new Unauthorized(ErrorCode.NotLoggedIn);

    const doc = await CustomCommandIdModel.create({
        ...req.body,
        id: uuidv4(),
        author_id: user.id,
        versions: {},
        latest: null,
        first: null,
        deleted: false,
        guild_count: 0
    });

    await CustomCommandVersionModel.create({
        ...initial_version,
        command_id: doc.id
    });

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
}) as AppReqHandler<CustomCommandRequest, ScApiCreateCommandResponse>;
