export interface ScApiBasicGuildCommandPermission {
    type: string;
    id: string;
    disallow: boolean;
}

export interface ScApiBasicGuildCommandRunError {
    version: string;
    position: string;
    reason: number;
    snapshot: any;
}

export interface ScApiBasicGuildCommand {
    application_command_id: string;
    guild_id: string;
    command_id: string;
    command_version: string;
    enabled: boolean;
    timeout: number;
    config: Record<string, any>;
    permissions: ScApiBasicGuildCommandPermission[];
    logs: ScApiBasicGuildCommandRunError[];
}
