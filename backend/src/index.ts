import express, { Application } from 'express';

const app: Application = express(),
    PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
