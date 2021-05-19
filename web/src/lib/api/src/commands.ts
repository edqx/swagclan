import type {
    ScApiCreateCommandResponse,
    ScApiCreateCommandVersionRequest,
    ScApiCreateCommandVersionResponse,
    ScApiGetCommandResponse,
    ScApiGetCommandVersionResponse,
    ScApiUpdateCommandIdRequest,
    ScApiUpdateCommandResponse
} from "@swagclan/shared";

import { make } from "../request";
import { ApiEndpoints } from "./endpoints";
import { Resolvable, resolveId } from "./utils";

export interface GetCommandRequestOptions {
    getAuthor?: boolean;
}

export async function getCommand(command: Resolvable, options: GetCommandRequestOptions = {}): Promise<ScApiGetCommandResponse> {
    const commandid = resolveId(command);

    return await make("GET", ApiEndpoints.GetCommand(commandid), {
        query: {
            author: options.getAuthor || false
        }
    });
}

export async function createCommand(command: ScApiUpdateCommandIdRequest): Promise<ScApiCreateCommandResponse> {
    return await make("POST", ApiEndpoints.CreateCommand(), {
        body: JSON.stringify(command)
    });
}

export async function updateCommand(command: Resolvable, update: ScApiUpdateCommandIdRequest): Promise<ScApiUpdateCommandResponse> {
    const commandid = resolveId(command);

    return await make("PATCH", ApiEndpoints.UpdateCommand(commandid), {
        body: JSON.stringify(update)
    });
}

export async function deleteCommandVersion(command: Resolvable, version: string): Promise<void> {
    const commandid = resolveId(command);

    await make("DELETE", ApiEndpoints.DeleteCommandVersion(commandid, version));
}

export async function getCommandVersion(command: Resolvable, version: string): Promise<ScApiGetCommandVersionResponse> {
    const commandid = resolveId(command);

    return await make("GET", ApiEndpoints.GetCommandVersion(commandid, version));
}

export async function createCommandVersion(command: Resolvable, version: ScApiCreateCommandVersionRequest): Promise<ScApiCreateCommandVersionResponse> {
    const commandid = resolveId(command);

    return await make("GET", ApiEndpoints.CreateCommandVersion(commandid), {
        body: JSON.stringify(version)
    });
}

