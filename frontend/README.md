# Frontend

An Angular application featuring two pages, A dynamic character grid interface and a payment management screen.

The grid page showcases an updated state of the character grid, and allows the user to input a bias character that will affect the amount of times that character appears on the grid.

The payment page allows the user to add payments, as well as, view its payment history.

## Tech Stack
- Angular 19
- TypeScript
- Angular Material
- Jasmine/Karma for testing

## Features
- Automatic grid updates
- Bias control with cooldown
- Animated analog/digital clock
- Payment processing
- Payment history

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
ng serve
```

3. Run tests:
```bash
ng test
```

## Project Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── components/             # UI components
│   │   │   ├── clock/              # Animated clock used for grid timestamps
│   │   │   ├── grid/               # Grid display and bias control
│   │   │   ├── grid-secret/        # Secret code display
│   │   │   └── payments/           # Payment processing/history
│   │   ├── services/               # API services
│   │   │   ├── grid.service.ts     # Grid, secret, and bias management
│   │   │   └── payments.service.ts # Payment operations
│   │   ├── types/                  # TypeScript interfaces
│   │   └── utils/                  # Constants and utilities
```

## Key Components
- Grid Component: Displays 10x10 character grid with bias control
- Grid Secret Component: Shows current secret code
- Payments Component: Handles payment operations and history
