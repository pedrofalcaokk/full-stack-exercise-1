export interface GridResponse {
    values: string[][];
    timestamp: string;
    secret: string;
}

export interface BiasResponse {
    error?: string;
    remainingTime?: number;
    message?: string;
}
