import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Observable, shareReplay, switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GridService {
    private apiUrl = 'http://localhost:3000'; //TODO: Make this configurable
    private gridPolling$ = interval(2000).pipe(
        switchMap(() => this.getGrid()),
        shareReplay({ bufferSize: 1, refCount: true })
    );
    constructor(private http: HttpClient) { }

    getPollingGrid() {
        return this.gridPolling$;
    }

    getGrid(): Observable<any> {
        return this.http.get(`${this.apiUrl}/grid`);
    }

    setBias(character: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/grid/set-bias`, { bias: character });
    }
}
