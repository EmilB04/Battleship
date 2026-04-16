import { MAX_LEADERBOARD_ENTRIES } from '../constants/gameConstants';

const PRIMARY_API_BASE = '/api/leaderboard';
const LOCALHOST_API_BASE = 'http://localhost:8788/api/leaderboard';

const isValidEntry = (entry) => {
    if (!entry || typeof entry !== 'object') {
        return false;
    }

    return typeof entry.id === 'string'
        && typeof entry.timestamp === 'string'
        && typeof entry.username === 'string'
        && typeof entry.result === 'string'
        && typeof entry.difficulty === 'string'
        && typeof entry.score === 'number'
        && typeof entry.playerShots === 'number'
        && typeof entry.accuracy === 'number';
};

export const normalizeLeaderboardEntries = (entries) => {
    if (!Array.isArray(entries)) {
        return [];
    }

    return entries
        .filter(isValidEntry)
        .sort((a, b) => b.score - a.score || Date.parse(b.timestamp) - Date.parse(a.timestamp))
        .slice(0, MAX_LEADERBOARD_ENTRIES);
};

const fetchFromBase = async (baseUrl, pathSuffix, init) => {
    const response = await fetch(`${baseUrl}${pathSuffix}`, init);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
};

const requestWithFallback = async (pathSuffix, init) => {
    try {
        const data = await fetchFromBase(PRIMARY_API_BASE, pathSuffix, init);
        return { data, source: 'd1' };
    } catch (primaryError) {
        try {
            const data = await fetchFromBase(LOCALHOST_API_BASE, pathSuffix, init);
            return { data, source: 'localhost' };
        } catch (localhostError) {
            const message = `Primary API failed: ${String(primaryError)}. Localhost fallback failed: ${String(localhostError)}`;
            throw new Error(message);
        }
    }
};

export const fetchLeaderboardEntries = async () => {
    try {
        const { data, source } = await requestWithFallback('', {
            method: 'GET',
            headers: {
                Accept: 'application/json'
            }
        });

        return {
            entries: normalizeLeaderboardEntries(data.entries || []),
            source
        };
    } catch (error) {
        console.warn('Leaderboard API unavailable, using empty local state:', error);
        return {
            entries: [],
            source: 'unavailable'
        };
    }
};

export const createLeaderboardEntryRemote = async (entry) => {
    const { data, source } = await requestWithFallback('', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify(entry)
    });

    return {
        entry: data.entry,
        source
    };
};

export const deleteLeaderboardEntryRemote = async (entryId) => {
    const { source } = await requestWithFallback(`/${encodeURIComponent(entryId)}`, {
        method: 'DELETE'
    });

    return { source };
};
