export interface RateLimitRule{
    id: number;
    rule_type: string;
    ruquest_limit: number;
    window_second: number;
    update_at: Date;
    description?: string;
}

export interface ClientApiKey {
    api_key: string;
    client_name: string;
    rule_id: number;
    is_active: boolean;
    created_at: Date;
}

export interface RateLimitResult {
    allowed: boolean;
    message?: string;
    remainig: number;
    limit: number;
    reset: Date;
    window: number;
}