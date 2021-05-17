import { ScApiBasicGuildCommandPermission } from "../../basic";

export interface ScApiCreateGuildCommandRequest {
    command_id: string;
    command_version: string;
    enabled: boolean;
    timeout: number;
    config: Record<string, any>;
    permissions: ScApiBasicGuildCommandPermission[];
}
