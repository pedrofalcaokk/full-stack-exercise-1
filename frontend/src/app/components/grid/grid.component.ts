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
import { BIAS_COOLDOWN, BIAS_DEBOUNCE } from '../../utils/constants';
import { ClockComponent } from '../clock/clock.component';
import { GridSecretComponent } from '../grid-secret/grid-secret.component';

@Component({
    selector: 'app-grid',
    standalone: true,
    imports: [ClockComponent, CommonModule, GridSecretComponent, MatButtonModule, MatIconModule, MatInputModule, MatProgressSpinnerModule, ReactiveFormsModule],
    templateUrl: './grid.component.html',
    styleUrl: './grid.component.scss'
})
export class GridComponent implements OnInit, OnDestroy {
    public grid: string[][] = [];
    public timestamp: string = '';
    public biasControl: FormControl = new FormControl('');
    public cooldownRemaining: number = 0;
    public gridSubscription!: Subscription;
    private biasSubscription!: Subscription;
    private cooldownTimer?: ReturnType<typeof setInterval>;

    constructor(private gridService: GridService) { }

    ngOnInit() {
        // Initialize the grid (empty)
        this.resetGridState();

        // Set the bias if the input changes values
        this.biasSubscription = this.biasControl.valueChanges.pipe(
            debounceTime(BIAS_DEBOUNCE),
            distinctUntilChanged()
        ).subscribe((value: string) => {
            if (this.gridSubscription) {
                this.setBias(value);
            }
        });
    }

    public startPollingGrid(): void {
        if (this.biasControl.value) {
            this.setBias(this.biasControl.value);
        }

        this.gridSubscription = this.gridService.getPollingGrid().subscribe({
            next: (response: GridResponse) => {
                this.updateGridState(response);
            },
            error: () => this.resetGridState()
        });
    }

    private setBias(value: string): void {
        this.gridService.setBias(value ?? '').subscribe();
        this.biasControl.disable();
        this.cooldownRemaining = BIAS_COOLDOWN / 1000;
        this.cooldownTimer = setInterval(() => {
            this.cooldownRemaining--;
            if (this.cooldownRemaining <= 0) {
                clearInterval(this.cooldownTimer);
                this.biasControl.enable();
            }
        }, 1000);
    }

    private updateGridState(response: GridResponse): void {
        this.grid = response.values;
        this.timestamp = response.timestamp;
    }

    private resetGridState(): void {
        this.grid = Array(10).fill(null).map(() => Array(10).fill(''));
        this.timestamp = '';
    }

    ngOnDestroy() {
        if (this.cooldownTimer) {
            clearInterval(this.cooldownTimer);
        }

        if (this.gridSubscription) {
            this.gridSubscription.unsubscribe();
        }

        if (this.biasSubscription) {
            this.biasSubscription.unsubscribe();
        }
    }
}
