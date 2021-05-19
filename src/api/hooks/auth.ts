import { NextFunction } from "express";
import { ErrorCode } from "@swagclan/shared";

import { AppReqHandler, RequestInfo, ResponseInfo } from "src/api";
import { Unauthorized } from "../responses";

export function RequireAuth(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<AppReqHandler<any, any>>) {
    if (!descriptor.value)
        return;

    const method = descriptor.value;

    descriptor.value = async function (req: RequestInfo<any>, res: ResponseInfo<any>, next?: NextFunction) {
        if (!req.session?.access_token) {
            throw new Unauthorized(ErrorCode.NotLoggedIn);
        }

        /*const user = await req.session.getUser();

        if (!user)
            throw new Unauthorized(ErrorCode.NotLoggedIn);*/

        return method.apply(this, [ req, res, next ]);
    };
}
