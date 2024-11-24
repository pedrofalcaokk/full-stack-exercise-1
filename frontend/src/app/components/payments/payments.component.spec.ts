import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PaymentsComponent } from './payments.component';
import { PaymentsService } from '../../services/payments.service';
import { AddPaymentResponse, GetPaymentsResponse } from '../../types/payments.types';
import { GridService } from '../../services/grid.service';
import { POLLING_INTERVAL } from '../../utils/constants';

describe('PaymentsComponent', () => {
    const mockGrid: string[][] = [
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
    ],
        mockGetPaymentsResponse: GetPaymentsResponse = {
            payments: [
                {
                    name: 'Payment 1',
                    amount: 100,
                    grid: mockGrid,
                    secret: '11'
                },
                {
                    name: 'Payment 2',
                    amount: 200,
                    grid: mockGrid,
                    secret: '12'
                },
                {
                    name: 'Payment 3',
                    amount: 100,
                    grid: mockGrid,
                    secret: '13'
                },
                {
                    name: 'Payment 4',
                    amount: 200,
                    grid: mockGrid,
                    secret: '14'
                }
            ]
        },
        mockAddPaymentResponse: AddPaymentResponse = {
            message: 'Payment added successfully',
        };

    let component: PaymentsComponent,
        fixture: ComponentFixture<PaymentsComponent>,
        paymentsService: jasmine.SpyObj<PaymentsService>,
        gridService: jasmine.SpyObj<GridService>,
        secretSubject: BehaviorSubject<string>,
        snackBar: jasmine.SpyObj<MatSnackBar>;

    beforeEach(async () => {
        secretSubject = new BehaviorSubject<string>('12');
        paymentsService = jasmine.createSpyObj('PaymentsService', ['getPayments', 'addPayment', 'getPollingPayments']);
        paymentsService.getPayments.and.returnValue(of(mockGetPaymentsResponse));
        paymentsService.getPollingPayments.and.returnValue(of(mockGetPaymentsResponse));
        paymentsService.addPayment.and.returnValue(of(mockAddPaymentResponse));
        snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

        gridService = jasmine.createSpyObj('GridService', ['getPollingSecret']);
        gridService.getPollingSecret.and.returnValue(secretSubject);

        await TestBed.configureTestingModule({
            imports: [PaymentsComponent],
            providers: [
                { provide: PaymentsService, useValue: paymentsService },
                { provide: GridService, useValue: gridService },
                { provide: MatSnackBar, useValue: snackBar },
                provideHttpClient(),
                provideAnimationsAsync()
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(PaymentsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should initialize the component with the payments provided by the service', () => {
        expect(component.payments).toEqual(mockGetPaymentsResponse.payments);
    });

    it('Should initialize the component with proper form control validations', () => {
        const nameControl = component.paymentForm.get('name');
        const amountControl = component.paymentForm.get('amount');

        // Test name validators
        nameControl?.setValue('');
        expect(nameControl?.hasError('required')).toBeTruthy();
        nameControl?.setValue('ab');
        expect(nameControl?.hasError('minlength')).toBeTruthy();
        nameControl?.setValue('a'.repeat(101));
        expect(nameControl?.hasError('maxlength')).toBeTruthy();

        // Test amount validators
        amountControl?.setValue('');
        expect(amountControl?.hasError('required')).toBeTruthy();
        amountControl?.setValue(0);
        expect(amountControl?.hasError('min')).toBeTruthy();
    });

    it('Should mark form as invalid with invalid values', () => {
        component.paymentForm.setValue({
            name: 'Pa',
            amount: 0
        });

        expect(component.paymentForm.invalid).toBeTrue();
    });

    it('Should mark form as invalid when secret-code is not set', () => {
        secretSubject.next('');
        component.paymentForm.setValue({
            name: 'Payment 1',
            amount: 10
        });

        expect(component.paymentForm.invalid).toBeTrue();
    });

    it('Should mark form as valid when secret-code is set', () => {
        component.paymentForm.setValue({
            name: 'Payment 1',
            amount: 10
        });

        expect(component.paymentForm.valid).toBeTrue();
    });

    it('Should update secret property when new value is emitted by the service', () => {
        expect((component as any).secret).toEqual('12');
        secretSubject.next('21');
        expect((component as any).secret).toEqual('21');
    });

    it('Should call the addPayment method of the service with the correct parameters', () => {
        component.paymentForm.setValue({
            name: 'Payment 1',
            amount: 10
        });

        component.addPayment();

        expect(paymentsService.addPayment).toHaveBeenCalledWith('Payment 1', 10, '12');
    });

    it('Should reset the payment form after successfully adding the payment', () => {
        component.paymentForm.setValue({
            name: 'Payment 1',
            amount: 10
        });

        component.addPayment();

        expect(component.paymentForm.get('name')?.value).toBe(null);
        expect(component.paymentForm.get('amount')?.value).toBe(null);
    });

    it('Should show error notification when addPayment fails', () => {
        const errorResponse = { error: { error: 'Failed to add payment' } };
        paymentsService.addPayment.and.returnValue(throwError(() => errorResponse));

        component.paymentForm.setValue({
            name: 'Test Payment',
            amount: 100
        });
        component.addPayment();

        expect(snackBar.open).toHaveBeenCalledWith(
            'Error adding payment: Failed to add payment',
            'Close',
            {
                duration: 3000,
                verticalPosition: 'top'
            }
        );
    });

    it('Should update the payment list after a successful addition', () => {
        const priorPaymentCount = component.payments.length,
            mockGetPaymentsResponse2 = mockGetPaymentsResponse;

        mockGetPaymentsResponse2.payments.push({
            name: 'Payment 5',
            amount: 10,
            grid: mockGrid,
            secret: '12'
        })

        component.paymentForm.setValue({
            name: 'Payment 5',
            amount: 10
        });

        component.addPayment();

        const afterPaymentCount = component.payments.length;

        expect(afterPaymentCount).toBe(priorPaymentCount + 1);
    });

    it('Should fetch initial payments on init', () => {
        expect(paymentsService.getPayments).toHaveBeenCalled();
        expect(component.payments).toEqual(mockGetPaymentsResponse.payments);
    });

    it('Should update payments during polling', fakeAsync(() => {
        const updatedPayments = {
            payments: [...mockGetPaymentsResponse.payments, {
                name: 'New Payment',
                amount: 300,
                grid: mockGrid,
                secret: '15'
            }]
        },
            currentPaymentCount = mockGetPaymentsResponse.payments.length;

        paymentsService.getPollingPayments.and.returnValue(of(updatedPayments));

        (component as any).startPollingPayments();

        tick(POLLING_INTERVAL);

        expect(component.payments.length).toBe(currentPaymentCount + 1);
        expect(component.payments).toEqual(updatedPayments.payments);
    }));

    it('Should unsubscribe from all subscriptions on destroy', () => {
        component.ngOnInit();
        component.ngOnDestroy();

        expect((component as any).paymentsSubscription.closed).toBeTrue();
        expect((component as any).secretSubscription.closed).toBeTrue();
    });
});
