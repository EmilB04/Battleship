package com.battleship.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Board class representing a Battleship game board.
 * Note: Game logic is primarily handled in the frontend (React).
 * This class serves as a minimal data model.
 */
public class Board {
    // Constants
    private static final int BOARD_WIDTH = 10;
    private static final int BOARD_HEIGHT = 10;
    private final Cell[][] grid;

    // Fields
    private List<Ship> ships;

    // Constructor
    public Board() {
        grid = new Cell[BOARD_WIDTH][BOARD_HEIGHT];
        ships = new ArrayList<>();
        
        // Initialize grid cells
        for (int i = 0; i < BOARD_WIDTH; i++) {
            for (int j = 0; j < BOARD_HEIGHT; j++) {
                grid[i][j] = new Cell(i, j);
            }
        }
    }

    // Getters
    public List<Ship> getShips() {
        return ships;
    }

    public Cell[][] getGrid() {
        return grid;
    }

    public Cell getCell(int x, int y) {
        if (isValidCoordinate(x, y)) {
            return grid[x][y];
        }
        return null;
    }

    public int getBoardWidth() {
        return BOARD_WIDTH;
    }

    public int getBoardHeight() {
        return BOARD_HEIGHT;
    }

    // Public methods
    public void addShip(Ship ship) {
        if (ship != null) {
            ships.add(ship);
        }
    }

    public void removeShip(Ship ship) {
        if (ship != null) {
            ships.remove(ship);
        }
    }

    // Helper methods
    private boolean isValidCoordinate(int x, int y) {
        return x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT;
    }
}
