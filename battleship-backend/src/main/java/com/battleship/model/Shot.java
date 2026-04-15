package com.battleship.model;

/**
 * Shot class representing a shot in a Battleship game.
 * Note: Game logic is handled in the frontend (React).
 */
public class Shot {
	private int row;
	private int col;
	private boolean isHit;

	public Shot(int row, int col) {
		this.row = row;
		this.col = col;
		this.isHit = false;
	}

	public int getRow() {
		return row;
	}

	public int getCol() {
		return col;
	}

	public boolean isHit() {
		return isHit;
	}

	public void setHit(boolean hit) {
		isHit = hit;
	}
}
