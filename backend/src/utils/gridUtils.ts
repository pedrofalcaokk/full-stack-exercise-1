// Utility function to generate a random character
export function getRandomChar(charList: string): string {
    return charList.charAt(Math.floor(Math.random() * charList.length));
}

// Utility function to generate the bias positions
export function generateBiasPositions(bias: string, weight: number, rowSize: number, columnSize: number): Set<number> {
    const biasPositions = new Set<number>();
    if (bias !== '') {
        while (biasPositions.size < weight) {
            biasPositions.add(Math.floor(Math.random() * (rowSize * columnSize)));
        }
    }
    return biasPositions;
}

// Utility function to generate the grid's values
export function generateGridValues(bias: string, biasPositions: Set<number>, rowSize: number, columnSize: number, charList: string): string[][] {
    return Array(rowSize).fill(null).map((_, i) =>
        Array(columnSize).fill(null).map((_, j) => {
            const currentPosition = i * columnSize + j;
            return (bias && biasPositions.has(currentPosition)) ? bias : getRandomChar(charList);
        })
    );
}

// Utility function to generate the secret code
export function generateSecretCode(values: string[][], timestamp: Date): string {
    // Grab the seconds from the timestamp
    const seconds: string = timestamp.getSeconds().toString().padStart(2, '0');

    // Grab each digit of the seconds
    const pos1: number = parseInt(seconds[0], 10);
    const pos2: number = parseInt(seconds[1], 10);

    // Grab the cell's values
    const cell1: string = values[pos1][pos2];
    const cell2: string = values[pos2][pos1];

    return getCellCount(cell1, values).toString() + getCellCount(cell2, values).toString();
}

function getCellCount(cell: string, values: string[][]): number {
    const occurrences: number = values.flat().reduce((acc, curr) => curr === cell ? acc + 1 : acc, 0);

    if (occurrences > 9) {
        for (let i = 2; i < Math.sqrt(occurrences); i++) {
            if (Math.round(occurrences / i) <= 9) {
                return Math.round(occurrences / i);
            }
        }
    }

    return occurrences;
}
