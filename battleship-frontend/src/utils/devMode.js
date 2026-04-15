/**
 * Developer Mode Utilities
 * Utilities for managing and handling developer mode
 */

import { DEV_MODE_STORAGE_KEY } from '../constants/gameConstants.js';

/**
 * Get current dev mode state from localStorage
 * @returns {boolean} True if dev mode is enabled
 */
export const getDevMode = () => {
    return localStorage.getItem(DEV_MODE_STORAGE_KEY) === 'true';
};

/**
 * Set dev mode state
 * @param {boolean} enabled - Whether dev mode should be enabled
 * @returns {void}
 */
export const setDevMode = (enabled) => {
    localStorage.setItem(DEV_MODE_STORAGE_KEY, enabled.toString());
};

/**
 * Toggle dev mode
 * @returns {boolean} New dev mode state
 */
export const toggleDevMode = () => {
    const currentMode = getDevMode();
    const newMode = !currentMode;
    setDevMode(newMode);
    return newMode;
};

/**
 * Setup dev mode keyboard shortcut listener (Ctrl+Shift+D)
 * @param {Function} onToggle - Callback function when dev mode is toggled
 * @returns {() => void} Cleanup function to remove listener
 */
export const setupDevModeListener = (onToggle) => {
    const handleKeyDown = (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            const newMode = toggleDevMode();
            console.log(newMode ? '🔧 Developer Mode Enabled' : '🔧 Developer Mode Disabled');
            if (onToggle) {
                onToggle(newMode);
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Log initial message
    console.log('Press Ctrl+Shift+D to toggle Developer Mode');

    // Return cleanup function
    return () => window.removeEventListener('keydown', handleKeyDown);
};

/**
 * Initialize dev mode from localStorage
 * @returns {boolean} Current dev mode state
 */
export const initializeDevMode = () => {
    return getDevMode();
};
