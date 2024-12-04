import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable, shareReplay, switchMap, map, startWith } from 'rxjs';
import { BiasResponse, GridResponse } from '../types/grid.types';
import { API_URL, POLLING_INTERVAL } from '../utils/constants';

@Injectable({
    providedIn: 'root'
})
export class GridService {
    private basePolling$: Observable<GridResponse> = interval(POLLING_INTERVAL).pipe(
        startWith(0),
        switchMap(() => this.http.get<GridResponse>(`${API_URL}/grid`)),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    private gridPolling$: Observable<GridResponse> = this.basePolling$;
    private secretPolling$: Observable<string> = this.basePolling$.pipe(
        map((response: GridResponse) => response.secret)
    );

    constructor(private http: HttpClient) { }

    getPollingGrid(): Observable<GridResponse> {
        return this.gridPolling$;
    }

    getPollingSecret(): Observable<string> {
        return this.secretPolling$;
    }

    setBias(character: string): Observable<BiasResponse> {
        return this.http.post<BiasResponse>(`${API_URL}/grid/set-bias`, { bias: character });
    }
}
