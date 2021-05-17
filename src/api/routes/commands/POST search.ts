import { ScApiSearchCommandsResponse } from "@swagclan/shared";

import { CustomCommandIdModel } from "src/models/CustomCommandId";

import {
    CustomCommandSearchRequest,
    CustomCommandSearchRequestSchema
} from "src/api/schema/CustomCommandSearch";

import { validateSchema } from "src/api/middleware/validate";
import { AppReqHandler } from "src/api";

export const middleware = [validateSchema(CustomCommandSearchRequestSchema)];

export default (async (req, res) => {
    const user = await req.session?.getUser();

    const docs = await CustomCommandIdModel.find(
        req.body.tags ? { tags: { $all: req.body.tags } } : {}
    )
        .sort({ guild_count: -1 })
        .skip((req.body.page || 0) * 20)
        .limit(20)
        .exec();

    res.status(200).json(
        docs.map((doc) => {
            if (doc.author_id !== user?.id) {
                doc.draft_guild_id = undefined;
            }

            return {
                id: doc.id,
                draft_guild_id: doc.draft_guild_id,
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
            };
        })
    );
}) as AppReqHandler<CustomCommandSearchRequest, ScApiSearchCommandsResponse>;
