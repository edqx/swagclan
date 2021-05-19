import { HttpError } from "./HttpError";
import { ErrorCode } from "@swagclan/shared";

export class ResourceNotFound extends HttpError {
    constructor(details: ErrorCode) {
        super(404, "Could not locate the requested resource.", details);
    }
}
