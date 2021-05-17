import { AppReqHandler } from "..";
import { ErrorCode } from "../errors";
import { Unauthorized } from "../responses";
import { Session } from "../Session";

export function authUser(): AppReqHandler<any, any> {
    return async function (req, res) {
        if (req.cookies.session_id) {
            req.session = new Session(req.cookies.session_id);

            await req.session.check();

            if (typeof req.session.ip === "undefined" || typeof req.session.userAgent === "undefined")
                return;

            if (process.env.NODE_ENV !== "development") {
                if (req.session.ip !== req.ip || req.session.userAgent !== req.header("User-Agent")) {
                    await req.session.invalidate();
                    res.cookie("session_id", 0, { maxAge: 0 });
                    throw new Unauthorized(ErrorCode.InvalidSession);
                }
            }
        }
    };
}
