import { BasicUser, GetUserResponse } from "@wilsonjs/models";
import { ApiEndpoints } from "@wilsonjs/constants";
import { ErrorCode, ScApiGetCommandResponse } from "@swagclan/shared";

import { CustomCommandIdModel } from "src/models/CustomCommandId";

import { ResourceNotFound } from "src/api/responses";
import { app, RequestInfo, ResponseInfo } from "src/api";
import { Cached } from "src/api/Session";

async function getUser(id: string): Promise<GetUserResponse|null> {
    const cached = app.cache.get("user." + id) as Cached<BasicUser>;

    if (cached) {
        if (Date.now() > cached.cached_at + 30000) {
            return cached;
        }
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

        await app.cache.set("user." + id, {
            ...user,
            cached_at: Date.now()
        });

        return user;
    } catch (e) {
        return null;
    }
}

export default class GetCommand {
    static async handle(
        req: RequestInfo<void>,
        res: ResponseInfo<ScApiGetCommandResponse>
    ) {
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
    }
}
