import request from 'supertest';
import express from 'express';

const app = express();
app.use(express.json());

describe('API Endpoints', () => {
    it('Should return 404 error on an invalid endpoint', async () => {
        const response = await request(app).get('/');

        expect(response.status).toBe(404);
    });
});
