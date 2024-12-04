# Backend API

A Node.js/Express API that generates and manages a character grid with a possible bias, along with payment processing capabilities.

## Tech Stack
- Node.js
- Express
- TypeScript
- Jest for unit testing
- Supertest for API testing

## Features
- Automatic grid generation with value refresh at specific intervals
- Configurable bias with a set weight percentage
- Secret code generation
- Payment processing

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
# Or
PORT=YOUR_PORT npm start
```

3. Run tests:
```bash
# Regular tests
npm test

# Tests with coverage
npm run test:coverage
```

4. Run Linting:
```bash
npm run lint
```

## API Endpoints

### GET /grid
Returns the current state of the grid.

**Response:**
```json
{
    "values": string[][],     // 10x10 grid of characters
    "timestamp": string,      // Grid creation timestamp
    "secret": string          // 2-digit secret code
}
```

### POST /grid/set-bias
Sets a bias character that will appear more frequently in the grid.

**Request Body:**

```json
{
    "bias": string  // Single character to use as bias
}
```

**Successful Response:**

```json
{
    "message": "Bias set successfully"
}
```

**Response for invalid characters**

```json
{
  "error": "Invalid value"
}
```

### GET /payments
Returns all registered payments.

**Response**

```json
{
  "payments": [
    {
        "name": string,          // Payment name
        "amount": number,        // Payment amount
        "secret": string,        // Secret code at time of payment
        "gridValues": string[][] // Grid values at time of payment
    }
  ]
}
```

### POST /payments
Creates a new payment.

**Request Body:**

```json
{
    "name": string,     // Payment name (3-100 characters)
    "amount": number,   // Payment amount (minimum 1)
    "secret": string    // Current secret code
}
```

**Constraints**
- Bias must be a single character from the allowed character set (a-z)
- 4-second cooldown period between bias changes
- Payment names must be between 3 and 100 characters
- Payment amounts must be greater than 0
- Secret code must be valid at time of payment creation

## Project Structure
```
backend/
├── src/
│   ├── routes/      # API routes
│   ├── utils/       # Utility functions
│   └── tests/       # Test files
├── jest.config.js   # Test configuration
└── package.json     # Project dependencies
```
