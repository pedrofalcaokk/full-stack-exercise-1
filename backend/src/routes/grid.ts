import { Request, Response, Router } from 'express';

import {
    GRID_BIAS_COOLDOWN,
    GRID_BIAS_WEIGHT,
    GRID_CHAR_LIST,
    GRID_COLUMN_SIZE,
    GRID_GRACE_PERIOD,
    GRID_REFRESH_INTERVAL,
    GRID_ROW_SIZE,
    GRID_STOP_INTERVAL
} from '../utils/constants';
import { generateBiasPositions, generateGridValues, generateSecretCode } from '../utils/gridUtils';

interface GridState {
    values: string[][];
    bias: string;
    timestamp: Date;
    secret: string;
}

interface GridManager {
    current: GridState;
    previous: GridState | null;
    refreshInterval: NodeJS.Timeout | null;
    lastBiasUpdate: number;
    lastGridRequest: number;
}

const router: Router = Router();

const gridManager: GridManager = {
    current: {
        values: [],
        bias: '',
        timestamp: new Date(),
        secret: '',
    },
    previous: null,
    refreshInterval: null,
    lastBiasUpdate: 0,
    lastGridRequest: 0
};

// Root endpoint to return the grid
router.get('/', (req: Request, res: Response) => {
    gridManager.lastGridRequest = Date.now();

    if (!gridManager.refreshInterval) {
        refreshGrid();
    }
    res.json({
        values: gridManager.current.values,
        timestamp: gridManager.current.timestamp.toISOString(),
        secret: gridManager.current.secret
    });
});

// PUT endpoint to update the bias and refresh the grid
router.post('/set-bias', (req: Request, res: Response) => {
    const currentTime: number = Date.now();

    if (currentTime - gridManager.lastBiasUpdate < GRID_BIAS_COOLDOWN) {
        res.status(429).json({
            error: "Please wait 4 seconds between bias updates",
            remainingTime: (GRID_BIAS_COOLDOWN - (currentTime - gridManager.lastBiasUpdate)) / 1000
        });
        return;
    }

    if (!GRID_CHAR_LIST.includes(req.body.bias) && req.body.bias !== '') {
        res.status(400).json({ error: "Invalid value" });
        return;
    }

    gridManager.current.bias = req.body.bias;
    gridManager.lastBiasUpdate = currentTime;
    refreshGrid();
    res.json({ message: 'Bias set successfully' });
});

// Utility function to refresh the grid
function refreshGrid(): void {
    const currentTime: number = Date.now();
    if (currentTime - gridManager.lastGridRequest > GRID_STOP_INTERVAL) {
        stopGridGeneration();
        return;
    }

    const bias: string = gridManager.current.bias;
    const biasPositions = generateBiasPositions(bias, GRID_BIAS_WEIGHT, GRID_ROW_SIZE, GRID_COLUMN_SIZE);
    const values: string[][] = generateGridValues(bias, biasPositions, GRID_ROW_SIZE, GRID_COLUMN_SIZE, GRID_CHAR_LIST);
    const timestamp = new Date();

    if (!gridManager.refreshInterval) {
        gridManager.refreshInterval = setInterval(refreshGrid, GRID_REFRESH_INTERVAL);
    }

    // Store current state as previous before updating
    gridManager.previous = { ...gridManager.current };

    // Update current state
    gridManager.current = {
        values,
        bias,
        timestamp,
        secret: generateSecretCode(values, timestamp),
    };

    // Clear previous state after grace period
    setTimeout(() => {
        gridManager.previous = null;
    }, GRID_GRACE_PERIOD);

    console.log('Secret Code:', gridManager.current.secret);
}

// Utility function to stop automatically generating the grid
export function stopGridGeneration(): void {
    if (gridManager.refreshInterval) {
        clearInterval(gridManager.refreshInterval);
        gridManager.refreshInterval = null;
    }
}

// Utility function to validate the secret code
export function validateSecretCode(secret: string): boolean {
    return (
        gridManager.current.secret === secret ||
        (gridManager.previous?.secret === secret)
    );
}

// Utility function to get the grid values
export function getGridValues(secret: string): string[][] | null {
    if (gridManager.current.secret === secret) {
        return gridManager.current.values;
    }
    if (gridManager.previous?.secret === secret) {
        return gridManager.previous.values;
    }
    return null;
}

// Utility function to check if the grid is initialized and up to date
export function isGridInitialized(): boolean {
    const currentTime: number = Date.now(),
        isGridUpToDate: boolean = (currentTime - gridManager.lastGridRequest < GRID_STOP_INTERVAL);

    return !!gridManager.current.values.length && isGridUpToDate;
}

export default router;
