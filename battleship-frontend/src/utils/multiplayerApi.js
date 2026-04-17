const PRIMARY_API_BASE = '/api/multiplayer';
const LOCALHOST_API_BASE = 'http://localhost:8788/api/multiplayer';

const fetchFromBase = async (baseUrl, pathSuffix = '', init = {}) => {
    const response = await fetch(`${baseUrl}${pathSuffix}`, init);
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        const message = payload?.error || `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return payload;
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
            throw new Error(`Primary API failed: ${String(primaryError)}. Localhost fallback failed: ${String(localhostError)}`);
        }
    }
};

export const createMultiplayerRoom = async ({ username, boardSize = 10 }) => {
    const { data, source } = await requestWithFallback('', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({ action: 'create', username, boardSize })
    });

    return { ...data, source };
};

export const joinMultiplayerRoom = async ({ username, pin }) => {
    const { data, source } = await requestWithFallback('', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({ action: 'join', username, pin })
    });

    return { ...data, source };
};

export const fetchMultiplayerRoom = async ({ pin, playerId }) => {
    const encodedPin = encodeURIComponent(pin);
    const suffix = `/${encodedPin}?playerId=${encodeURIComponent(playerId)}`;

    const { data, source } = await requestWithFallback(suffix, {
        method: 'GET',
        headers: {
            Accept: 'application/json'
        }
    });

    return { ...data, source };
};

export const placeMultiplayerFleet = async ({ pin, playerId, fleet }) => {
    const { data, source } = await requestWithFallback(`/${encodeURIComponent(pin)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({
            action: 'placeFleet',
            playerId,
            fleet
        })
    });

    return { ...data, source };
};

export const fireMultiplayerShot = async ({ pin, playerId, row, col }) => {
    const { data, source } = await requestWithFallback(`/${encodeURIComponent(pin)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({
            action: 'fire',
            playerId,
            row,
            col
        })
    });

    return { ...data, source };
};

export const leaveMultiplayerRoom = async ({ pin, playerId }) => {
    const { data, source } = await requestWithFallback(`/${encodeURIComponent(pin)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({
            action: 'leave',
            playerId
        })
    });

    return { ...data, source };
};

export const requestMultiplayerRematch = async ({ pin, playerId }) => {
    const { data, source } = await requestWithFallback(`/${encodeURIComponent(pin)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({
            action: 'rematch',
            playerId
        })
    });

    return { ...data, source };
};

export const resumeMultiplayerSession = async ({ pin, playerId }) => {
    const { data, source } = await requestWithFallback(`/${encodeURIComponent(pin)}?playerId=${encodeURIComponent(playerId)}`, {
        method: 'GET',
        headers: {
            Accept: 'application/json'
        }
    });

    return { ...data, source };
};

export const createMultiplayerRoomStream = ({
    pin,
    playerId,
    onRoom,
    onError,
    onOpen
}) => {
    const encodedPin = encodeURIComponent(pin);
    const encodedPlayerId = encodeURIComponent(playerId);
    const primaryUrl = `${PRIMARY_API_BASE}/${encodedPin}/stream?playerId=${encodedPlayerId}`;
    const fallbackUrl = `${LOCALHOST_API_BASE}/${encodedPin}/stream?playerId=${encodedPlayerId}`;

    let source = null;
    let usingFallback = false;
    let wasClosed = false;

    const close = () => {
        wasClosed = true;
        if (source) {
            source.close();
            source = null;
        }
    };

    const attachSource = (url) => {
        if (wasClosed) {
            return;
        }

        source = new EventSource(url);

        source.addEventListener('open', () => {
            if (onOpen) {
                onOpen({ source: usingFallback ? 'localhost' : 'd1' });
            }
        });

        source.addEventListener('room_update', (event) => {
            try {
                const payload = JSON.parse(event.data);
                if (payload?.room && onRoom) {
                    onRoom(payload.room);
                }
            } catch (parseError) {
                if (onError) {
                    onError(parseError);
                }
            }
        });

        source.addEventListener('stream_error', (event) => {
            if (onError) {
                onError(new Error(event.data || 'Realtime stream error'));
            }
        });

        source.onerror = (event) => {
            if (wasClosed) {
                return;
            }

            source?.close();
            source = null;

            if (!usingFallback) {
                usingFallback = true;
                attachSource(fallbackUrl);
                return;
            }

            if (onError) {
                onError(event instanceof ErrorEvent ? event.error : new Error('Realtime stream disconnected'));
            }
        };
    };

    attachSource(primaryUrl);
    return { close };
};
