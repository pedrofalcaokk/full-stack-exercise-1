import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Observable, shareReplay, switchMap } from 'rxjs';
import { GridResponse, BiasResponse } from '../types/grid.types';

@Injectable({
    providedIn: 'root'
})
export class GridService {
    private apiUrl: string = 'http://localhost:3000'; //TODO: Make this configurable
    private gridPolling$: Observable<GridResponse> = interval(2000).pipe(
        switchMap(() => this.getGrid()),
        shareReplay({ bufferSize: 1, refCount: true })
    );
    constructor(private http: HttpClient) { }

    getPollingGrid(): Observable<GridResponse> {
        return this.gridPolling$;
    }

    getGrid(): Observable<GridResponse> {
        return this.http.get<GridResponse>(`${this.apiUrl}/grid`);
    }

    setBias(character: string): Observable<BiasResponse> {
        return this.http.post<BiasResponse>(`${this.apiUrl}/grid/set-bias`, { bias: character });
    }
}
