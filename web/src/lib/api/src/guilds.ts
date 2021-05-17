import type {
    ScApiCreateGuildCommandRequest,
    ScApiCreateGuildCommandResponse,
    ScApiGetGuildCommandsResponse,
    ScApiGetGuildResponse
} from "@swagclan/shared";

import { make } from "../request";
import { ApiEndpoints } from "./endpoints";
import { Resolvable, resolveId } from "./utils";

export async function getGuild(guild: Resolvable): Promise<ScApiGetGuildResponse> {
    const guildid = resolveId(guild);

    return await make("GET", ApiEndpoints.GetGuild(guildid));
}

export async function getGuildCommands(guild: Resolvable): Promise<ScApiGetGuildCommandsResponse> {
    const guildid = resolveId(guild);

    return await make("GET", ApiEndpoints.GetGuildCommands(guildid));
}

export async function getGuildCommand(guild: Resolvable, command: Resolvable): Promise<ScApiGetGuildCommandsResponse> {
    const guildid = resolveId(guild);
    const commandid = resolveId(command);

    return await make("GET", ApiEndpoints.GetGuildCommand(guildid, commandid));
}

export async function createGuildCommand(guild: Resolvable, command: ScApiCreateGuildCommandRequest): Promise<ScApiCreateGuildCommandResponse> {
    const guildid = resolveId(guild);

    return await make("POST", ApiEndpoints.CreateGuildCommand(guildid), {
        body: JSON.stringify(command)
    });
}

export async function removeGuildCommand(guild: Resolvable, command: Resolvable): Promise<ScApiGetGuildCommandsResponse> {
    const guildid = resolveId(guild);
    const commandid = resolveId(command);

    return await make("DELETE", ApiEndpoints.RemoveGuildCommand(guildid, commandid));
}
