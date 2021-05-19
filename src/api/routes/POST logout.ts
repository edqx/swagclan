import { RequestInfo, ResponseInfo } from "src/api";

export default class Logout {
    static async handle(
        req: RequestInfo<void>,
        res: ResponseInfo<"">
    ) {
        if (req.session) {
            await req.session.invalidate();
            res.cookie("session_id", 0, { maxAge: 0 });
        }

        res.status(204).end("");
    }
}
