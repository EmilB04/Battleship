const ROOM_PIN_LENGTH = 6;
const DEFAULT_BOARD_SIZE = 10;
const ROOM_TTL_HOURS = 24;

export const ensureDatabaseBinding = (env) => {
    if (!env?.DB) {
        throw new Error('D1 database binding `DB` is not configured for this environment.');
    }

    return env.DB;
};

export const ensureMultiplayerSchema = async (db) => {
    await db.prepare(
        `CREATE TABLE IF NOT EXISTS multiplayer_rooms (
            pin TEXT PRIMARY KEY,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            status TEXT NOT NULL,
            board_size INTEGER NOT NULL,
            turn TEXT,
            winner TEXT,
            player1_id TEXT NOT NULL,
            player1_name TEXT NOT NULL,
            player2_id TEXT,
            player2_name TEXT,
            player1_fleet_json TEXT,
            player2_fleet_json TEXT,
            player1_shots_json TEXT NOT NULL,
            player2_shots_json TEXT NOT NULL
        )`
    ).run();

    await db.prepare(
        'CREATE INDEX IF NOT EXISTS idx_multiplayer_rooms_expires ON multiplayer_rooms (expires_at)'
    ).run();
};

export const hasRematchColumns = async (db) => {
    const { results } = await db.prepare('PRAGMA table_info(multiplayer_rooms)').all();
    const columnNames = new Set((results || []).map((column) => column.name));
    return columnNames.has('player1_rematch_ready') && columnNames.has('player2_rematch_ready');
};

export const createJsonResponse = (data, status = 200) => {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store'
        }
    });
};

export const sanitizeUsername = (value) => {
    return typeof value === 'string' ? value.trim().slice(0, 20) : '';
};

export const isValidBoardSize = (value) => {
    return Number.isInteger(value) && [8, 10, 12].includes(value);
};

export const normalizeBoardSize = (value) => {
    const parsed = Number(value);
    return isValidBoardSize(parsed) ? parsed : DEFAULT_BOARD_SIZE;
};

export const createPlayerId = () => crypto.randomUUID();

export const createPinCode = () => {
    const min = 10 ** (ROOM_PIN_LENGTH - 1);
    const max = (10 ** ROOM_PIN_LENGTH) - 1;
    return String(Math.floor(min + Math.random() * (max - min + 1)));
};

export const nowIso = () => new Date().toISOString();

export const getExpiryIso = () => {
    const date = new Date();
    date.setHours(date.getHours() + ROOM_TTL_HOURS);
    return date.toISOString();
};

export const cleanupExpiredRooms = async (db) => {
    await db.prepare('DELETE FROM multiplayer_rooms WHERE expires_at <= ?').bind(nowIso()).run();
};

export const parseJsonArray = (value) => {
    if (typeof value !== 'string' || !value) {
        return [];
    }

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const parseFleetJson = (value) => {
    const parsed = parseJsonArray(value);
    return parsed.filter((ship) => ship && typeof ship === 'object');
};

export const serializeJson = (value) => JSON.stringify(value);

export const formatRoomState = (roomRow) => {
    if (!roomRow) {
        return null;
    }

    const rawWinner = typeof roomRow.winner === 'string' ? roomRow.winner : null;
    let winner = rawWinner;
    let victoryReason = rawWinner ? 'sunk' : null;

    if (rawWinner && rawWinner.includes(':')) {
        const [winnerSlot, reason] = rawWinner.split(':');
        winner = winnerSlot || null;
        victoryReason = reason || 'sunk';
    }

    return {
        pin: roomRow.pin,
        status: roomRow.status,
        boardSize: roomRow.board_size,
        turn: roomRow.turn,
        winner,
        victoryReason,
        player1: {
            id: roomRow.player1_id,
            username: roomRow.player1_name,
            ready: Boolean(roomRow.player1_fleet_json),
            rematchReady: Boolean(roomRow.player1_rematch_ready || 0)
        },
        player2: {
            id: roomRow.player2_id,
            username: roomRow.player2_name,
            ready: Boolean(roomRow.player2_fleet_json),
            rematchReady: Boolean(roomRow.player2_rematch_ready || 0)
        },
        fleets: {
            player1: parseFleetJson(roomRow.player1_fleet_json),
            player2: parseFleetJson(roomRow.player2_fleet_json)
        },
        shots: {
            player1: parseJsonArray(roomRow.player1_shots_json),
            player2: parseJsonArray(roomRow.player2_shots_json)
        },
        updatedAt: roomRow.updated_at,
        expiresAt: roomRow.expires_at
    };
};

export const getPlayerSlot = (roomState, playerId) => {
    if (!playerId) {
        return null;
    }

    if (roomState.player1.id === playerId) {
        return 'player1';
    }

    if (roomState.player2.id === playerId) {
        return 'player2';
    }

    return null;
};

export const validateFleet = (fleet, boardSize) => {
    if (!Array.isArray(fleet) || fleet.length !== 5) {
        return { valid: false, message: 'Fleet must include exactly 5 ships.' };
    }

    const occupied = new Set();

    for (const ship of fleet) {
        const row = Number(ship?.row);
        const col = Number(ship?.col);
        const length = Number(ship?.length);
        const orientation = ship?.orientation;

        if (!Number.isInteger(row) || !Number.isInteger(col) || !Number.isInteger(length)) {
            return { valid: false, message: 'Fleet contains invalid ship coordinates.' };
        }

        if (!['horizontal', 'vertical'].includes(orientation)) {
            return { valid: false, message: 'Fleet contains invalid ship orientation.' };
        }

        for (let index = 0; index < length; index += 1) {
            const nextRow = orientation === 'horizontal' ? row : row + index;
            const nextCol = orientation === 'horizontal' ? col + index : col;

            if (nextRow < 0 || nextRow >= boardSize || nextCol < 0 || nextCol >= boardSize) {
                return { valid: false, message: 'Fleet contains out-of-bounds ship placement.' };
            }

            const key = `${nextRow}-${nextCol}`;
            if (occupied.has(key)) {
                return { valid: false, message: 'Fleet contains overlapping ships.' };
            }
            occupied.add(key);
        }
    }

    return { valid: true };
};

export const buildCellSetFromFleet = (fleet) => {
    const cells = new Set();

    for (const ship of fleet) {
        for (let index = 0; index < ship.length; index += 1) {
            const row = ship.orientation === 'horizontal' ? ship.row : ship.row + index;
            const col = ship.orientation === 'horizontal' ? ship.col + index : ship.col;
            cells.add(`${row}-${col}`);
        }
    }

    return cells;
};

export const isFleetDefeatedByShots = (fleet, shots) => {
    if (!Array.isArray(fleet) || fleet.length === 0) {
        return false;
    }

    const fleetCells = buildCellSetFromFleet(fleet);
    if (fleetCells.size === 0) {
        return false;
    }

    const shotSet = new Set(shots);
    for (const key of fleetCells) {
        if (!shotSet.has(key)) {
            return false;
        }
    }

    return true;
};
