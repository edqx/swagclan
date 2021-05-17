import { ScApiGetCommandResponse } from "@swagclan/shared";

import { GetUserResponse } from "@wilsonjs/models";
import { ApiEndpoints } from "@wilsonjs/constants";

import { CustomCommandIdModel } from "src/models/CustomCommandId";
import { AppReqHandler, app } from "src/api";

import { ResourceNotFound } from "src/api/responses";
import { ErrorCode } from "src/api/errors";

async function getUser(id: string): Promise<GetUserResponse|null> {
    const cached = await app.redis.get("user." + id);

    if (cached && typeof cached === "string") {
        // tedis can return a number
        return JSON.parse(cached);
    }

    try {
        const user = await app.make<GetUserResponse>(
            "GET",
            ApiEndpoints.GetUser,
            {
                headers: {
                    Authorization: "Bot " + process.env.BOT_TOKEN
                }
            },
            /* User ID */ id
        );

        await app.redis.set("user." + id, JSON.stringify(user));
        await app.redis.expire("user." + id, 30);

        return user;
    } catch (e) {
        return null;
    }
}

export default (async (req, res) => {
    const doc = await CustomCommandIdModel.findOne({ id: req.params.id });

    const user = await req.session?.getUser();

    if (!doc)
        throw new ResourceNotFound(ErrorCode.CommandNotFound);

    if (doc.deleted)
        throw new ResourceNotFound(ErrorCode.CommandNotFound);

    if (user?.id !== doc.author_id) {
        doc.draft_guild_id = undefined;
    }

    if (req.query.author == "true") {
        const author = await getUser(doc.author_id);

        if (author) {
            return res.status(200).json({
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
                guild_count: doc.guild_count,
                author
            });
        }
    }

    res.status(200).json({
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
    });
}) as AppReqHandler<void, ScApiGetCommandResponse>;
