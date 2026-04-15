/**
 * Ship Utility Functions
 * Helper functions for ship placement, validation, and tracking
 */

import { getCellKey, isCellInBounds } from './cellUtils.js';

/**
 * Get all cells occupied by a ship
 * @param {Object} ship - Ship object with row, col, length, orientation
 * @returns {Array} Array of {row, col} objects
 */
export const getShipCells = (ship) => {
    const cells = [];
    for (let i = 0; i < ship.length; i++) {
        if (ship.orientation === 'horizontal') {
            cells.push({ row: ship.row, col: ship.col + i });
        } else {
            cells.push({ row: ship.row + i, col: ship.col });
        }
    }
    return cells;
};

/**
 * Build a map of cell keys to ship IDs for quick lookup
 * @param {Array} ships - Array of ship objects
 * @returns {Map} Map of cell keys to ship IDs
 */
export const buildShipMap = (ships) => {
    const shipMap = new Map();
    ships.forEach((ship) => {
        getShipCells(ship).forEach((cell) => {
            shipMap.set(getCellKey(cell.row, cell.col), ship.id);
        });
    });
    return shipMap;
};

/**
 * Check if a ship placement is valid (doesn't overlap and is in bounds)
 * @param {Array} existingShips - Array of already placed ships
 * @param {Object} candidateShip - Ship object to validate
 * @param {number} boardSize - Size of the game board
 * @returns {boolean} True if placement is valid
 */
export const isValidShipPlacement = (existingShips, candidateShip, boardSize) => {
    const cells = getShipCells(candidateShip);

    // Check bounds
    for (const cell of cells) {
        if (!isCellInBounds(cell.row, cell.col, boardSize)) {
            return false;
        }

        // Check for overlaps with existing ships
        const overlaps = existingShips.some((ship) =>
            getShipCells(ship).some(
                (shipCell) => shipCell.row === cell.row && shipCell.col === cell.col
            )
        );

        if (overlaps) {
            return false;
        }
    }

    return true;
};

/**
 * Get IDs of all ships that are completely sunk
 * @param {Array} ships - Array of ship objects
 * @param {Set} hitsSet - Set of hit cell keys
 * @returns {Set} Set of sunk ship IDs
 */
export const getSunkShipIds = (ships, hitsSet) => {
    return new Set(
        ships
            .filter((ship) =>
                getShipCells(ship).every((cell) => hitsSet.has(getCellKey(cell.row, cell.col)))
            )
            .map((ship) => ship.id)
    );
};

/**
 * Check if a specific ship is sunk
 * @param {Object} ship - Ship object
 * @param {Set} hitsSet - Set of hit cell keys
 * @returns {boolean} True if ship is sunk
 */
export const isShipSunk = (ship, hitsSet) => {
    return getShipCells(ship).every((cell) => hitsSet.has(getCellKey(cell.row, cell.col)));
};



/**
 * Check if the entire fleet is defeated (all ships sunk)
 * @param {Array} ships - Array of ship objects
 * @param {Set} hitsSet - Set of hit cell keys
 * @returns {boolean} True if fleet is defeated
 */
export const isFleetDefeated = (ships, hitsSet) => {
    return ships.every((ship) => isShipSunk(ship, hitsSet));
};
