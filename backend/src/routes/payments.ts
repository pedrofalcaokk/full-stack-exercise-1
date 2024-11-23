import { Request, Response, Router } from 'express';

import { HttpError } from '../utils/errors';
import { getGridValues, isGridInitialized, validateSecretCode } from './grid';

interface Payment {
    name: string;
    amount: number;
    grid: string[][];
    secret: string;
}

const router: Router = Router();
const payments: Payment[] = [];

// Root endpoint to return the list of payments
router.get('/', (req: Request, res: Response) => {
    res.json({ payments });
});

// PUT endpoint to add a new payment
router.post('/add', (req: Request, res: Response) => {
    try {
        // Check if the grid is initialized and up to date
        if (!isGridInitialized()) {
            res.status(500).json({ error: "Grid is not initialized or is not up to date" });
            return;
        }

        // Validate the request body
        if (!req.body.name || req.body.amount === undefined || !req.body.secret) {
            res.status(400).json({ error: "Invalid request" });
            return;
        }

        validatePaymentName(req.body.name);
        validatePaymentAmount(req.body.amount);

        // Validate the secret-code
        if (!validateSecretCode(req.body.secret)) {
            res.status(401).json({ error: "Invalid secret code" });
            return;
        }

        const gridValues = getGridValues(req.body.secret);
        if (!gridValues) {
            res.status(404).json({ error: "Invalid or expired grid state" });
            return;
        }

        const payment: Payment = {
            name: req.body.name,
            amount: req.body.amount,
            grid: gridValues,
            secret: req.body.secret,
        };

        addPayment(payment);
        res.json({ message: 'Payment added successfully' });
    } catch (error) {
        if (error instanceof HttpError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

function validatePaymentName(name: string): void {
    if (name.length < 3 || name.length > 100) {
        throw new HttpError(400, 'Invalid payment name, it should have between 3 and 100 characters');
    }
}

function validatePaymentAmount(amount: number): void {
    if (amount <= 0) {
        throw new HttpError(400, 'Invalid payment amount');
    }
}

export function addPayment(payment: Payment): void {
    // Check if the payment does not already exist in the array
    if (payments.some(p => p.name === payment.name && p.secret === payment.secret)) {
        throw new HttpError(409, 'Payment already exists');
    }

    payments.push(payment);
}

export default router;
