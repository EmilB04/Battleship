const MAX_LEADERBOARD_ENTRIES = 15;

const LEADERBOARD_ORDER_BY = 'score DESC, timestamp DESC, id DESC';

const createJsonResponse = (data, status = 200) => {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store'
        }
    });
};

const parseEntryPayload = (raw) => {
    const username = typeof raw.username === 'string' ? raw.username.trim() : '';
    const result = raw.result === 'player' || raw.result === 'bot' ? raw.result : null;
    const difficulty = typeof raw.difficulty === 'string' ? raw.difficulty.trim().toLowerCase() : null;
    const gridSize = Number(raw.gridSize);
    const score = Number(raw.score);
    const playerShots = Number(raw.playerShots);
    const accuracy = Number(raw.accuracy);

    const allowedDifficulties = new Set(['easy', 'medium', 'hard', 'extreme']);

    if (!username || username.length > 32) {
        return { valid: false, message: 'Invalid username' };
    }
    if (!result) {
        return { valid: false, message: 'Invalid result' };
    }
    if (!allowedDifficulties.has(difficulty)) {
        return { valid: false, message: 'Invalid difficulty' };
    }
    if (!Number.isInteger(gridSize) || gridSize < 5 || gridSize > 26) {
        return { valid: false, message: 'Invalid grid size' };
    }
    if (!Number.isFinite(score) || score < 0) {
        return { valid: false, message: 'Invalid score' };
    }
    if (!Number.isInteger(playerShots) || playerShots < 0) {
        return { valid: false, message: 'Invalid shots count' };
    }
    if (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100) {
        return { valid: false, message: 'Invalid accuracy' };
    }

    return {
        valid: true,
        entry: {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            username,
            result,
            difficulty,
            gridSize,
            score: Math.round(score),
            playerShots,
            accuracy: Math.round(accuracy)
        }
    };
};

const cleanupDuplicateEntries = async (db) => {
    await db.prepare(
        `DELETE FROM leaderboard_entries
         WHERE id IN (
             SELECT id FROM (
                 SELECT
                     id,
                     ROW_NUMBER() OVER (
                         PARTITION BY username, difficulty, grid_size
                         ORDER BY score DESC, timestamp DESC, id DESC
                     ) AS row_number
                 FROM leaderboard_entries
             )
             WHERE row_number > 1
         )`
    ).run();
};

const fetchUniqueLeaderboardEntries = async (db) => {
    await cleanupDuplicateEntries(db);

    const { results } = await db.prepare(
        `SELECT
            id,
            timestamp,
            username,
            result,
            difficulty,
            grid_size AS gridSize,
            score,
            player_shots AS playerShots,
            accuracy
         FROM leaderboard_entries
         ORDER BY ${LEADERBOARD_ORDER_BY}
         LIMIT ?`
    )
        .bind(MAX_LEADERBOARD_ENTRIES)
        .all();

    return results || [];
};

export async function onRequestGet(context) {
    const { env } = context;

    try {
        const entries = await fetchUniqueLeaderboardEntries(env.DB);
        return createJsonResponse({ entries });
    } catch (error) {
        return createJsonResponse(
            { error: 'Failed to load leaderboard entries', details: String(error) },
            500
        );
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;

    let rawPayload;
    try {
        rawPayload = await request.json();
    } catch {
        return createJsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    const parsed = parseEntryPayload(rawPayload);
    if (!parsed.valid) {
        return createJsonResponse({ error: parsed.message }, 400);
    }

    const entry = parsed.entry;

    try {
        await env.DB.prepare(
            `INSERT INTO leaderboard_entries
                (id, timestamp, username, result, difficulty, grid_size, score, player_shots, accuracy)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
            .bind(
                entry.id,
                entry.timestamp,
                entry.username,
                entry.result,
                entry.difficulty,
                entry.gridSize,
                entry.score,
                entry.playerShots,
                entry.accuracy
            )
            .run();

        const entries = await fetchUniqueLeaderboardEntries(env.DB);

        return createJsonResponse({ entry, entries }, 201);
    } catch (error) {
        return createJsonResponse(
            { error: 'Failed to save leaderboard entry', details: String(error) },
            500
        );
    }
}
