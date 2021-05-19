import { ErrorCode, ScApiGetUserResponse } from "@swagclan/shared";

import { RequestInfo, ResponseInfo } from "src/api";
import { RequireAuth } from "src/api/hooks/auth";
import { Unauthorized } from "src/api/responses";

export default class GetUser {
    @RequireAuth
    static async handle(
        req: RequestInfo<void>,
        res: ResponseInfo<ScApiGetUserResponse>
    ) {
        if (!req.session)
            throw new Unauthorized(ErrorCode.NotLoggedIn);

        const user = await req.session.getUser();

        if (!user)
            throw new Unauthorized(ErrorCode.NotLoggedIn);

        res.status(200).json(user);
    }
}
