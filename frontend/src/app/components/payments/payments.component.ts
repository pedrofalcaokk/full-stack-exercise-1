import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';

import { GridService } from '../../services/grid.service';
import { PaymentsService } from '../../services/payments.service';
import { GetPaymentsResponse, Payment } from '../../types/payments.types';
import { GridSecretComponent } from '../grid-secret/grid-secret.component';

@Component({
    selector: 'app-payments',
    standalone: true,
    imports: [CommonModule, GridSecretComponent, MatButtonModule, MatIconModule, MatInputModule, MatTableModule, ReactiveFormsModule],
    templateUrl: './payments.component.html',
    styleUrl: './payments.component.scss'
})
export class PaymentsComponent implements OnInit, OnDestroy {
    public payments: Payment[] = [];
    public paymentForm: FormGroup = new FormGroup({
        name: new FormControl('', [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100)
        ]),
        amount: new FormControl('', [Validators.required, Validators.min(1)])
    }, {
        validators: (control: AbstractControl): ValidationErrors | null => {
            // Validates whether the secret exists
            if (!this.secret) {
                return { invalidSecret: true };
            }
            return null;
        }
    });
    public displayedColumns: string[] = ['name', 'amount', 'code', 'gridValues'];

    private secret: string = '';
    private secretSubscription: Subscription = new Subscription();
    private paymentsSubscription: Subscription = new Subscription();

    constructor(
        private gridService: GridService,
        private paymentsService: PaymentsService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.secretSubscription = this.gridService.secret$.subscribe(
            (secret) => {
                this.secret = secret;
                this.paymentForm.updateValueAndValidity();
            }
        );

        // Update the payments list immediately and start the polling procedure
        this.getPayments();
        this.startPollingPayments();
    }

    public addPayment(): void {
        this.paymentsService.addPayment(
            this.paymentForm.get('name')?.value,
            this.paymentForm.get('amount')?.value,
            this.secret
        ).subscribe({
            next: () => {
                this.getPayments(); // Immediately update payments list
                this.paymentForm.reset();
            },
            error: (error) => this.showNotification('Error adding payment: ' + error.error.error)
        }
        );
    }

    private startPollingPayments(): void {
        this.paymentsSubscription = this.paymentsService.getPollingPayments().subscribe({
            next: (response: GetPaymentsResponse) => {
                this.updatePayments(response.payments);
            },
            error: (error) => this.showNotification('Error fetching payment: ' + error.error.error)
        }
        );
    }

    private getPayments(): void {
        this.paymentsService.getPayments().subscribe({
            next: (response) => {
                this.updatePayments(response.payments);
            },
            error: (error) => {
                this.resetPayments();
                this.showNotification('Error fetching payments: ' + error.error.error);
            }
        });
    }

    private updatePayments(payments: Payment[]): void {
        this.payments = payments;
    }

    private resetPayments(): void {
        this.payments = [];
    }

    private showNotification(message: string): void {
        this.snackBar.open(message, 'Close', {
            duration: 3000,
            verticalPosition: 'top'
        })
    }

    ngOnDestroy(): void {
        if (this.secretSubscription) {
            this.secretSubscription.unsubscribe();
        }

        if (this.paymentsSubscription) {
            this.paymentsSubscription.unsubscribe();
        }
    }
}
