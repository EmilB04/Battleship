package com.battleship.model;

/**
 * Player class representing a Battleship player.
 * Note: Game logic is handled in the frontend (React).
 */
public class Player {
	private String name;
	private Board board;

	public Player(String name) {
		this.name = name;
		this.board = new Board();
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Board getBoard() {
		return board;
	}
}
