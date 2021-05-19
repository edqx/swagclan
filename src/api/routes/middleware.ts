import { ErrorCode } from "@swagclan/shared";

import { Unauthorized } from "../responses";
import { UserSession } from "../Session";

export default [
    async (req, res) => {
        if (req.cookies.session_id) {
            req.session = await UserSession.from(req.cookies.session_id);

            if (typeof req.session.access_token === "undefined")
                return;

            if (process.env.NODE_ENV !== "development") {
                if (req.session.ip !== req.ip || req.session.userAgent !== req.header("User-Agent")) {
                    await req.session.invalidate();
                    res.cookie("session_id", 0, { maxAge: 0 });
                    throw new Unauthorized(ErrorCode.InvalidSession);
                }
            }
        }
    }
];
