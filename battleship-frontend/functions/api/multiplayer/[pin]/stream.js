import {
    cleanupExpiredRooms,
    createJsonResponse,
    ensureDatabaseBinding,
    ensureMultiplayerSchema,
    formatRoomState,
    getPlayerSlot
} from '../_shared.js';

const ROOM_POLL_DELAY_MS = 500;
const STREAM_MAX_LOOPS = 110;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRoomByPin = async (db, pin) => {
    const { results } = await db.prepare('SELECT * FROM multiplayer_rooms WHERE pin = ?').bind(pin).all();
    return results?.[0] || null;
};

const createEventChunk = (eventName, payload) => {
    const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return `event: ${eventName}\ndata: ${body}\n\n`;
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

    const url = new URL(request.url);
    const playerId = String(url.searchParams.get('playerId') || '').trim();
    if (!playerId) {
        return createJsonResponse({ error: 'Missing playerId.' }, 400);
    }

    const room = await getRoomByPin(env.DB, pin);
    if (!room) {
        return createJsonResponse({ error: 'Room not found.' }, 404);
    }

    const state = formatRoomState(room);
    if (!getPlayerSlot(state, playerId)) {
        return createJsonResponse({ error: 'Invalid player session.' }, 403);
    }

    const stream = new ReadableStream({
        async start(controller) {
            let lastUpdatedAt = null;

            try {
                for (let loopIndex = 0; loopIndex < STREAM_MAX_LOOPS; loopIndex += 1) {
                    const currentRoom = await getRoomByPin(env.DB, pin);
                    if (!currentRoom) {
                        controller.enqueue(createEventChunk('room_closed', { closed: true }));
                        break;
                    }

                    const currentState = formatRoomState(currentRoom);
                    if (!currentState || !getPlayerSlot(currentState, playerId)) {
                        controller.enqueue(createEventChunk('session_invalid', { invalid: true }));
                        break;
                    }

                    if (currentState.updatedAt !== lastUpdatedAt) {
                        lastUpdatedAt = currentState.updatedAt;
                        controller.enqueue(createEventChunk('room_update', { room: currentState }));
                    }

                    await sleep(ROOM_POLL_DELAY_MS);
                }

                controller.enqueue(createEventChunk('keepalive', { ok: true }));
            } catch (error) {
                controller.enqueue(createEventChunk('stream_error', { error: String(error) }));
            } finally {
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-store',
            Connection: 'keep-alive'
        }
    });
}
