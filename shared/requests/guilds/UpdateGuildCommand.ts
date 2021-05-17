import { ScApiCreateGuildCommandRequest } from "./CreateGuildCommand";

export type ScApiUpdateGuildCommand = Omit<ScApiCreateGuildCommandRequest, "command_id">;
