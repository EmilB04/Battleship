package com.battleship.model;

import java.util.ArrayList;
import java.util.List;

public class Board {
    // Constants
    private final int BOARD_WIDTH = 10;
    private final int BOARD_HEIGHT = 10;
    private final Cell[][] GRID;
    private final int MAX_SHIPS = 5;

    // Fields
    private List<Ship> ships;
    private List<Ship> sunkShips;
    private List<Shot> shotsFired;
    private List<Shot> shotsReceived;

    // Status flags 
    private boolean allShipsPlaced = false;
    private boolean allShipsSunk = false;

    // Constructor
    public Board() {
        GRID = new Cell[BOARD_WIDTH][BOARD_HEIGHT];
        this.ships = new ArrayList<>();
        this.sunkShips = new ArrayList<>();
        this.shotsFired = new ArrayList<>();
        this.shotsReceived = new ArrayList<>();
        
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
        allShipsPlaced = ships.size() == MAX_SHIPS && ships.stream().allMatch(Ship::isPlaced);
        return allShipsPlaced;
    }
    
    private boolean areAllShipsSunk() {
        allShipsSunk = sunkShips.size() == MAX_SHIPS;
        return allShipsSunk;
    }
    
    // Helper method to validate coordinates
    private boolean isValidCoordinate(int x, int y) {
        return x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT;
    }
    
    // Helper method to get cells that would be occupied by a ship
    private List<Cell> getShipCells(int startX, int startY, int size, Ship.Orientation orientation) {
        List<Cell> cells = new ArrayList<>();
        
        for (int i = 0; i < size; i++) {
            int x = orientation == Ship.Orientation.HORIZONTAL ? startX + i : startX;
            int y = orientation == Ship.Orientation.VERTICAL ? startY + i : startY;
            
            if (!isValidCoordinate(x, y)) {
                return null; // Invalid placement
            }
            cells.add(GRID[x][y]);
        }
        return cells;
    }
    
    // Helper method to check if a cell is occupied
    private boolean isCellOccupied(int x, int y) {
        if (!isValidCoordinate(x, y)) {
            return false;
        }
        return GRID[x][y].isOccupied();
    }
    
    // Helper method to check if ship placement is valid
    private boolean canPlaceShip(int startX, int startY, int size, Ship.Orientation orientation) {
        List<Cell> cells = getShipCells(startX, startY, size, orientation);
        
        if (cells == null) {
            return false; // Out of bounds
        }
        
        // Check if any cell is already occupied
        for (Cell cell : cells) {
            if (cell.isOccupied()) {
                return false;
            }
        }
        
        // Check adjacent cells (ships can't touch)
        for (Cell cell : cells) {
            int x = cell.getX();
            int y = cell.getY();
            
            // Check all 8 surrounding cells
            for (int dx = -1; dx <= 1; dx++) {
                for (int dy = -1; dy <= 1; dy++) {
                    if (dx == 0 && dy == 0) continue;
                    
                    int adjX = x + dx;
                    int adjY = y + dy;
                    
                    if (isValidCoordinate(adjX, adjY) && GRID[adjX][adjY].isOccupied()) {
                        // Check if this adjacent cell is part of the same ship we're placing
                        boolean partOfSameShip = cells.stream()
                            .anyMatch(c -> c.getX() == adjX && c.getY() == adjY);
                        if (!partOfSameShip) {
                            return false;
                        }
                    }
                }
            }
        }
        
        return true;
    }

    // Helper method to check if a cell has already been shot at
    private boolean isAlreadyShot(int x, int y) {
        if (!isValidCoordinate(x, y)) {
            return false;
        }
        return GRID[x][y].isShot();
    }
    





    /*      Public methods      */

    // Method to add a ship to the board (creates the ship but doesn't place it)
    public Ship createShip(Ship.ShipType type) {
        if (ships.size() >= MAX_SHIPS) {
            throw new IllegalStateException("All ships have already been added to the board.");
        }
        
        // Check if this ship type already exists
        boolean typeExists = ships.stream().anyMatch(s -> s.getType() == type);
        if (typeExists) {
            throw new IllegalArgumentException("A ship of type " + type + " has already been added.");
        }
        
        Ship ship = new Ship(type);
        ships.add(ship);
        return ship;
    }
    
