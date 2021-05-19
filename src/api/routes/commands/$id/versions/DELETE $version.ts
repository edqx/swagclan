import { ScApiDeleteCommandVersionResponse, ErrorCode } from "@swagclan/shared";

import { GuildCommandModel } from "src/models/GuildCommand";
import { CustomCommandIdModel } from "src/models/CustomCommandId";
import { CustomCommandVersionModel } from "src/models/CustomCommandVersion";

import {
    BadRequest,
    Forbidden,
    ResourceNotFound,
    Unauthorized
} from "src/api/responses";

import { RequestInfo, ResponseInfo } from "src/api";
import { RequireAuth } from "src/api/hooks/auth";

export default class DeleteCommandVersion {
    @RequireAuth
    static async handle(
        req: RequestInfo<void>,
        res: ResponseInfo<ScApiDeleteCommandVersionResponse>
    ) {
        const user = await req.session?.getUser();

        if (!user)
            throw new Unauthorized(ErrorCode.NotLoggedIn);

        if (req.params.version === "draft")
            throw new BadRequest(ErrorCode.CannotDeleteCommandDraft);

        const command_id = await CustomCommandIdModel.findOne({
            id: req.params.id,
            author_id: user.id
        });

        if (!command_id)
            throw new Forbidden(ErrorCode.NotCommandAuthor);

        const doc = await CustomCommandVersionModel.findOne({
            command_id: req.params.id,
            version: req.params.version
        }).exec();

        if (!doc)
            throw new ResourceNotFound(ErrorCode.CommandVersionNotFound);

        const guilds = await GuildCommandModel.count({
            command_id: req.params.id,
            command_version: req.params.version2
        });

        if (guilds)
            throw new Forbidden(ErrorCode.CommandVersionUsed);

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
