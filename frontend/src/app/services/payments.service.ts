import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable, shareReplay, switchMap } from 'rxjs';
import { GetPaymentsResponse, AddPaymentResponse } from '../types/payments.types';
import { API_URL, POLLING_INTERVAL } from '../utils/constants';

@Injectable({
    providedIn: 'root'
})
export class PaymentsService {
    private paymentsPolling$: Observable<GetPaymentsResponse> = interval(POLLING_INTERVAL).pipe(
        switchMap(() => this.getPayments()),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    constructor(private http: HttpClient) { }

    getPollingPayments(): Observable<GetPaymentsResponse> {
        return this.paymentsPolling$;
    }

    getPayments(): Observable<GetPaymentsResponse> {
        return this.http.get<GetPaymentsResponse>(`${API_URL}/payments`);
    }

    addPayment(name: string, amount: number, secret: string): Observable<AddPaymentResponse> {
        return this.http.post<AddPaymentResponse>(`${API_URL}/payments/add`, { name, amount, secret });
    }
}
