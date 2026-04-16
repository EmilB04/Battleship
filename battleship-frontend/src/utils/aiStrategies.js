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
 * Extreme AI strategy - aggressive sink behavior with weighted probability hunt.
 * Enhancements over hard:
 * - If a ship is wounded, prioritize finishing it immediately.
 * - During hunt mode, weigh placements by ship length and center pressure.
 * @param {Set} shotsSet - Set of previously shot cell keys
 * @param {Set} hitsSet - Set of hit cell keys
 * @param {Array} defendingShips - Array of defending ships
 * @param {Map} defendingShipMap - Map of cells to ship IDs
 * @param {number} boardSize - Board size
 * @returns {string|null} Next cell to target
 */
export const pickExtremeShot = (shotsSet, hitsSet, defendingShips, defendingShipMap, boardSize) => {
    const missesSet = new Set([...shotsSet].filter((cellKey) => !hitsSet.has(cellKey)));
    const sunkIds = getSunkShipIds(defendingShips, hitsSet);

    const remainingShips = defendingShips.filter((ship) => !sunkIds.has(ship.id));
    const remainingLengths = remainingShips.map((ship) => ship.length);

    const unresolvedHits = [...hitsSet].filter((cellKey) => {
        const shipId = defendingShipMap.get(cellKey);
        return shipId && !sunkIds.has(shipId);
    });

    const unresolvedByShip = new Map();
    unresolvedHits.forEach((cellKey) => {
        const shipId = defendingShipMap.get(cellKey);
        if (!shipId) {
            return;
        }

        if (!unresolvedByShip.has(shipId)) {
            unresolvedByShip.set(shipId, []);
        }
        unresolvedByShip.get(shipId).push(cellKey);
    });

    let priorityShipId = null;
    let maxKnownHits = 0;
    unresolvedByShip.forEach((cells, shipId) => {
        if (cells.length > maxKnownHits) {
            maxKnownHits = cells.length;
            priorityShipId = shipId;
        }
    });

    if (priorityShipId) {
        const shipCells = [];
        defendingShipMap.forEach((shipId, cellKey) => {
            if (shipId === priorityShipId) {
                shipCells.push(cellKey);
            }
        });

        const unshotShipCells = shipCells.filter((cellKey) => !shotsSet.has(cellKey));
        if (unshotShipCells.length > 0) {
            const knownHits = unresolvedByShip.get(priorityShipId) || [];
            if (knownHits.length <= 1) {
                return pickRandomCell(unshotShipCells);
            }

            const parsedHits = knownHits.map((cellKey) => parseCellKey(cellKey));
            const mostlyHorizontal = parsedHits.every((pos) => pos.row === parsedHits[0].row);

            const scoredTargets = unshotShipCells
                .map((cellKey) => {
                    const { row, col } = parseCellKey(cellKey);
                    const minDistanceToKnownHit = Math.min(
                        ...parsedHits.map((hitPos) => Math.abs(hitPos.row - row) + Math.abs(hitPos.col - col))
                    );

                    let alignmentBonus = 0;
                    if (mostlyHorizontal && row === parsedHits[0].row) {
                        alignmentBonus = 1;
                    }
                    if (!mostlyHorizontal && col === parsedHits[0].col) {
                        alignmentBonus = 1;
                    }

                    return {
                        cellKey,
                        score: (alignmentBonus * 100) - minDistanceToKnownHit
                    };
                })
                .sort((a, b) => b.score - a.score);

            return scoredTargets[0]?.cellKey || pickRandomCell(unshotShipCells);
        }
    }

    const score = new Map();
    const center = (boardSize - 1) / 2;

    const addPlacementScore = (cells, length) => {
        cells.forEach((cellKey) => {
            if (shotsSet.has(cellKey)) {
                return;
            }

            const { row, col } = parseCellKey(cellKey);
            const distanceToCenter = Math.abs(row - center) + Math.abs(col - center);
            const centerBonus = Math.max(0, boardSize - distanceToCenter) / boardSize;
            const currentScore = score.get(cellKey) || 0;
            score.set(cellKey, currentScore + length + centerBonus);
        });
    };

    remainingLengths.forEach((length) => {
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const horizontal = [];
                for (let i = 0; i < length; i++) {
                    horizontal.push(getCellKey(row, col + i));
                }

                const vertical = [];
                for (let i = 0; i < length; i++) {
                    vertical.push(getCellKey(row + i, col));
                }

                [horizontal, vertical].forEach((placement) => {
                    const inBounds = placement.every((cellKey) => {
                        const { row: r, col: c } = parseCellKey(cellKey);
                        return r >= 0 && r < boardSize && c >= 0 && c < boardSize;
                    });

                    if (!inBounds) {
                        return;
                    }

                    if (placement.some((cellKey) => missesSet.has(cellKey))) {
                        return;
                    }

                    if (unresolvedHits.length > 0 && !placement.some((cellKey) => unresolvedHits.includes(cellKey))) {
                        return;
                    }

                    addPlacementScore(placement, length);
                });
            }
        }
    });

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

    return pickHardShot(shotsSet, hitsSet, defendingShips, defendingShipMap, boardSize);
};

/**
 * Get AI shot based on difficulty level
 * @param {string} difficulty - Difficulty level ('easy', 'medium', 'hard', 'extreme')
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
    } else if (difficulty === 'hard') {
        return pickHardShot(shotsSet, hitsSet, defendingShips, defendingShipMap, boardSize);
    } else {
        return pickExtremeShot(shotsSet, hitsSet, defendingShips, defendingShipMap, boardSize);
    }
};
