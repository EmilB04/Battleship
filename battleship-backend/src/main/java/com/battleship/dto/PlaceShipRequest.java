package com.battleship.dto;

import com.battleship.model.Ship;

public class PlaceShipRequest {
    private String gameId;
    private String playerId;
    private Ship.ShipType shipType;
    private int x;
    private int y;
    private Ship.Orientation orientation;

    // Constructors
    public PlaceShipRequest() {}

    public PlaceShipRequest(String gameId, String playerId, Ship.ShipType shipType, 
                           int x, int y, Ship.Orientation orientation) {
        this.gameId = gameId;
        this.playerId = playerId;
        this.shipType = shipType;
        this.x = x;
        this.y = y;
        this.orientation = orientation;
    }

    // Getters and Setters
    public String getGameId() {
        return gameId;
    }

    public void setGameId(String gameId) {
        this.gameId = gameId;
    }

    public String getPlayerId() {
        return playerId;
    }

    public void setPlayerId(String playerId) {
        this.playerId = playerId;
    }

    public Ship.ShipType getShipType() {
        return shipType;
    }

    public void setShipType(Ship.ShipType shipType) {
        this.shipType = shipType;
    }

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

    public Ship.Orientation getOrientation() {
        return orientation;
    }

    public void setOrientation(Ship.Orientation orientation) {
        this.orientation = orientation;
    }
}
