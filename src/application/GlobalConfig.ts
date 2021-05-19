export interface MongoCredentials {
    host: string;
    port: number;
    username?: string;
    password?: string;
    database: string;
}

export interface RedisCredentials {
    host: string;
    port: number;
    password: string;
}

export interface APIConfig {
    port: number;
}

export interface OAuthConfig {
    scopes: string[];
    permissions: string;
}

export interface AppClientConfig {
    client_id: string;
    client_secret: string;
}

export interface BotConfig {
    bot_token: string;
}

export interface WebhookConfig {
    webhook_id: string;
    webhook_token: string;
}

export interface GlobalConfig {
    mongo: MongoCredentials;
    redis: RedisCredentials;
    api: APIConfig;
    base_api: string;
    base_web: string;
    oauth: OAuthConfig;
    dev_guild: string;
    client: AppClientConfig;
    bot: BotConfig;
    webhook: WebhookConfig;
}
