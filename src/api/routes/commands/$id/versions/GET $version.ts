import { ErrorCode, ScApiGetCommandVersionResponse } from "@swagclan/shared";

import { CustomCommandVersionModel } from "src/models/CustomCommandVersion";

import { RequestInfo, ResponseInfo } from "src/api";
import { ResourceNotFound } from "src/api/responses";

export default class GetCommandVersion {
    static async handle(
        req: RequestInfo<void>,
        res: ResponseInfo<ScApiGetCommandVersionResponse>
    ) {
        const doc = await CustomCommandVersionModel.findOne({
            command_id: req.params.id,
            version: req.params.version
        });

        if (!doc)
            throw new ResourceNotFound(ErrorCode.CommandNotFound);

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
