# Full-Stack-Exercise-1223

## Backend API

A Node.js/Express API that generates and manages a character grid with a possible bias.

### Tech Stack
- Node.js
- Express
- TypeScript
- Jest for unit testing
- Supertest for API testing

### Features
- Automatic grid generation with value refresh at specific intervals
- Configurable bias with a set weight percentage
- Secret code generation

### Getting Started

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

### API Endpoints

`GET /grid` - Retrieve the current grid (it's values, timestamp and secret code)

`POST /grid/set-bias` - Set the bias character

### Project Structure
```
backend/
├── src/
│   ├── routes/      # API routes
│   ├── utils/       # Utility functions
│   └── tests/       # Test files
├── jest.config.js   # Test configuration
└── package.json     # Project dependencies
```
