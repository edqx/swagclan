export interface ScApiBasicCommandIdVersionDecl {
    id: string;
    created_at: string;
    before: string|null;
    after: string|null;
}

export interface ScApiBasicCommandId {
    id: string;
    draft_guild_id?: string;
    name: string;
    summary: string;
    tags: string[];
    thumbnail: string;
    author_id: string;
    private: boolean;
    deleted: boolean;
    versions: Record<string, ScApiBasicCommandIdVersionDecl>;
    latest: string;
    first: string;
    guild_count: number;
}
