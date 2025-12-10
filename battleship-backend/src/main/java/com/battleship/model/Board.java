package com.battleship.model;

import java.util.List;

public class Board {
    // Constants
    private final int BOARD_WIDTH = 10;
    private final int BOARD_HEIGHT = 10;
    private final Cell[][] GRID;
    private final int MAX_SHIPS = 5;

    // Fields
    private List<Ship> ships;
    private boolean allShipsPlaced = false;

    // Constructor
    public Board() {
        GRID = new Cell[BOARD_WIDTH][BOARD_HEIGHT];
        // Initialize grid cells
        for (int i = 0; i < BOARD_WIDTH; i++) {
            for (int j = 0; j < BOARD_HEIGHT; j++) {
                GRID[i][j] = new Cell(i, j);
            }
        }
    }

    /*      Helper methods      */

    // Helper method to check if all ships are placed
    private boolean areAllShipsPlaced() {
        allShipsPlaced = ships.size() == MAX_SHIPS;
        return allShipsPlaced;
    }
    // TODO: Helper method to check if all ships are sunk
    private boolean areAllShipsSunk() {
        System.out.println("TODO: areAllShipsSunk method");
        return false;
    }
    // Helper method to validate coordinates
    private boolean isValidCoordinate(int x, int y) {
        return x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT;
    }
    // TODO: Helper method to get occupied cells by a ship
    private void getOccupiedCells(Ship ship) {
        System.out.println("TODO: getOccupiedCells method");
    }
    // TODO: Helper method to check if a cell is occupied
    private boolean isCellOccupied(int x, int y) {
        // Call getOccupiedCells for all ships and check
        System.out.println("TODO: isCellOccupied method");
        return false;
    }
    // TODO: Helper method to check if ship placement is valid
    private boolean canPlaceShip(Ship ship) {
        // Use helper methods to validate placement
        System.out.println("TODO: isShipPlacementValid method");
        return false;
    }

    // TODO: Helper method to check if a cell has already been shot at
    private boolean isAreadyShot(int x, int y) {
        System.out.println("TODO: isAreadyShot method");
        return false;
    }
    





    /*      Public methods      */

    // Method to add a ship to the board
    public void addShip(Ship ship) {
        if (areAllShipsPlaced()) {
            throw new IllegalStateException("All ships have already been placed on the board.");
        } else {
            ships.add(ship);
        }
    }
    
    // TODO: Method to place a ship on the board
    public void placeShip(Ship ship) {
        if (!canPlaceShip(ship)) {
            throw new IllegalArgumentException("Invalid ship placement.");
        }
        // Place ship logic (to be implemented)
        System.out.println("TODO: placeShip method");
    }

    // TODO: Method to shoot at a cell
    public void shootAt(int x, int y) {
        if (!isValidCoordinate(x, y)) 
            throw new IllegalArgumentException("Coordinates are out of bounds.");
        if (isAreadyShot(x, y)) 
            throw new IllegalArgumentException("This cell has already been shot at.");
        // Shoot at cell logic (to be implemented)
        System.out.println("TODO: shootAt method");
    }
    // TODO: Method to receive a shot at a cell
    public void recieveShot(int x, int y) {
        if (!isValidCoordinate(x, y)) 
            throw new IllegalArgumentException("Coordinates are out of bounds.");
        if (isAreadyShot(x, y)) 
            throw new IllegalArgumentException("This cell has already been shot at.");

        // Receive shot logic (to be implemented)
        System.out.println("TODO: recieveShot method");
    }





    

    
    // Cell 
    public Cell getCell(int x, int y) {
        return GRID[x][y];
    }

    
    
    
    // Getters
    public List<Ship> getShips() {
        return ships;
    }
    public Cell[][] getGRID() {
        return GRID;
    }
}
