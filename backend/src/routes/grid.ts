import { Router, Request, Response } from 'express';
import { generateBiasPositions, generateGridValues, generateSecretCode } from '../utils/gridUtils';

interface Grid {
    values: string[][];
    bias: string;
    timestamp: Date;
    secret: string;
    refreshInterval: NodeJS.Timeout | null;
    lastBiasUpdate: number;
}

const GRID_REFRESH_INTERVAL: number = 2000, // 2 seconds
    ROW_SIZE: number = 10,
    COLUMN_SIZE: number = 10,
    BIAS_WEIGHT: number = (ROW_SIZE * COLUMN_SIZE) * 0.2,
    CHAR_LIST: string = 'abcdefghijklmnopqrstuvwxyz',
    BIAS_COOLDOWN: number = 4000, // 4 seconds
    GRID_STOP_INTERVAL: number = 60000, // 60 seconds
    router: Router = Router();

let grid: Grid = {
    values: [],
    bias: '',
    timestamp: new Date(),
    secret: '',
    refreshInterval: null,
    lastBiasUpdate: 0,
},
    lastGridRequest: number = 0;

// Root endpoint to return the grid
router.get('/', (req: Request, res: Response) => {
    lastGridRequest = Date.now();

    if (!grid.refreshInterval) {
        refreshGrid();
    }
    res.json({ values: grid.values, timestamp: grid.timestamp.toISOString(), secret: grid.secret });
});

// PUT endpoint to update the bias and refresh the grid
router.post('/set-bias', (req: Request, res: Response) => {
    const currentTime: number = Date.now();

    if (currentTime - grid.lastBiasUpdate < BIAS_COOLDOWN) {
        res.status(429).json({
            error: "Please wait 4 seconds between bias updates",
            remainingTime: (BIAS_COOLDOWN - (currentTime - grid.lastBiasUpdate)) / 1000
        });
        return;
    }

    if (!CHAR_LIST.includes(req.body.bias) && req.body.bias !== '') {
        res.status(400).json({ error: "Invalid value" });
        return;
    }

    grid.bias = req.body.bias;
    grid.lastBiasUpdate = currentTime;
    refreshGrid();
    res.json({ message: 'Bias set successfully' });
});

// Utility function to refresh the grid
function refreshGrid(): void {
    const currentTime: number = Date.now();
    if (currentTime - lastGridRequest > GRID_STOP_INTERVAL) {
        stopGridGeneration();
        return;
    }

    const bias: string = grid.bias;
    const biasPositions = generateBiasPositions(bias, BIAS_WEIGHT, ROW_SIZE, COLUMN_SIZE);
    const values: string[][] = generateGridValues(bias, biasPositions, ROW_SIZE, COLUMN_SIZE, CHAR_LIST);
    const timestamp = new Date();

    if (!grid.refreshInterval) {
        grid.refreshInterval = setInterval(refreshGrid, GRID_REFRESH_INTERVAL);
    }

    grid = {
        values,
        bias,
        timestamp,
        secret: generateSecretCode(values, timestamp),
        refreshInterval: grid.refreshInterval,
        lastBiasUpdate: grid.lastBiasUpdate,
    };
}

// Utility function to stop automatically generating the grid
export function stopGridGeneration(): void {
    if (grid.refreshInterval) {
        clearInterval(grid.refreshInterval);
        grid.refreshInterval = null;
    }
}

export default router;
