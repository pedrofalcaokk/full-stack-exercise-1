# Full-Stack-Exercise-1

The objective of this exercise is to create a full-stack application.

[![Backend CI](https://github.com/pedrofalcaokk/full-stack-exercise-1/actions/workflows/backend-tests.yml/badge.svg)](https://github.com/pedrofalcaokk/full-stack-exercise-1/actions/workflows/backend-tests.yml)
[![Frontend Tests](https://github.com/pedrofalcaokk/full-stack-exercise-1/actions/workflows/frontend-tests.yml/badge.svg)](https://github.com/pedrofalcaokk/full-stack-exercise-1/actions/workflows/frontend-tests.yml)

## Phase 1

### Grid

- An endpoint must be implemented in the backend to return a 10x10 grid, as well, as it's secret:
  - Each cell will have a random alphabetic (a-z) character
  - The grid's values are to be refreshed every 2 seconds
  - Each grid state will have a code/secret, which can be calculated through the Code/Secret algorithm mentioned below

- Code/Secret algorithm
  1. Take the 2 digits from the seconds of the current time (Ex: 12:00:**23**)
  2. Get the grid's values for the cells that correspond to those digits (Ex: [2,3] and [3,2])
  3. Count the occurrences of each character in the entire grid
  4. The combination of these two numbers is your code
  5. Exception: If the number of occurrences is larger than 9, divide that number by the lowest possible integer in order to get a number, which rounded is lower or equal to 9

### Bias

An endpoint must be implemented in the backend to allow setting a bias:
  - The bias is a single alphabetic (a-z) character
  - The bias's function is force the grid to have 20% of the grid's cells filled with that character, the rest remain randomly generated
  - The bias can only be set once every 4 seconds

### Frontend

- The frontend should display a page with the following:
  - An input for the bias character
  - A clock to display the timestamp used by the backend to generate the secret
  - A button to start displaying the grid's values
  - A 10x10 grid to display the backend grid (The grid must be kept up-to-date)
  - A display of the live code/secret

## Phase 2

### Payments

An endpoint must be implemented in the backend to retrieve a list of payments:
  - Each payment is composed of: a name, an amount, the secret code of the grid at the moment of insertion, the entire grid (all values)

An endpoint must be implemented in the backend to add a new payment:
  - The payment's name, amount, and secret must be supplied by the frontend

### Frontend

A new page for payment interactions must be created with the following:
  - A display for the current live code/secret
  - A payment form with an input for the name and amount, as well as a button to add the payment
  - A grid with the list of the payments (including their 10x10 grid)

## Project Structure
- `/frontend` - Angular application
- `/backend` - Node.js/Express API

See individual README files in each directory for specific setup instructions and details.
