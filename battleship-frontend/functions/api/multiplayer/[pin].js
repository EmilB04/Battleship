import {
    cleanupExpiredRooms,
    createJsonResponse,
    ensureDatabaseBinding,
    ensureMultiplayerSchema,
    formatRoomState,
    getExpiryIso,
    getPlayerSlot,
    hasRematchColumns,
    isFleetDefeatedByShots,
    nowIso,
    serializeJson,
    validateFleet
} from './_shared.js';

const parseShotPayload = (payload, boardSize) => {
    const row = Number(payload?.row);
    const col = Number(payload?.col);

    if (!Number.isInteger(row) || !Number.isInteger(col)) {
        return { error: 'Shot coordinates must be integers.' };
    }

    if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
        return { error: 'Shot coordinates are out of bounds.' };
    }

    return { key: `${row}-${col}` };
};

const getRoomByPin = async (db, pin) => {
    const { results } = await db.prepare('SELECT * FROM multiplayer_rooms WHERE pin = ?').bind(pin).all();
    return results?.[0] || null;
};

export async function onRequestGet(context) {
    const { env, params, request } = context;

    try {
        const db = ensureDatabaseBinding(env);
        await ensureMultiplayerSchema(db);
    } catch (error) {
        return createJsonResponse({ error: String(error) }, 500);
    }

    await cleanupExpiredRooms(env.DB);

    const pin = String(params?.pin || '').trim();
    if (!/^\d{6}$/.test(pin)) {
        return createJsonResponse({ error: 'Invalid room PIN.' }, 400);
    }

    const room = await getRoomByPin(env.DB, pin);
    if (!room) {
        return createJsonResponse({ error: 'Room not found.' }, 404);
    }

    const state = formatRoomState(room);
    const url = new URL(request.url);
    const playerId = String(url.searchParams.get('playerId') || '').trim();
    if (playerId && !getPlayerSlot(state, playerId)) {
        return createJsonResponse({ error: 'Invalid player session.' }, 403);
    }

    return createJsonResponse({ room: state });
}

