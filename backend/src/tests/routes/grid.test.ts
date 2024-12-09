import express from 'express';
import request from 'supertest';

import gridRouter from '../../routes/grid';
import { GridService } from '../../services/gridService';
import { GRID_BIAS_COOLDOWN } from '../../utils/constants';

const app = express();
app.use(express.json());
app.use('/grid', gridRouter);

describe('Grid API Endpoints', () => {
    beforeAll(() => {
        jest.useFakeTimers();
    });

    afterAll(async () => {
        GridService.getInstance().stopGridGeneration();
    });

    it('Should return the grid', async () => {
        const response = await request(app).get('/grid');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('values');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('secret');
        expect(Array.isArray(response.body.values)).toBe(true);
        expect(response.body.secret.length).toBe(2);
        expect(Number.isInteger(parseInt(response.body.secret))).toBe(true);
    });

    it('Should set the bias correctly', async () => {
        const response = await request(app)
            .post('/grid/set-bias')
            .send({ bias: 'a' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Bias set successfully');
    });

    it('Should fail to set the bias with invalid character', async () => {
        jest.advanceTimersByTime(GRID_BIAS_COOLDOWN); // wait 4 seconds between bias updates

        const response = await request(app)
            .post('/grid/set-bias')
            .send({ bias: '1' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid value');
    });

    it('Should fail to set the bias when cooldown is not respected', async () => {
        jest.advanceTimersByTime(GRID_BIAS_COOLDOWN); // wait 4 seconds between bias updates

        await request(app)
            .post('/grid/set-bias')
            .send({ bias: 'a' });

        const response = await request(app)
            .post('/grid/set-bias')
            .send({ bias: 'b' });

        expect(response.status).toBe(429);
        expect(response.body).toHaveProperty('error', 'Please wait 4 seconds between bias updates');
        expect(response.body).toHaveProperty('remainingTime');
    });
});
