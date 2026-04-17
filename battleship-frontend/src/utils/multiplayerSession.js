const MULTIPLAYER_SESSION_STORAGE_KEY = 'multiplayerSession';

export const saveMultiplayerSession = (session) => {
    if (!session || typeof session !== 'object') {
        return;
    }

    const payload = {
        pin: String(session.pin || '').trim(),
        playerId: String(session.playerId || '').trim(),
        username: String(session.username || '').trim(),
        status: String(session.status || '').trim().toLowerCase(),
        savedAt: new Date().toISOString()
    };

    if (!payload.pin || !payload.playerId || !payload.username) {
        return;
    }

    localStorage.setItem(MULTIPLAYER_SESSION_STORAGE_KEY, JSON.stringify(payload));
};

export const loadMultiplayerSession = () => {
    const raw = localStorage.getItem(MULTIPLAYER_SESSION_STORAGE_KEY);
    if (!raw) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw);
        const pin = String(parsed?.pin || '').trim();
        const playerId = String(parsed?.playerId || '').trim();
        const username = String(parsed?.username || '').trim();

        if (!/^\d{6}$/.test(pin) || !playerId || !username) {
            return null;
        }

        return {
            pin,
            playerId,
            username,
            status: ['waiting', 'playing', 'finished'].includes(parsed?.status) ? parsed.status : '',
            savedAt: parsed?.savedAt || null
        };
    } catch {
        return null;
    }
};

export const clearMultiplayerSession = () => {
    localStorage.removeItem(MULTIPLAYER_SESSION_STORAGE_KEY);
};
