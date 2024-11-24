import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable, shareReplay, switchMap, tap, BehaviorSubject } from 'rxjs';
import { BiasResponse, GridResponse } from '../types/grid.types';
import { API_URL, POLLING_INTERVAL } from '../utils/constants';

@Injectable({
    providedIn: 'root'
})
export class GridService {
    private secretSubject = new BehaviorSubject<string>('');
    secret$ = this.secretSubject.asObservable();

    private gridPolling$: Observable<GridResponse> = interval(POLLING_INTERVAL).pipe(
        switchMap(() => this.getGrid()),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    constructor(private http: HttpClient) { }

    getPollingGrid(): Observable<GridResponse> {
        return this.gridPolling$;
    }

    getGrid(): Observable<GridResponse> {
        return this.http.get<GridResponse>(`${API_URL}/grid`).pipe(
            tap(response => this.secretSubject.next(response.secret))
        );
    }

    setBias(character: string): Observable<BiasResponse> {
        return this.http.post<BiasResponse>(`${API_URL}/grid/set-bias`, { bias: character });
    }

    getSecret(): string {
        return this.secretSubject.getValue();
    }
}
