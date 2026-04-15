/**
 * Game Constants
 * Centralized configuration for game mechanics and storage
 */

export const LEADERBOARD_STORAGE_KEY = 'battleshipLeaderboard';
export const MAX_LEADERBOARD_ENTRIES = 15;
export const GRID_SIZE_STORAGE_KEY = 'gridSize';
export const THEME_STORAGE_KEY = 'theme';
export const ANIMATIONS_STORAGE_KEY = 'animations';
export const DEV_MODE_STORAGE_KEY = 'devMode';
export const DIFFICULTY_STORAGE_KEY = 'difficulty';

export const SHIP_TEMPLATES = [
    { id: 1, name: 'Carrier', label: 'CA', length: 5, color: 'var(--carrier)' },
    { id: 2, name: 'Battleship', label: 'BS', length: 4, color: 'var(--battleship)' },
    { id: 3, name: 'Cruiser', label: 'CR', length: 3, color: 'var(--cruiser)' },
    { id: 4, name: 'Submarine', label: 'SM', length: 3, color: 'var(--submarine)' },
    { id: 5, name: 'Destroyer', label: 'DE', length: 2, color: 'var(--destroyer)' }
];

export const DIFFICULTY_LEVELS = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
};

export const GAME_STATES = {
    SETUP: 'setup',
    PLAYING: 'playing',
    FINISHED: 'finished'
};

export const TURN_STATES = {
    PLAYER: 'player',
    BOT: 'bot'
};

export const BOT_TURN_DELAY = 600; // milliseconds
export const MAX_SHIP_PLACEMENT_ATTEMPTS = 5;
export const MAX_SHIP_ATTEMPT_ITERATIONS = 300;

// Scoring constants
export const BASE_SCORE_WIN = 1000;
export const BASE_SCORE_LOSS = 250;
export const ACCURACY_MULTIPLIER = 4;
export const SPEED_BONUS_THRESHOLD = 120;
export const SPEED_BONUS_MULTIPLIER = 2;

// Ship placement constants
export const ORIENTATIONS = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical'
};

// AI targeting difficulty levels
export const AI_CONFIG = {
    EASY: {
        name: 'Easy',
        strategy: 'random'
    },
    MEDIUM: {
        name: 'Medium',
        strategy: 'checkerboard'
    },
    HARD: {
        name: 'Hard',
        strategy: 'smart'
    }
};

export const DEFAULT_BOARD_SIZE = 10;
export const DEFAULT_DIFFICULTY = DIFFICULTY_LEVELS.MEDIUM;
export const DEFAULT_THEME = 'system';
export const DEFAULT_ANIMATIONS_ENABLED = true;
