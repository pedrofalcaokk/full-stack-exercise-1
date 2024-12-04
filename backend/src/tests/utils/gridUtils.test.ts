import { getRandomChar, generateBiasPositions, generateGridValues, generateSecretCode } from '../../utils/gridUtils';
describe('Random character generator', () => {
    it('Should return a random character from the given list', () => {
        const charList = 'abc';
        expect(charList.includes(getRandomChar(charList))).toBe(true);
    });
});

describe('Bias positions generator', () => {
    it('Should return a set of bias positions', () => {
        const bias = 'a',
            weight = 2,
            rowSize = 10,
            columnSize = 10,
            biasPositions = generateBiasPositions(bias, weight, rowSize, columnSize);

        expect(biasPositions.size).toBe(weight);
        biasPositions.forEach(position => {
            expect(position).toBeGreaterThanOrEqual(0);
            expect(position).toBeLessThan(rowSize * columnSize);
        });
    });

    it('Should return a set of unique bias positions', () => {
        const bias = 'a',
            weight = 2,
            rowSize = 10,
            columnSize = 10,
            biasPositions = generateBiasPositions(bias, weight, rowSize, columnSize),
            uniquePositions = new Set();

        biasPositions.forEach(position => {
            if (uniquePositions.has(position)) {
                fail('Duplicate bias position found');
            }
        });
    });

    it('Should return an empty set when bias is empty', () => {
        const bias = '',
            weight = 2,
            rowSize = 10,
            columnSize = 10,
            biasPositions = generateBiasPositions(bias, weight, rowSize, columnSize);

        expect(biasPositions.size).toBe(0);
    });

    it('Should return an empty set when weight is 0', () => {
        const bias = 'a',
            weight = 0,
            rowSize = 10,
            columnSize = 10,
            biasPositions = generateBiasPositions(bias, weight, rowSize, columnSize);

        expect(biasPositions.size).toBe(0);
    });
});

describe('Grid value generator', () => {
    it('Should generate a grid with the correct dimensions', () => {
        const rowSize = 4,
            columnSize = 4,
            grid = generateGridValues('a', new Set([0, 5]), rowSize, columnSize, 'abc');

        expect(grid.length).toBe(rowSize);
        expect(grid[0].length).toBe(columnSize);
    });

    it('Should generate a grid with the bias in the correct positions', () => {
        const rowSize = 4,
            columnSize = 4,
            grid = generateGridValues('a', new Set([1, 5]), rowSize, columnSize, 'abcdefghijklmnopqrstuvwxyz');

        expect(grid[0][1]).toBe('a'); // Position 1
        expect(grid[1][1]).toBe('a'); // Position 5
    });

    it('Should generate a grid that only contains the given characters', () => {
        const rowSize = 4,
            columnSize = 4,
            charList = 'abc',
            grid = generateGridValues('a', new Set([]), rowSize, columnSize, charList),
            gridCharList = grid.flat();

        gridCharList.forEach(char => {
            expect(charList).toContain(char);
        });
    });

    it('Should always return a newly generated grid in subsequent calls', () => {
        const rowSize = 4,
            columnSize = 4,
            charList = 'abc',
            grid1 = generateGridValues('a', new Set([]), rowSize, columnSize, charList),
            grid2 = generateGridValues('a', new Set([]), rowSize, columnSize, charList);

        // Convert grids to strings for comparison
        const gridString1 = grid1.map(row => row.join('')).join(''),
            gridString2 = grid2.map(row => row.join('')).join('');

        expect(gridString1).not.toBe(gridString2);
    });
});

describe('Secret code generator', () => {
    it('Should return the correct secret code for a given grid and timestamp', () => {
        const values = [
            ['a', 'b', 'c'],
            ['a', 'b', 'c'],
            ['a', 'b', 'c']
        ],
            timestamp = new Date('2024-01-01T00:00:12');

        const secretCode = generateSecretCode(values, timestamp);

        // values[1][2] is 'c', values[2][1] is 'b', both of these values appear 3 times
        expect(secretCode).toBe('33');
    });

    it('Should handle large number of occurrences correctly', () => {
        const values = [
            ['a', 'a', 'a', 'b', 'c'],
            ['a', 'a', 'a', 'b', 'c'],
            ['a', 'b', 'a', 'b', 'c'],
            ['a', 'a', 'a', 'a', 'c'],
            ['a', 'a', 'a', 'b', 'c'],
            ['a', 'a', 'a', 'b', 'c'],
            ['a', 'a', 'a', 'a', 'c'],
        ],
            timestamp = new Date('2024-01-01T00:00:12');

        const secretCode = generateSecretCode(values, timestamp);

        // values[1][2] is 'a', values[2][1] is 'b', 'b' appears a total of 6 times, but 'a' appears a total of 22 times, which divided by 3 returns 7.333.., which rounds to 7
        expect(secretCode).toBe('76');
    });

    it('Should handle zeros in the seconds correctly', () => {
        const values = [
            ['a', 'b', 'c'],
            ['a', 'b', 'c'],
            ['a', 'b', 'c']
        ],
            timestamp = new Date('2024-01-01T00:00:01');

        const secretCode = generateSecretCode(values, timestamp);

        expect(secretCode.length).toBe(2);
    });
});