    // Method to place a ship on the board
    public boolean placeShip(Ship ship, int startX, int startY, Ship.Orientation orientation) {
        if (!ships.contains(ship)) {
            throw new IllegalArgumentException("Ship must be created first using createShip().");
        }
        
        if (ship.isPlaced()) {
            throw new IllegalStateException("Ship has already been placed.");
        }
        
        if (!canPlaceShip(startX, startY, ship.getSize(), orientation)) {
            return false;
        }
        
        // Place the ship
        ship.place(startX, startY, orientation);
        List<Cell> cells = getShipCells(startX, startY, ship.getSize(), orientation);
        
        for (Cell cell : cells) {
            cell.placeShip(ship);
            ship.addOccupiedCell(cell);
        }
        
        return true;
    }
    
    // Method to shoot at a cell (this player shooting at opponent)
    public Shot shootAt(int x, int y) {
        if (!isValidCoordinate(x, y)) {
            throw new IllegalArgumentException("Coordinates are out of bounds.");
        }
        if (isAlreadyShot(x, y)) {
            throw new IllegalArgumentException("This cell has already been shot at.");
        }
        
        Cell cell = GRID[x][y];
        boolean isHit = cell.shoot();
        
        Shot.ShotResult result;
        Ship sunkShip = null;
        
        if (isHit) {
            Ship hitShip = cell.getShip();
            if (hitShip != null && hitShip.isSunk()) {
                result = Shot.ShotResult.SUNK;
                sunkShip = hitShip;
                if (!sunkShips.contains(hitShip)) {
                    sunkShips.add(hitShip);
                }
            } else {
                result = Shot.ShotResult.HIT;
            }
        } else {
            result = Shot.ShotResult.MISS;
        }
        
        Shot shot = sunkShip != null ? new Shot(x, y, result, sunkShip) : new Shot(x, y, result);
        shotsFired.add(shot);
        
        return shot;
    }
    
    // Method to receive a shot at a cell (opponent shooting at this player)
    public Shot receiveShot(int x, int y) {
        if (!isValidCoordinate(x, y)) {
            throw new IllegalArgumentException("Coordinates are out of bounds.");
        }
        if (isAlreadyShot(x, y)) {
            throw new IllegalArgumentException("This cell has already been shot at.");
        }

        Shot shot = shootAt(x, y);
        shotsReceived.add(shot);
        return shot;
    }
    
    // Method to get all valid ship types that haven't been placed yet
    public List<Ship.ShipType> getAvailableShipTypes() {
        List<Ship.ShipType> available = new ArrayList<>();
        for (Ship.ShipType type : Ship.ShipType.values()) {
            boolean hasType = ships.stream().anyMatch(s -> s.getType() == type);
            if (!hasType) {
                available.add(type);
            }
        }
        return available;
    }
    
    // Method to initialize all ships
    public void initializeAllShips() {
        for (Ship.ShipType type : Ship.ShipType.values()) {
            if (ships.size() < MAX_SHIPS) {
                createShip(type);
            }
        }
    }
    
    // Method to randomly place all ships (for AI or quick setup)
    public void randomlyPlaceAllShips() {
        initializeAllShips();
        java.util.Random random = new java.util.Random();
        
        for (Ship ship : ships) {
            if (!ship.isPlaced()) {
                boolean placed = false;
                int attempts = 0;
                
                while (!placed && attempts < 100) {
                    int x = random.nextInt(BOARD_WIDTH);
                    int y = random.nextInt(BOARD_HEIGHT);
                    Ship.Orientation orientation = random.nextBoolean() ? 
                        Ship.Orientation.HORIZONTAL : Ship.Orientation.VERTICAL;
                    
                    placed = placeShip(ship, x, y, orientation);
                    attempts++;
                }
                
                if (!placed) {
                    throw new IllegalStateException("Could not place ship: " + ship.getType());
                }
            }
        }
    }





    
    // Cell 
    public Cell getCell(int x, int y) {
        if (!isValidCoordinate(x, y)) {
            throw new IllegalArgumentException("Invalid coordinates");
        }
        return GRID[x][y];
    }

    // Getters
    public List<Ship> getShips() {
        return new ArrayList<>(ships);
    }
    
    public List<Ship> getSunkShips() {
        return new ArrayList<>(sunkShips);
    }
    
    public List<Shot> getShotsFired() {
        return new ArrayList<>(shotsFired);
    }
    
    public List<Shot> getShotsReceived() {
        return new ArrayList<>(shotsReceived);
    }
    
    public Cell[][] getGrid() {
        return GRID;
    }
    
    public int getBoardWidth() {
        return BOARD_WIDTH;
    }
    
    public int getBoardHeight() {
        return BOARD_HEIGHT;
    }
    
    public boolean isAllShipsPlaced() {
        return areAllShipsPlaced();
    }
    
    public boolean isAllShipsSunk() {
        return areAllShipsSunk();
    }
}
