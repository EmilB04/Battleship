package com.battleship.model;

import java.util.UUID;

public class Player {
    private final String id;
    private final String name;
    private final Board board;
    private int shotsFired;
    private int shotsHit;
    private int shotsMissed;
    private int shipsRemaining;
    private boolean isReady;

    public Player(String name) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.board = new Board();
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.shotsMissed = 0;
        this.shipsRemaining = 5;
        this.isReady = false;
    }

    public void recordShot(boolean hit) {
        shotsFired++;
        if (hit) {
            shotsHit++;
        } else {
            shotsMissed++;
        }
    }

    public void shipSunk() {
        shipsRemaining--;
    }

    public boolean hasLost() {
        return shipsRemaining == 0;
    }

    public double getAccuracy() {
        if (shotsFired == 0) return 0.0;
        return (double) shotsHit / shotsFired * 100;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Board getBoard() {
        return board;
    }

    public int getShotsFired() {
        return shotsFired;
    }

    public int getShotsHit() {
        return shotsHit;
    }

    public int getShotsMissed() {
        return shotsMissed;
    }

    public int getShipsRemaining() {
        return shipsRemaining;
    }

    public boolean isReady() {
        return isReady;
    }

    public void setReady(boolean ready) {
        isReady = ready;
    }
}
