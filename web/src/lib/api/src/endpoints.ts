export const ApiEndpoints = {
    DeleteCommandVersion: (id: string, version: string): string => `/commands/${id}/versions/${version}`,
    GetCommandVersion: (id: string, version: string): string => `/commands/${id}/versions/${version}`,
    CreateCommandVersion: (id: string): string => `/commands/${id}/version`,

    GetCommand: (id: string): string => `/commands/${id}`,
    UpdateCommand: (id: string): string => `/commands/${id}`,

    CreateCommand: (): string => `/commands`,
    SearchCommands: (): string => `/commands`,

    RemoveGuildCommand: (guildid: string, id: string): string => `/guilds/${guildid}/commands/${id}`,
    GetGuildCommand: (guildid: string, id: string): string => `/guilds/${guildid}/commands/${id}`,
    UpdateGuildCommand: (guildid: string, id: string): string => `/guilds/${guildid}/commands/${id}`,

    GetGuildCommands: (guildid: string): string => `/guilds/${guildid}/commands`,
    CreateGuildCommand: (guildid: string): string => `/guilds/${guildid}/commands`,

    GetGuild: (guildid: string): string => `/guilds/${guildid}`,

    GetCommandAvailableGuilds: (id: string): string => `/user/commands/${id}/available-guilds`,
    GetDeletedCommands: (): string => `/user/commands/deleted`,
    GetCommands: (): string => `/user/commands`,

    GetGuilds: (): string => `/user/guilds`,
    GetUser: (): string => `/user`,

    GetExchange: (): string => `/exchange`,
    Logout: (): string => `/logout`
};
