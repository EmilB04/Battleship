package com.battleship.model;

/**
 * Game class representing a Battleship game instance.
 * Note: Game logic is handled in the frontend (React).
 */
public class Game {
	private Player player1;
	private Player player2;
	private String status;

	public Game(Player player1, Player player2) {
		this.player1 = player1;
		this.player2 = player2;
		this.status = "SETUP";
	}

	public Player getPlayer1() {
		return player1;
	}

	public Player getPlayer2() {
		return player2;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}
}
