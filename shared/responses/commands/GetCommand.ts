import { BasicUser } from "@wilsonjs/models";
import { ScApiBasicCommandId } from "../../basic";

export interface ScApiGetCommandResponse extends ScApiBasicCommandId {
    author?: BasicUser;
}
