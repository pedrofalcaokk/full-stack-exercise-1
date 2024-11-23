export interface Payment {
    name: string;
    amount: number;
    grid: string[][];
    secret: string;
}

export interface GetPaymentsResponse {
    payments: Payment[];
}

export interface AddPaymentResponse {
    error?: string;
    message?: string;
}
