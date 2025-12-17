package com.battleship.model;

import java.util.ArrayList;
import java.util.List;

public class Ship {
    public enum ShipType {
        CARRIER(5),
        BATTLESHIP(4),
        CRUISER(3),
        SUBMARINE(3),
        DESTROYER(2);

        private final int size;

        ShipType(int size) {
            this.size = size;
        }

        public int getSize() {
            return size;
        }
    }

    public enum Orientation {
        HORIZONTAL,
        VERTICAL
    }

    private final ShipType type;
    private final int size;
    private int startX;
    private int startY;
    private Orientation orientation;
    private List<Cell> occupiedCells;
    private int hitCount;
    private boolean isSunk;

    public Ship(ShipType type) {
        this.type = type;
        this.size = type.getSize();
        this.occupiedCells = new ArrayList<>();
        this.hitCount = 0;
        this.isSunk = false;
    }

    public void place(int x, int y, Orientation orientation) {
        this.startX = x;
        this.startY = y;
        this.orientation = orientation;
    }

    public void addOccupiedCell(Cell cell) {
        this.occupiedCells.add(cell);
    }

    public void registerHit() {
        this.hitCount++;
        if (this.hitCount >= this.size) {
            this.isSunk = true;
        }
    }

    public boolean isPlaced() {
        return !occupiedCells.isEmpty();
    }

    // Getters
    public ShipType getType() {
        return type;
    }

    public int getSize() {
        return size;
    }

    public int getStartX() {
        return startX;
    }

    public int getStartY() {
        return startY;
    }

    public Orientation getOrientation() {
        return orientation;
    }

    public List<Cell> getOccupiedCells() {
        return occupiedCells;
    }

    public int getHitCount() {
        return hitCount;
    }

    public boolean isSunk() {
        return isSunk;
    }
}
