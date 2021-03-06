import { ErrorCode, ScApiGetUserCommandsResponse } from "@swagclan/shared";

import { CustomCommandIdModel } from "src/models/CustomCommandId";
import { RequestInfo, ResponseInfo } from "src/api";
import { Unauthorized } from "../../../responses";
import { RequireAuth } from "src/api/hooks/auth";

export default class GetDeletedCommands {
    @RequireAuth
    static async handle(
        req: RequestInfo<void>,
        res: ResponseInfo<ScApiGetUserCommandsResponse>
    ) {
        const user = await req.session?.getUser();

        if (!user)
            throw new Unauthorized(ErrorCode.NotLoggedIn);

        const docs = await CustomCommandIdModel.find({
            author_id: user.id,
            deleted: false
        })
            .sort({ guild_count: -1 })
            .exec();

        res.status(200).json(
            docs.map((doc) => ({
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
            }))
        );
    }
}
