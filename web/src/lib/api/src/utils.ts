export type Resolvable = string|{ id: string };

export function resolveId(resolvable: Resolvable): string {
    if (typeof resolvable === "string") {
        return resolvable;
    }

    return resolvable.id;
}
