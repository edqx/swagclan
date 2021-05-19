import { HttpError } from "./HttpError";
import { ErrorCode } from "@swagclan/shared";

export class InternalServerError extends HttpError {
    constructor(details: ErrorCode, public readonly uuid: string) {
        super(
            500,
            "An internal server error occurred while processing your request.",
            details
        );
    }
}
