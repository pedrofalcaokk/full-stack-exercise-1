import { GridService } from "../../services/gridService";
import { PaymentService } from "../../services/paymentService";
import { Payment } from "../../types/payment.types";
import { GRID_GRACE_PERIOD, GRID_REFRESH_INTERVAL, GRID_STOP_INTERVAL } from "../../utils/constants";
import { HttpError } from "../../utils/errors";

const gridService: GridService = GridService.getInstance();

describe('Service tests', () => {
    beforeAll(() => {
        jest.useFakeTimers();
    });

    beforeEach(() => {
        gridService.getCurrentGridState();
    })

    afterAll(async () => {
        gridService.stopGridGeneration();
    });

    it('Should return the payment list', () => {
        const result: Payment[] = PaymentService.getInstance().getPaymentList();

        expect(Array.isArray(result)).toBe(true);
    });

    it('Should add a new payment to the list', () => {
        const secret: string = gridService.getCurrentGridState().secret;

        PaymentService.getInstance().addPayment('Payment 1', 100, secret);

        const result: Payment[] = PaymentService.getInstance().getPaymentList();


        expect(result.find(payment => payment.name === 'Payment 1' && payment.secret === secret)).toBeDefined();
    });

    it('Should fail to add a payment if grid is not initialized', () => {
        try {
            gridService.stopGridGeneration();
            jest.advanceTimersByTime(GRID_STOP_INTERVAL);
            PaymentService.getInstance().addPayment('Payment 2', 100, '12');
        } catch (error) {
            expect(error).toBeInstanceOf(HttpError);
            if (error instanceof HttpError) {
                expect(error.message).toEqual('Grid is not initialized or is not up to date');
                expect(error.statusCode).toEqual(500);
            }
        }
    });

    it('Should fail to add a payment if the payment name has length < 2', () => {
        try {
            const secret: string = gridService.getCurrentGridState().secret;
            PaymentService.getInstance().addPayment('Pa', 100, secret);
        } catch (error) {
            expect(error).toBeInstanceOf(HttpError);
            if (error instanceof HttpError) {
                expect(error.message).toEqual('Invalid payment name, it should have between 3 and 100 characters');
                expect(error.statusCode).toEqual(400);
            }
        }
    });

    it('Should fail to add a payment if the payment name has length > 100', () => {
        try {
            const secret: string = gridService.getCurrentGridState().secret;
            const paymentName: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklm';
            PaymentService.getInstance().addPayment(paymentName, 100, secret);
        } catch (error) {
            expect(error).toBeInstanceOf(HttpError);
            if (error instanceof HttpError) {
                expect(error.message).toEqual('Invalid payment name, it should have between 3 and 100 characters');
                expect(error.statusCode).toEqual(400);
            }
        }
    });

    it('Should fail to add a payment if the amount is 0', () => {
        try {
            const secret: string = gridService.getCurrentGridState().secret;
            PaymentService.getInstance().addPayment('Payment with incorrect amount', 0, secret);
        } catch (error) {
            expect(error).toBeInstanceOf(HttpError);
            if (error instanceof HttpError) {
                expect(error.message).toEqual('Invalid payment amount');
                expect(error.statusCode).toEqual(400);
            }
        }
    });

    it('Should fail to add a payment if the amount is below 0', () => {
        try {
            const secret: string = gridService.getCurrentGridState().secret;
            PaymentService.getInstance().addPayment('Payment with incorrect amount', -10, secret);
        } catch (error) {
            expect(error).toBeInstanceOf(HttpError);
            if (error instanceof HttpError) {
                expect(error.message).toEqual('Invalid payment amount');
                expect(error.statusCode).toEqual(400);
            }
        }
    });

    it('Should fail to add a payment with the incorrect secret code', () => {
        try {
            PaymentService.getInstance().addPayment('Payment with incorrect secret', 100, 'aa');
        } catch (error) {
            expect(error).toBeInstanceOf(HttpError);
            if (error instanceof HttpError) {
                expect(error.message).toEqual('Invalid secret code');
                expect(error.statusCode).toEqual(401);
            }
        }
    });

    it('Should fail to add an existing payment', () => {
        try {
            const secret: string = gridService.getCurrentGridState().secret;
            PaymentService.getInstance().addPayment('Payment', 100, secret);
            PaymentService.getInstance().addPayment('Payment', 100, secret);
        } catch (error) {
            expect(error).toBeInstanceOf(HttpError);
            if (error instanceof HttpError) {
                expect(error.message).toEqual('Payment already exists');
                expect(error.statusCode).toEqual(409);
            }
        }
    });

    it('Should add payment with the previous secret code if under the grace period', () => {
        const secret: string = gridService.getCurrentGridState().secret;

        // Advance the timer to use the previous state
        jest.advanceTimersByTime(GRID_REFRESH_INTERVAL + 1);


        PaymentService.getInstance().addPayment('Payment 3', 100, secret);
    });

    it('Should fail to add payment with the previous secret code after the grace period ends', () => {
        try {
            const secret: string = gridService.getCurrentGridState().secret;

            // Advance the timer to after grace period ends
            jest.advanceTimersByTime(GRID_REFRESH_INTERVAL + GRID_GRACE_PERIOD);

            PaymentService.getInstance().addPayment('Payment 4', 100, secret);
        } catch (error) {
            expect(error).toBeInstanceOf(HttpError);
            if (error instanceof HttpError) {
                expect(error.message).toEqual('Invalid secret code');
                expect(error.statusCode).toEqual(401);
            }
        }
    });
});
