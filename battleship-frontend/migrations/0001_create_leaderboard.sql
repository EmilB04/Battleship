CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    username TEXT NOT NULL,
    result TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    grid_size INTEGER NOT NULL,
    score INTEGER NOT NULL,
    player_shots INTEGER NOT NULL,
    accuracy INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_score_timestamp
    ON leaderboard_entries (score DESC, timestamp DESC);
