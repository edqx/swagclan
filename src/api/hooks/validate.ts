import * as zod from "zod";
import { NextFunction } from "express";
import { ErrorCode } from "@swagclan/shared";

import { BadRequest } from "../responses";
import { AppReqHandler, RequestInfo, ResponseInfo } from "src/api";

class InvalidSchemaResponse extends BadRequest {
    constructor(public readonly info: any) {
        super(ErrorCode.BodyDoesNotMatchSchema);
    }
}

export function ValidateSchema<T extends zod.ZodType<any>>(
    schema: T
) {
    return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<AppReqHandler<zod.infer<T>, any>>) {
        if (!descriptor.value)
            return;

        const method = descriptor.value;

        descriptor.value = async function (req: RequestInfo<T>, res: ResponseInfo<any>, next?: NextFunction) {
            const result = schema.safeParse(req.body);

            if (result.success === false) {
                throw new InvalidSchemaResponse(result.error);
            }

            return method.apply(this, [ req, res, next ]);
        };
    };
}
