/**
 * AI Strategy Functions
 * Implements different difficulty levels for AI opponent targeting
 */

import {
    getCellKey,
    parseCellKey,
    getUnshotCells,
    filterCheckerboardPattern
} from './cellUtils.js';
import { getSunkShipIds } from './shipUtils.js';

/**
 * Pick a random cell from an array
 * @param {string[]} cells - Array of cell keys
 * @returns {string|null} Random cell key or null if array is empty
 */
export const pickRandomCell = (cells) => {
    if (!cells.length) {
        return null;
    }
    const idx = Math.floor(Math.random() * cells.length);
    return cells[idx];
};

/**
 * Easy AI strategy - completely random targeting
 * @param {Set} shotsSet - Set of previously shot cell keys
 * @param {number} boardSize - Board size
 * @returns {string|null} Next cell to target
 */
export const pickEasyShot = (shotsSet, boardSize) => {
    const unshotCells = getUnshotCells(shotsSet, boardSize);
    return pickRandomCell(unshotCells);
};

/**
 * Medium AI strategy - checkerboard pattern with opportunistic targeting
 * Uses a checkerboard pattern for initial targeting, switches to neighbor targeting when a hit is made
 * @param {Set} shotsSet - Set of previously shot cell keys
 * @param {string[]} targetQueue - Queue of cells to investigate (neighbors of hits)
 * @param {number} boardSize - Board size
 * @returns {string|null} Next cell to target
 */
export const pickMediumShot = (shotsSet, targetQueue, boardSize) => {
    // If we have a target queue (from previous hits), try to follow it
    const queueCandidate = targetQueue.find((cellKey) => !shotsSet.has(cellKey));
    if (queueCandidate) {
        return queueCandidate;
    }

    // Otherwise, use checkerboard pattern
    const unshotCells = getUnshotCells(shotsSet, boardSize);
    const checkerboard = filterCheckerboardPattern(unshotCells);

    return pickRandomCell(checkerboard.length ? checkerboard : unshotCells);
};

/**
 * Hard AI strategy - intelligent targeting based on remaining ship sizes
 * Considers:
 * - Remaining ship lengths
 * - Unresolved hits (hits where the ship isn't fully sunk)
 * - Miss patterns to eliminate impossible ship placements
 * @param {Set} shotsSet - Set of previously shot cell keys
 * @param {Set} hitsSet - Set of hit cell keys
 * @param {Array} defendingShips - Array of defending ships
 * @param {Map} defendingShipMap - Map of cells to ship IDs
 * @param {number} boardSize - Board size
 * @returns {string|null} Next cell to target
 */
export const pickHardShot = (shotsSet, hitsSet, defendingShips, defendingShipMap, boardSize) => {
    // Get misses (shots that didn't hit)
    const missesSet = new Set([...shotsSet].filter((cellKey) => !hitsSet.has(cellKey)));

    // Get sunk ships and remaining ship lengths
    const sunkIds = getSunkShipIds(defendingShips, hitsSet);
    const remainingLengths = defendingShips
        .filter((ship) => !sunkIds.has(ship.id))
        .map((ship) => ship.length);

    // Get unresolved hits (hits on ships that aren't fully sunk)
    const unresolvedHits = [...hitsSet].filter((cellKey) => {
        const shipId = defendingShipMap.get(cellKey);
        return shipId && !sunkIds.has(shipId);
    });

    // Score all possible cell placements for remaining ships
    const score = new Map();

    const addPlacementScore = (cells) => {
        cells.forEach((cellKey) => {
            if (!shotsSet.has(cellKey)) {
                score.set(cellKey, (score.get(cellKey) || 0) + 1);
            }
        });
    };

    // For each remaining ship length, check all possible placements
    remainingLengths.forEach((length) => {
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                // Check horizontal placement
                const horizontal = [];
                for (let i = 0; i < length; i++) {
                    horizontal.push(getCellKey(row, col + i));
                }

                // Check vertical placement
                const vertical = [];
                for (let i = 0; i < length; i++) {
                    vertical.push(getCellKey(row + i, col));
                }

                [horizontal, vertical].forEach((placement) => {
                    // Check if placement is in bounds
                    const inBounds = placement.every((cellKey) => {
                        const { row: r, col: c } = parseCellKey(cellKey);
                        return r >= 0 && r < boardSize && c >= 0 && c < boardSize;
                    });

                    if (!inBounds) {
                        return;
                    }

                    // Eliminate placements that conflict with known misses
                    const conflictsMiss = placement.some((cellKey) => missesSet.has(cellKey));
                    if (conflictsMiss) {
                        return;
                    }

                    // If we have unresolved hits, only consider placements that include at least one
                    const missesKnownHits = unresolvedHits.length > 0
                        && !placement.some((cellKey) => unresolvedHits.includes(cellKey));
                    if (missesKnownHits) {
                        return;
                    }

                    // Score this placement
                    addPlacementScore(placement);
                });
            }
        }
    });

    // Find the cell with the highest score
    let bestCell = null;
    let bestScore = -1;
    score.forEach((cellScore, cellKey) => {
        if (cellScore > bestScore) {
            bestScore = cellScore;
            bestCell = cellKey;
        }
    });

    if (bestCell) {
        return bestCell;
    }

    // Fallback to medium strategy if no good placement found
    return pickMediumShot(shotsSet, [], boardSize);
};

/**
 * Get AI shot based on difficulty level
 * @param {string} difficulty - Difficulty level ('easy', 'medium', 'hard')
 * @param {Set} shotsSet - Set of previously shot cell keys
 * @param {Set} hitsSet - Set of hit cell keys
 * @param {string[]} targetQueue - Queue of cells to investigate
 * @param {Array} defendingShips - Defending fleet
 * @param {Map} defendingShipMap - Map of cells to ship IDs
 * @param {number} boardSize - Board size
 * @returns {string|null} Next cell to target
 */
export const getAIShot = (
    difficulty,
    shotsSet,
    hitsSet,
    targetQueue,
    defendingShips,
    defendingShipMap,
    boardSize
) => {
    if (difficulty === 'easy') {
        return pickEasyShot(shotsSet, boardSize);
    } else if (difficulty === 'medium') {
        return pickMediumShot(shotsSet, targetQueue, boardSize);
    } else {
        return pickHardShot(shotsSet, hitsSet, defendingShips, defendingShipMap, boardSize);
    }
};
