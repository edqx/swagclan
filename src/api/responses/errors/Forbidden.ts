import { ErrorCode } from "@swagclan/shared";
import { HttpError } from "./HttpError";

export class Forbidden extends HttpError {
    constructor(details: ErrorCode) {
        super(
            403,
            "You are forbidden to view or modify this resource.",
            details
        );
    }
}