export async function onRequestPost(context) {
    const { env, params, request } = context;

    try {
        const db = ensureDatabaseBinding(env);
        await ensureMultiplayerSchema(db);
    } catch (error) {
        return createJsonResponse({ error: String(error) }, 500);
    }

    await cleanupExpiredRooms(env.DB);
    const rematchSupported = await hasRematchColumns(env.DB);

    const pin = String(params?.pin || '').trim();
    if (!/^\d{6}$/.test(pin)) {
        return createJsonResponse({ error: 'Invalid room PIN.' }, 400);
    }

    let payload;
    try {
        payload = await request.json();
    } catch {
        return createJsonResponse({ error: 'Invalid JSON body.' }, 400);
    }

    const action = payload?.action;
    const playerId = String(payload?.playerId || '').trim();
    if (!playerId) {
        return createJsonResponse({ error: 'Missing playerId.' }, 400);
    }

    const room = await getRoomByPin(env.DB, pin);
    if (!room) {
        return createJsonResponse({ error: 'Room not found.' }, 404);
    }

    const state = formatRoomState(room);
    const playerSlot = getPlayerSlot(state, playerId);
    if (!playerSlot) {
        return createJsonResponse({ error: 'Invalid player session.' }, 403);
    }

    if (state.status === 'finished' && action !== 'leave' && action !== 'rematch') {
        return createJsonResponse({ error: 'Game has already finished.' }, 409);
    }

    const now = nowIso();
    const nextExpiry = getExpiryIso();

    if (action === 'placeFleet') {
        const fleet = payload?.fleet;
        const validation = validateFleet(fleet, state.boardSize);
        if (!validation.valid) {
            return createJsonResponse({ error: validation.message }, 400);
        }

        const fleetColumn = playerSlot === 'player1' ? 'player1_fleet_json' : 'player2_fleet_json';

        await env.DB.prepare(
            `UPDATE multiplayer_rooms
             SET ${fleetColumn} = ?,
                 ${rematchSupported ? 'player1_rematch_ready = 0, player2_rematch_ready = 0,' : ''}
                 updated_at = ?,
                 expires_at = ?
             WHERE pin = ?`
        )
            .bind(serializeJson(fleet), now, nextExpiry, pin)
            .run();

        const updatedRoom = await getRoomByPin(env.DB, pin);
        const updatedState = formatRoomState(updatedRoom);

        if (
            updatedState.status === 'waiting'
            && updatedState.player1.ready
            && updatedState.player2.ready
        ) {
            await env.DB.prepare(
                `UPDATE multiplayer_rooms
                 SET status = 'playing',
                     turn = 'player1',
                     updated_at = ?,
                     expires_at = ?
                 WHERE pin = ?`
            )
                .bind(nowIso(), getExpiryIso(), pin)
                .run();
        }

        const latestRoom = await getRoomByPin(env.DB, pin);
        return createJsonResponse({ room: formatRoomState(latestRoom) }, 200);
    }

    if (action === 'fire') {
        if (state.status !== 'playing') {
            return createJsonResponse({ error: 'Game is not ready for shots.' }, 409);
        }

        if (state.turn !== playerSlot) {
            return createJsonResponse({ error: 'It is not your turn.' }, 409);
        }

        const shot = parseShotPayload(payload, state.boardSize);
        if (shot.error) {
            return createJsonResponse({ error: shot.error }, 400);
        }

        const shotsForPlayer = [...state.shots[playerSlot]];
        if (shotsForPlayer.includes(shot.key)) {
            return createJsonResponse({ error: 'This cell was already targeted.' }, 409);
        }

        shotsForPlayer.push(shot.key);

        const opponentSlot = playerSlot === 'player1' ? 'player2' : 'player1';
        const opponentFleet = state.fleets[opponentSlot];
        const winner = isFleetDefeatedByShots(opponentFleet, shotsForPlayer) ? playerSlot : null;

        const shotsColumn = playerSlot === 'player1' ? 'player1_shots_json' : 'player2_shots_json';
        const nextTurn = winner ? null : opponentSlot;
        const nextStatus = winner ? 'finished' : 'playing';

        await env.DB.prepare(
            `UPDATE multiplayer_rooms
             SET ${shotsColumn} = ?,
                 ${rematchSupported ? 'player1_rematch_ready = 0, player2_rematch_ready = 0,' : ''}
                 turn = ?,
                 winner = ?,
                 status = ?,
                 updated_at = ?,
                 expires_at = ?
             WHERE pin = ?`
        )
            .bind(serializeJson(shotsForPlayer), nextTurn, winner, nextStatus, now, nextExpiry, pin)
            .run();

        const latestRoom = await getRoomByPin(env.DB, pin);
        return createJsonResponse({ room: formatRoomState(latestRoom) }, 200);
    }

    if (action === 'leave') {
        const opponentSlot = playerSlot === 'player1' ? 'player2' : 'player1';
        const opponentExists = Boolean(state[opponentSlot]?.id);
        const winnerValue = opponentExists ? `${opponentSlot}:forfeit` : null;

        await env.DB.prepare(
            `UPDATE multiplayer_rooms
             SET status = 'finished',
                 winner = ?,
                 updated_at = ?,
                 expires_at = ?
             WHERE pin = ?`
        )
            .bind(
                winnerValue,
                now,
                nextExpiry,
                pin
            )
            .run();

        return createJsonResponse({ left: true }, 200);
    }

    if (action === 'rematch') {
        if (!rematchSupported) {
            return createJsonResponse({ error: 'Rematch requires migration 0003_add_multiplayer_rematch_flags.sql to be applied.' }, 409);
        }

        if (state.status !== 'finished') {
            return createJsonResponse({ error: 'Rematch is only available after the game ends.' }, 409);
        }

        const rematchColumn = playerSlot === 'player1' ? 'player1_rematch_ready' : 'player2_rematch_ready';

        await env.DB.prepare(
            `UPDATE multiplayer_rooms
             SET ${rematchColumn} = 1,
                 updated_at = ?,
                 expires_at = ?
             WHERE pin = ?`
        )
            .bind(now, nextExpiry, pin)
            .run();

        const updatedRoom = await getRoomByPin(env.DB, pin);
        const updatedState = formatRoomState(updatedRoom);

        if (updatedState.player1.rematchReady && updatedState.player2.rematchReady) {
            if (!updatedState.player1.ready || !updatedState.player2.ready) {
                return createJsonResponse({ error: 'Both players must have fleets available for rematch.' }, 409);
            }

            await env.DB.prepare(
                `UPDATE multiplayer_rooms
                 SET status = 'playing',
                     winner = NULL,
                     turn = 'player1',
                     player1_shots_json = ?,
                     player2_shots_json = ?,
                     player1_rematch_ready = 0,
                     player2_rematch_ready = 0,
                     updated_at = ?,
                     expires_at = ?
                 WHERE pin = ?`
            )
                .bind(serializeJson([]), serializeJson([]), nowIso(), getExpiryIso(), pin)
                .run();
        }

        const latestRoom = await getRoomByPin(env.DB, pin);
        return createJsonResponse({ room: formatRoomState(latestRoom) }, 200);
    }

    return createJsonResponse({ error: 'Unsupported action.' }, 400);
}
