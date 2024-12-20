import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { BiasResponse, GridResponse } from '../types/grid.types';
import { API_URL, POLLING_INTERVAL } from '../utils/constants';
import { GridService } from './grid.service';

describe('GridService', () => {
    let service: GridService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                GridService,
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });
        service = TestBed.inject(GridService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('Should be created', () => {
        expect(service).toBeTruthy();
    });

    it('Should get grid data', () => {
        const mockGridResponse: GridResponse = {
            values: [['a', 'b'], ['c', 'd']],
            timestamp: '2023-12-25T12:00:00Z',
            secret: '12'
        };

        service.getPollingGrid().subscribe(response => {
            expect(response).toEqual(mockGridResponse);
        });

        const req = httpMock.expectOne(`${API_URL}/grid`);
        expect(req.request.method).toBe('GET');
        req.flush(mockGridResponse);
    });

    it('Should set bias correctly', () => {
        const mockResponse: BiasResponse = { message: 'Bias set successfully' };

        service.setBias('a').subscribe(response => {
            expect(response).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(`${API_URL}/grid/set-bias`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ bias: 'a' });
        req.flush(mockResponse);
    });

    it('Should poll grid data at intervals', fakeAsync(() => {
        const mockGridResponse: GridResponse = {
            values: [['a', 'b'], ['c', 'd']],
            timestamp: '2023-12-25T12:00:00Z',
            secret: '12'
        };

        let callCount = 0;

        const subscription = service.getPollingGrid().subscribe(response => {
            expect(response).toEqual(mockGridResponse);
            callCount++;
        });
        const req1 = httpMock.expectOne(`${API_URL}/grid`);
        req1.flush(mockGridResponse);

        // Request 1
        tick(POLLING_INTERVAL);
        const req2 = httpMock.expectOne(`${API_URL}/grid`);
        req2.flush(mockGridResponse);

        // Request 2
        tick(POLLING_INTERVAL);
        const req3 = httpMock.expectOne(`${API_URL}/grid`);
        req3.flush(mockGridResponse);

        subscription.unsubscribe();
        tick();

        expect(callCount).toBe(3);
    }));

    it('Should handle http errors', () => {
        service.getPollingGrid().subscribe({
            error: (error) => {
                expect(error.status).toBe(404);
            }
        });

        const req = httpMock.expectOne(`${API_URL}/grid`);
        req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
});
