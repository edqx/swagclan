import { ScApiBasicCommandAction, ScApiBasicCommandIdVersionDecl, ScApiBasicCommandParam, ScApiBasicCommandVariable } from "../../basic";

export interface ScApiCreateCommandVersionRequest {
    version: string;
    trigger: string;
    config: Record<string, ScApiBasicCommandIdVersionDecl>;
    params: ScApiBasicCommandParam[];
    variables: Record<string, ScApiBasicCommandVariable>;
    actions: Record<string, ScApiBasicCommandAction>;
    first: string;
}
