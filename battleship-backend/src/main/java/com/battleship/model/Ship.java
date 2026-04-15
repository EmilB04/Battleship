package com.battleship.model;

/**
 * Ship class representing a battleship on the game board.
 * Note: Game logic is handled in the frontend (React).
 */
public class Ship {
	private String name;
	private int length;
	private int row;
	private int col;
	private String orientation;

	public Ship(String name, int length) {
		this.name = name;
		this.length = length;
	}

	public String getName() {
		return name;
	}

	public int getLength() {
		return length;
	}

	public int getRow() {
		return row;
	}

	public void setRow(int row) {
		this.row = row;
	}

	public int getCol() {
		return col;
	}

	public void setCol(int col) {
		this.col = col;
	}

	public String getOrientation() {
		return orientation;
	}

	public void setOrientation(String orientation) {
		this.orientation = orientation;
	}
}
