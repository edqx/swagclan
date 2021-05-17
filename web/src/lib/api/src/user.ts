import type {
    ScApiGetCommandAvailableGuildsResponse,
    ScApiGetCommandResponse,
    ScApiGetUserGuildsResponse,
    ScApiGetUserResponse
} from "@swagclan/shared";

import { make } from "../request";
import { ApiEndpoints } from "./endpoints";
import { Resolvable, resolveId } from "./utils";

export async function getUser(): Promise<ScApiGetUserResponse> {
    return await make("GET", ApiEndpoints.GetUser());
}

export async function getGuilds(): Promise<ScApiGetUserGuildsResponse> {
    return await make("GET", ApiEndpoints.GetGuilds());
}

export async function getCommands(): Promise<ScApiGetCommandResponse> {
    return await make("GET", ApiEndpoints.GetCommands());
}

export async function getCommandAvailableGuilds(resolvable: Resolvable): Promise<ScApiGetCommandAvailableGuildsResponse> {
    const id = resolveId(resolvable);

    return await make("GET", ApiEndpoints.GetCommandAvailableGuilds(id));
}

export async function logout(): Promise<void> {
    await make("POST", ApiEndpoints.Logout());
}
