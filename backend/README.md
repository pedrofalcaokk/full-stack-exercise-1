# Backend API

A Node.js/Express API that generates and manages a character grid with a possible bias.

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
    "secret": string         // 2-digit secret code
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

**Constraints:**

- Bias must be a single character from the allowed character set (a-z)
- 4-second cooldown period between bias changes
- Invalid characters return 400 status with error message

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
