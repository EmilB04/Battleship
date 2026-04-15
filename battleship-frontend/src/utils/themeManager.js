/**
 * Theme Management Utilities
 * Handles light/dark mode theme switching and system preferences
 */

import {
    THEME_STORAGE_KEY,
    ANIMATIONS_STORAGE_KEY,
    DEFAULT_THEME,
    DEFAULT_ANIMATIONS_ENABLED
} from '../constants/gameConstants.js';

/**
 * Apply theme to document
 * @param {string} theme - 'light', 'dark', or 'system'
 * @returns {void}
 */
export const applyTheme = (theme) => {
    const root = document.documentElement;

    if (theme === 'dark') {
        root.classList.add('dark-mode');
        root.classList.remove('light-mode');
    } else if (theme === 'light') {
        root.classList.add('light-mode');
        root.classList.remove('dark-mode');
    } else {
        // System theme - remove explicit theme classes
        root.classList.remove('dark-mode', 'light-mode');
    }
};

/**
 * Apply animations setting to document
 * @param {boolean} enabled - Whether animations are enabled
 * @returns {void}
 */
export const applyAnimations = (enabled) => {
    const root = document.documentElement;

    if (!enabled) {
        root.classList.add('no-animations');
    } else {
        root.classList.remove('no-animations');
    }
};

/**
 * Initialize theme from localStorage and apply it
 * @returns {{theme: string, animationsEnabled: boolean}} Current theme settings
 */
export const initializeTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
    const animationsEnabled = localStorage.getItem(ANIMATIONS_STORAGE_KEY) !== 'false';

    applyTheme(savedTheme);
    applyAnimations(animationsEnabled);

    return { theme: savedTheme, animationsEnabled };
};

/**
 * Set theme and persist to localStorage
 * @param {string} theme - 'light', 'dark', or 'system'
 * @returns {void}
 */
export const setTheme = (theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
};

/**
 * Get current theme from localStorage
 * @returns {string} Current theme ('light', 'dark', or 'system')
 */
export const getTheme = () => {
    return localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
};

/**
 * Toggle animations setting
 * @returns {boolean} New animations enabled state
 */
export const toggleAnimations = () => {
    const current = localStorage.getItem(ANIMATIONS_STORAGE_KEY) !== 'false';
    const newState = !current;

    localStorage.setItem(ANIMATIONS_STORAGE_KEY, newState.toString());
    applyAnimations(newState);

    return newState;
};

/**
 * Set animations enabled state
 * @param {boolean} enabled - Whether animations should be enabled
 * @returns {void}
 */
export const setAnimationsEnabled = (enabled) => {
    localStorage.setItem(ANIMATIONS_STORAGE_KEY, enabled.toString());
    applyAnimations(enabled);
};

/**
 * Get current animations enabled state
 * @returns {boolean} Whether animations are enabled
 */
export const getAnimationsEnabled = () => {
    return localStorage.getItem(ANIMATIONS_STORAGE_KEY) !== 'false';
};

/**
 * Setup system theme listener for automatic updates
 * @returns {() => void} Cleanup function to remove listener
 */
export const setupSystemThemeListener = () => {
    const currentTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (currentTheme !== 'system') {
        return () => {}; // No listener needed if not in system mode
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        const theme = localStorage.getItem(THEME_STORAGE_KEY);
        if (theme === 'system') {
            applyTheme('system');
        }
    };

    mediaQuery.addEventListener('change', handleChange);

    // Return cleanup function
    return () => mediaQuery.removeEventListener('change', handleChange);
};

/**
 * Get the effective current system theme preference
 * @returns {string} 'dark' or 'light'
 */
export const getSystemThemePreference = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};
