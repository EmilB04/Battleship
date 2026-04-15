/**
 * Game Logic Functions
 * Core game mechanics including fleet generation, scoring, and match results
 */

import { isValidShipPlacement, isFleetDefeated } from './shipUtils.js';
import {
    BASE_SCORE_WIN,
    BASE_SCORE_LOSS,
    ACCURACY_MULTIPLIER,
    SPEED_BONUS_THRESHOLD,
    SPEED_BONUS_MULTIPLIER,
    MAX_SHIP_PLACEMENT_ATTEMPTS,
    MAX_SHIP_ATTEMPT_ITERATIONS
} from '../constants/gameConstants.js';

/**
 * Generate a random bot fleet by placing ships
 * @param {Array} shipTemplates - Array of ship templates to place
 * @param {number} boardSize - Size of the game board
 * @returns {Array} Array of placed ship objects or empty array if generation fails
 */
export const generateBotFleet = (shipTemplates, boardSize) => {
    let attempts = 0;

    while (attempts < MAX_SHIP_PLACEMENT_ATTEMPTS) {
        attempts += 1;
        const botShips = [];
        let allShipsPlaced = true;

        for (const shipTemplate of shipTemplates) {
            let placed = false;
            let shipAttempts = 0;

            while (!placed && shipAttempts < MAX_SHIP_ATTEMPT_ITERATIONS) {
                shipAttempts += 1;
                const orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';
                const row = Math.floor(Math.random() * boardSize);
                const col = Math.floor(Math.random() * boardSize);
                const candidate = { ...shipTemplate, row, col, orientation };

                if (isValidShipPlacement(botShips, candidate, boardSize)) {
                    botShips.push(candidate);
                    placed = true;
                }
            }

            if (!placed) {
                allShipsPlaced = false;
                break;
            }
        }

        if (allShipsPlaced) {
            return botShips;
        }
    }

    // Fallback - should rarely happen
    return [];
};

/**
 * Calculate the score for a match result
 * @param {string} result - 'player' for win, 'bot' for loss
 * @param {number} shotsCount - Total number of shots fired
 * @param {number} hitsCount - Total number of hits
 * @returns {number} Calculated score
 */
export const calculateMatchScore = (result, shotsCount, hitsCount) => {
    const accuracy = shotsCount ? Math.round((hitsCount / shotsCount) * 100) : 0;
    const speedBonus = Math.max(0, SPEED_BONUS_THRESHOLD - shotsCount * SPEED_BONUS_MULTIPLIER);
    const baseScore = result === 'player' ? BASE_SCORE_WIN : BASE_SCORE_LOSS;
    
    return baseScore + accuracy * ACCURACY_MULTIPLIER + speedBonus;
};

/**
 * Create a new leaderboard entry from match results
 * @param {string} username - Player username
 * @param {string} result - 'player' for win, 'bot' for loss
 * @param {string} difficulty - Difficulty level
 * @param {number} gridSize - Board size used
 * @param {number} shotsCount - Total shots fired
 * @param {number} hitsCount - Total hits
 * @returns {Object} Leaderboard entry object
 */
export const createLeaderboardEntry = (username, result, difficulty, gridSize, shotsCount, hitsCount) => {
    const accuracy = shotsCount ? Math.round((hitsCount / shotsCount) * 100) : 0;
    const score = calculateMatchScore(result, shotsCount, hitsCount);

    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        username,
        result,
        difficulty,
        gridSize: gridSize || 10,
        score,
        playerShots: shotsCount,
        accuracy
    };
};

/**
 * Check if the player has won the match
 * @param {Array} botShips - Bot ship fleet
 * @param {Set} playerHitsSet - Set of cells player has hit
 * @returns {boolean} True if bot fleet is defeated
 */
export const checkPlayerVictory = (botShips, playerHitsSet) => {
    return isFleetDefeated(botShips, playerHitsSet);
};

/**
 * Check if the bot has won the match
 * @param {Array} playerShips - Player ship fleet
 * @param {Set} botHitsSet - Set of cells bot has hit
 * @returns {boolean} True if player fleet is defeated
 */
export const checkBotVictory = (playerShips, botHitsSet) => {
    return isFleetDefeated(playerShips, botHitsSet);
};

/**
 * Get appropriate status message based on game state
 * @param {string} turn - Current turn ('player' or 'bot')
 * @param {boolean} isHit - Whether the last shot was a hit
 * @param {string} difficulty - Difficulty level
 * @param {string} winner - Winner ('player', 'bot', or null)
 * @returns {string} Status message
 */
export const getStatusMessage = (turn, isHit, difficulty, winner) => {
    if (winner === 'player') {
        return 'You sank all enemy ships. Victory.';
    }
    if (winner === 'bot') {
        return 'The AI sank your fleet.';
    }

    if (turn === 'player') {
        return isHit ? 'Direct hit. AI is thinking...' : 'Miss. AI is thinking...';
    } else {
        return isHit ? 'AI scored a hit. Your turn.' : 'AI missed. Your turn.';
    }
};
