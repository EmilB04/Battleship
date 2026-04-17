ALTER TABLE multiplayer_rooms
    ADD COLUMN player1_rematch_ready INTEGER NOT NULL DEFAULT 0;

ALTER TABLE multiplayer_rooms
    ADD COLUMN player2_rematch_ready INTEGER NOT NULL DEFAULT 0;
