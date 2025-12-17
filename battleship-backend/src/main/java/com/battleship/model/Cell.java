package com.battleship.model;

public class Cell {
    public enum CellState {
        EMPTY,          // No ship, not shot
        SHIP,           // Contains ship, not shot
        MISS,           // No ship, shot
        HIT             // Contains ship, shot
    }

    private final int x;
    private final int y;
    private CellState state;
    private Ship ship;  // Reference to ship if cell contains one

    public Cell(int x, int y) {
        this.x = x;
        this.y = y;
        this.state = CellState.EMPTY;
        this.ship = null;
    }

    public void placeShip(Ship ship) {
        this.ship = ship;
        this.state = CellState.SHIP;
    }

    public boolean shoot() {
        if (state == CellState.MISS || state == CellState.HIT) {
            return false; // Already shot
        }

        if (state == CellState.SHIP) {
            state = CellState.HIT;
            if (ship != null) {
                ship.registerHit();
            }
            return true; // Hit!
        } else {
            state = CellState.MISS;
            return false; // Miss
        }
    }

    public boolean isOccupied() {
        return state == CellState.SHIP || state == CellState.HIT;
    }

    public boolean isShot() {
        return state == CellState.MISS || state == CellState.HIT;
    }

    // Getters
    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public CellState getState() {
        return state;
    }

    public Ship getShip() {
        return ship;
    }
}
