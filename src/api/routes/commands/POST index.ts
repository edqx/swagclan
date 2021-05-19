import { v4 as uuidv4 } from "uuid";
import * as zod from "zod";

import {
    ErrorCode,
    ScApiCreateCommandResponse
} from "@swagclan/shared";

import { CustomCommandIdModel } from "src/models/CustomCommandId";

import {
    CustomCommandVersion,
    CustomCommandVersionModel
} from "src/models/CustomCommandVersion";

import { Unauthorized } from "src/api/responses";
import { RequestInfo, ResponseInfo } from "src/api";

import { ValidateSchema } from "src/api/hooks/validate";
import { RequireAuth } from "src/api/hooks/auth";

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

export const CreateCustomCommandSchema = zod.object({
    name: zod.string().max(20, "Name must be less than 20 characters in length."),
    summary: zod.string().max(200, "Summary must be less than 200 characters in length."),
    tags: zod.array(
        zod.string().max(20, "Trigger must be less than 20 characters in length.")
    ),
    thumbnail: zod.string(),
    deleted: zod.boolean(),
    private: zod.boolean()
});


export default class CreateCommand {
    @RequireAuth
    @ValidateSchema(CreateCustomCommandSchema)
    static async handle(
        req: RequestInfo<zod.infer<typeof CreateCustomCommandSchema>>,
        res: ResponseInfo<ScApiCreateCommandResponse>
    ) {
        const user = await req.session?.getUser();

        if (!user)
            throw new Unauthorized(ErrorCode.NotLoggedIn);

        (5 as any).hello.ok.aabc.agasfd;

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
    }
}
