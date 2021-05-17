export interface ScApiCreateCommandIdRequest {
    name: string;
    summary: string;
    tags: string[];
    thumbnail: string;
    deleted: boolean;
    private: boolean;
}
