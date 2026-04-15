/**
 * Cell Utility Functions
 * Helper functions for working with board cells using row/col coordinates
 */

/**
 * Convert row and column to a cell key string
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {string} Cell key in format "row-col"
 */
export const getCellKey = (row, col) => `${row}-${col}`;

/**
 * Parse a cell key string back to row and column
 * @param {string} cellKey - Cell key in format "row-col"
 * @returns {{row: number, col: number}} Row and column coordinates
 */
export const parseCellKey = (cellKey) => {
    const [row, col] = cellKey.split('-').map(Number);
    return { row, col };
};

/**
 * Check if a cell is within board boundaries
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {number} boardSize - Size of the board
 * @returns {boolean} True if cell is within bounds
 */
export const isCellInBounds = (row, col, boardSize) => {
    return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
};

/**
 * Get all neighboring cells for a given cell (4-directional: up, down, left, right)
 * @param {string} cellKey - Cell key
 * @param {number} boardSize - Size of the board
 * @returns {string[]} Array of neighboring cell keys within bounds
 */
export const getNeighboringCells = (cellKey, boardSize) => {
    const { row, col } = parseCellKey(cellKey);
    const directions = [
        [row - 1, col], // up
        [row + 1, col], // down
        [row, col - 1], // left
        [row, col + 1]  // right
    ];

    return directions
        .filter(([r, c]) => isCellInBounds(r, c, boardSize))
        .map(([r, c]) => getCellKey(r, c));
};



/**
 * Get all unshot cells (cells that haven't been targeted yet)
 * @param {Set} shotsSet - Set of shot cell keys
 * @param {number} boardSize - Size of the board
 * @returns {string[]} Array of unshot cell keys
 */
export const getUnshotCells = (shotsSet, boardSize) => {
    const cells = [];
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const key = getCellKey(row, col);
            if (!shotsSet.has(key)) {
                cells.push(key);
            }
        }
    }
    return cells;
};

/**
 * Filter cells based on a checkerboard pattern (every other cell)
 * Useful for AI strategy optimization
 * @param {string[]} cells - Array of cell keys
 * @returns {string[]} Filtered array with checkerboard pattern
 */
export const filterCheckerboardPattern = (cells) => {
    return cells.filter((cellKey) => {
        const { row, col } = parseCellKey(cellKey);
        return (row + col) % 2 === 0;
    });
};


