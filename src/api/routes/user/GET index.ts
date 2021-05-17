import { ScApiGetUserResponse } from "@swagclan/shared";

import { AppReqHandler } from "src/api";
import { ErrorCode } from "src/api/errors";
import { Unauthorized } from "src/api/responses";

export default (async (req, res) => {
    if (!req.session)
        throw new Unauthorized(ErrorCode.NotLoggedIn);

    const user = await req.session.getUser();

    if (!user)
        throw new Unauthorized(ErrorCode.NotLoggedIn);

    res.status(200).json(user);
}) as AppReqHandler<void, ScApiGetUserResponse>;
