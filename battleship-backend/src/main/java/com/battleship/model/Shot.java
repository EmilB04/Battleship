package com.battleship.model;

import java.time.LocalDateTime;

public class Shot {
    public enum ShotResult {
        HIT,
        MISS,
        SUNK
    }

    private final int x;
    private final int y;
    private final ShotResult result;
    private final LocalDateTime timestamp;
    private Ship sunkShip;  // If result is SUNK, reference to the ship

    public Shot(int x, int y, ShotResult result) {
        this.x = x;
        this.y = y;
        this.result = result;
        this.timestamp = LocalDateTime.now();
    }

    public Shot(int x, int y, ShotResult result, Ship sunkShip) {
        this(x, y, result);
        this.sunkShip = sunkShip;
    }

    // Getters
    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public ShotResult getResult() {
        return result;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public Ship getSunkShip() {
        return sunkShip;
    }
}
