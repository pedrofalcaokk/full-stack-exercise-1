import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, throttleTime } from 'rxjs/operators';

import { GridService } from '../../services/grid.service';
import { GridResponse } from '../../types/grid.types';
import { ClockComponent } from '../clock/clock.component';

const BIAS_COOLDOWN: number = 4000;

@Component({
    selector: 'app-grid',
    standalone: true,
    imports: [ClockComponent, CommonModule, MatButtonModule, MatIconModule, MatInputModule, MatProgressSpinnerModule, ReactiveFormsModule],
    templateUrl: './grid.component.html',
    styleUrl: './grid.component.scss'
})
export class GridComponent implements OnInit, OnDestroy {
    public grid: string[][] = [];
    public timestamp: string = '';
    public secretCode: string = '';
    public biasControl: FormControl = new FormControl('');
    public cooldownRemaining: number = 0;
    public gridSubscription!: Subscription;
    private biasSubscription!: Subscription;

    constructor(private gridService: GridService) { }

    ngOnInit() {
        // Initialize the grid (empty)
        this.grid = Array(10).fill(null).map(() => Array(10).fill(''));

        // Set the bias, and enforce the bias cooldown
        this.biasSubscription = this.biasControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            throttleTime(BIAS_COOLDOWN)
        ).subscribe((value: string) => {
            this.gridService.setBias(value ?? '').subscribe();
            this.biasControl.disable();
            this.cooldownRemaining = BIAS_COOLDOWN / 1000;
            const timer: ReturnType<typeof setInterval> = setInterval(() => {
                this.cooldownRemaining--;
                if (this.cooldownRemaining <= 0) {
                    clearInterval(timer);
                    this.biasControl.enable();
                }
            }, 1000);
        });
    }

    startGridGeneration() {
        // Fill in the grid immediately
        this.gridService.getGrid().subscribe(response => {
            this.grid = response.values;
            this.timestamp = response.timestamp;
            this.secretCode = response.secret;
        });

        // Start the polling procedure
        this.gridSubscription = this.gridService.getPollingGrid().subscribe((response: GridResponse) => {
            this.grid = response.values;
            this.timestamp = response.timestamp;
            this.secretCode = response.secret;
        });
    }

    ngOnDestroy() {
        if (this.gridSubscription) {
            this.gridSubscription.unsubscribe();
        }

        if (this.biasSubscription) {
            this.biasSubscription.unsubscribe();
        }
    }
}
