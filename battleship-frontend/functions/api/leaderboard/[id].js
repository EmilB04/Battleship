const createJsonResponse = (data, status = 200) => {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store'
        }
    });
};

export async function onRequestDelete(context) {
    const { env, params } = context;
    const entryId = typeof params.id === 'string' ? params.id.trim() : '';

    if (!entryId) {
        return createJsonResponse({ error: 'Missing leaderboard entry id' }, 400);
    }

    try {
        const result = await env.DB.prepare('DELETE FROM leaderboard_entries WHERE id = ?')
            .bind(entryId)
            .run();

        if (!result.success) {
            return createJsonResponse({ error: 'Failed to delete leaderboard entry' }, 500);
        }

        return createJsonResponse({ deleted: true });
    } catch (error) {
        return createJsonResponse(
            { error: 'Failed to delete leaderboard entry', details: String(error) },
            500
        );
    }
}
