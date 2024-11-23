import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { AddPaymentResponse, GetPaymentsResponse } from '../types/payments.types';
import { API_URL, POLLING_INTERVAL } from '../utils/constants';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
    let service: PaymentsService,
        httpMock: HttpTestingController;

    const mockGridValues: string[][] = [
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                PaymentsService,
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });
        service = TestBed.inject(PaymentsService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('Should be created', () => {
        expect(service).toBeTruthy();
    });

    it('Should get the payments list', () => {
        const mockResponse: GetPaymentsResponse = {
            payments: [
                { name: 'John', amount: 100, secret: '12', grid: mockGridValues },
                { name: 'Jane', amount: 200, secret: '45', grid: mockGridValues }
            ],
        };

        service.getPayments().subscribe(response => {
            expect(response).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(`${API_URL}/payments`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('Should add a payment successsfully', () => {
        const mockResponse: AddPaymentResponse = { message: 'Bias set successfully' };

        service.addPayment('Payment 1', 100, '12').subscribe(response => {
            expect(response).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(`${API_URL}/payments/add`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ name: 'Payment 1', amount: 100, secret: '12' });
        req.flush(mockResponse);
    });

    it('Should poll payments at regular intervals', fakeAsync(() => {
        const mockResponse: GetPaymentsResponse = {
            payments: [
                { name: 'John', amount: 100, secret: '12', grid: mockGridValues },
                { name: 'Jane', amount: 200, secret: '45', grid: mockGridValues }
            ],
        };

        let callCount = 0;

        const subscription = service.getPollingPayments().subscribe(response => {
            expect(response).toEqual(mockResponse);
            callCount++;
        });

        // Request 1
        tick(POLLING_INTERVAL);
        const req1 = httpMock.expectOne(`${API_URL}/payments`);
        req1.flush(mockResponse);

        // Request 2
        tick(POLLING_INTERVAL);
        const req2 = httpMock.expectOne(`${API_URL}/payments`);
        req2.flush(mockResponse);

        subscription.unsubscribe();
        tick();

        expect(callCount).toBe(2);
    }));

    it('Should handle http errors', () => {
        service.getPayments().subscribe({
            error: (error) => {
                expect(error.status).toBe(404);
            }
        });

        const req = httpMock.expectOne(`${API_URL}/payments`);
        req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
});
