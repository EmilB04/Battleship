import {
    cleanupExpiredRooms,
    createJsonResponse,
    createPinCode,
    createPlayerId,
    formatRoomState,
    getExpiryIso,
    normalizeBoardSize,
    nowIso,
    sanitizeUsername,
    serializeJson
} from './_shared.js';

const MAX_PIN_ATTEMPTS = 25;

const createRoom = async (env, username, boardSize) => {
    const player1Id = createPlayerId();
    const createdAt = nowIso();
    const expiresAt = getExpiryIso();

    for (let attempt = 0; attempt < MAX_PIN_ATTEMPTS; attempt += 1) {
        const pin = createPinCode();

        try {
            await env.DB.prepare(
                `INSERT INTO multiplayer_rooms (
                    pin,
                    created_at,
                    updated_at,
                    expires_at,
                    status,
                    board_size,
                    turn,
                    winner,
                    player1_id,
                    player1_name,
                    player2_id,
                    player2_name,
                    player1_fleet_json,
                    player2_fleet_json,
                    player1_shots_json,
                          player2_shots_json,
                          player1_rematch_ready,
                          player2_rematch_ready
                      ) VALUES (?, ?, ?, ?, 'waiting', ?, NULL, NULL, ?, ?, NULL, NULL, NULL, NULL, ?, ?, 0, 0)`
            )
                .bind(pin, createdAt, createdAt, expiresAt, boardSize, player1Id, username, serializeJson([]), serializeJson([]))
                .run();

            const { results } = await env.DB.prepare('SELECT * FROM multiplayer_rooms WHERE pin = ?').bind(pin).all();
            return { room: formatRoomState(results?.[0]), playerId: player1Id };
        } catch {
            // Collision can happen on generated PINs; retry with a new one.
        }
    }

    throw new Error('Unable to create multiplayer room right now. Please try again.');
};

const joinRoom = async (env, pin, username) => {
    const { results } = await env.DB.prepare('SELECT * FROM multiplayer_rooms WHERE pin = ?').bind(pin).all();
    const room = results?.[0];

    if (!room) {
        return { error: 'Room not found.', status: 404 };
    }

    if (room.status === 'finished') {
        return { error: 'Room already finished.', status: 409 };
    }

    if (room.player2_id) {
        return { error: 'Room is already full.', status: 409 };
    }

    const player2Id = createPlayerId();
    const updatedAt = nowIso();

    await env.DB.prepare(
        `UPDATE multiplayer_rooms
         SET player2_id = ?, player2_name = ?, updated_at = ?, expires_at = ?
         WHERE pin = ?`
    )
        .bind(player2Id, username, updatedAt, getExpiryIso(), pin)
        .run();

    const updated = await env.DB.prepare('SELECT * FROM multiplayer_rooms WHERE pin = ?').bind(pin).all();
    return { room: formatRoomState(updated?.results?.[0]), playerId: player2Id };
};

export async function onRequestPost(context) {
    const { request, env } = context;

    await cleanupExpiredRooms(env.DB);

    let payload;
    try {
        payload = await request.json();
    } catch {
        return createJsonResponse({ error: 'Invalid JSON body.' }, 400);
    }

    const action = payload?.action;
    const username = sanitizeUsername(payload?.username);

    if (!username) {
        return createJsonResponse({ error: 'Username is required.' }, 400);
    }

    try {
        if (action === 'create') {
            const boardSize = normalizeBoardSize(payload?.boardSize);
            const result = await createRoom(env, username, boardSize);
            return createJsonResponse(result, 201);
        }

        if (action === 'join') {
            const pin = String(payload?.pin || '').trim();
            if (!/^\d{6}$/.test(pin)) {
                return createJsonResponse({ error: 'PIN must be 6 digits.' }, 400);
            }

            const result = await joinRoom(env, pin, username);
            if (result.error) {
                return createJsonResponse({ error: result.error }, result.status || 400);
            }

            return createJsonResponse(result, 200);
        }

        return createJsonResponse({ error: 'Unsupported action.' }, 400);
    } catch (error) {
        return createJsonResponse({ error: String(error) }, 500);
    }
}
