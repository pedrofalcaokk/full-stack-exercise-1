import cors from 'cors';
import express, { Application } from 'express';

import gridRoutes from './routes/grid';
import paymentsRoutes from './routes/payments';

const app: Application = express(),
    PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/grid', gridRoutes);
app.use('/payments', paymentsRoutes);

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
