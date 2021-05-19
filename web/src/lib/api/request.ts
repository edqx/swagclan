import { VITE_BASE_API } from "$lib/env";
import type { ScApiErrorResponse } from "@swagclan/shared";

export type HttpMethod = "GET"|"POST"|"PATCH"|"PUT"|"DELETE";

const base_api = VITE_BASE_API;

export interface MakeRequestOptions extends RequestInit {
    query?: Record<string, number|string|boolean>;
}

export async function make<ResponseType = "">(method: HttpMethod, path: string, options: MakeRequestOptions = {}): Promise<ResponseType> {
    let url = path.startsWith("https")
        ? path
        : base_api + path;

    if (options.query) {
        const entries = Object.entries(options.query);
        const parts = entries
            .map(([ key, value ]) => {
                return key + "=" + encodeURIComponent(value);
            });

        if (parts.length) {
            url += "?" + parts.join("&");
        }
    }

    const res = await fetch(url, {
        method,
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        },
        credentials: "include"
    });

    if (res.ok) {
        if (res.headers.get("Content-Type")?.includes("application/json")) {
            return await res.json() as ResponseType;
        } else {
            return await res.text() as unknown as ResponseType;
        }
    } else {
        try {
            const json = await res.json() as ScApiErrorResponse;

            throw {
                status: json.code,
                details: json.details,
                error: new Error(url + ": " + json.message + " (" + json.details + ")")
            };
        } catch (e) {
            if (e.details)
                throw e;

            throw res;
        }
    }
}
