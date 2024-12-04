import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable, shareReplay, switchMap } from 'rxjs';
import { BiasResponse, GridResponse } from '../types/grid.types';
import { API_URL, POLLING_INTERVAL } from '../utils/constants';

@Injectable({
    providedIn: 'root'
})
export class GridService {
    private gridPolling$: Observable<GridResponse> = interval(POLLING_INTERVAL).pipe(
        switchMap(() => this.getGrid()),
        shareReplay({ bufferSize: 1, refCount: true })
    );
    constructor(private http: HttpClient) { }

    getPollingGrid(): Observable<GridResponse> {
        return this.gridPolling$;
    }

    getGrid(): Observable<GridResponse> {
        return this.http.get<GridResponse>(`${API_URL}/grid`);
    }

    setBias(character: string): Observable<BiasResponse> {
        return this.http.post<BiasResponse>(`${API_URL}/grid/set-bias`, { bias: character });
    }
}
