import { HttpResponse } from "../Response";
import { ErrorCode } from "@swagclan/shared";

export class HttpError extends HttpResponse {
    constructor(
        public readonly code: number,
        public readonly message: string,
        public readonly details: ErrorCode
    ) {
        super(code);
    }
}
