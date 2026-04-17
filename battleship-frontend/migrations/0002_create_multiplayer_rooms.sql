CREATE TABLE IF NOT EXISTS multiplayer_rooms (
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
);

CREATE INDEX IF NOT EXISTS idx_multiplayer_rooms_expires
    ON multiplayer_rooms (expires_at);
