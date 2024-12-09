import { GridService } from "../../services/gridService";
import { GRID_BIAS_COOLDOWN, GRID_BIAS_WEIGHT, GRID_COLUMN_SIZE, GRID_ROW_SIZE, GRID_STOP_INTERVAL } from "../../utils/constants";
import { HttpError } from "../../utils/errors";

describe('Grid Service tests', () => {
    beforeAll(() => {
        jest.useFakeTimers();
    });

    afterAll(async () => {
        GridService.getInstance().stopGridGeneration();
    });

    it('Should return the grid', () => {
        const result = GridService.getInstance().getCurrentGridState();

        expect(result).toHaveProperty('values');
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('secret');
        expect(Array.isArray(result.values)).toBe(true);
        expect(result.values.length).toBe(GRID_ROW_SIZE);
        expect(result.values[0].length).toBe(GRID_COLUMN_SIZE);
        expect(result.secret.length).toBe(2);
        expect(Number.isInteger(parseInt(result.secret))).toBe(true);
    });

    it('Should throw error when cooldown is not respected', () => {
        try {
            jest.advanceTimersByTime(GRID_BIAS_COOLDOWN);
            GridService.getInstance().setBias('a');
            GridService.getInstance().setBias('b');
        } catch (error) {
            expect(error).toBeInstanceOf(HttpError);
            if (error instanceof HttpError) {
                expect(error.message).toBe('Please wait 4 seconds between bias updates');
                expect(error.statusCode).toBe(429);
                expect(error).toHaveProperty('extras');
                expect(error.extras).toHaveProperty('remainingTime');
            }
        }
    });

    it('Should throw error when bias is set with an invalid value', () => {
        try {
            jest.advanceTimersByTime(GRID_BIAS_COOLDOWN);
            GridService.getInstance().setBias('1');
        } catch (error) {
            expect(error).toBeInstanceOf(HttpError);
            if (error instanceof HttpError) {
                expect(error.message).toBe('Invalid value');
                expect(error.statusCode).toBe(400);
            }
        }
    });

    it('Should apply bias to the grid successfully', () => {
        const gridPrior = GridService.getInstance().getCurrentGridState();
        GridService.getInstance().setBias('z');
        const gridAfterwards = GridService.getInstance().getCurrentGridState();

        expect(gridPrior.values !== gridAfterwards.values);
        expect(gridAfterwards.values.flat().filter((value) => value === 'z').length).toBeGreaterThanOrEqual(GRID_BIAS_WEIGHT);
    });

    it('Should stop grid generation after inactivity period', () => {
        const gridService = GridService.getInstance();

        gridService.getCurrentGridState();

        expect(gridService.isGridGenerating()).toBe(true);

        jest.advanceTimersByTime(GRID_STOP_INTERVAL);
        jest.runAllTimers();

        expect(gridService.isGridGenerating()).toBe(false);
    });
});
