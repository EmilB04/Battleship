package com.battleship.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class Game {
    public enum GameState {
        SETUP,          // Players are placing ships
        IN_PROGRESS,    // Game is active
        FINISHED,       // Game has ended
        CANCELLED       // Game was cancelled
    }

    private final String gameId;
    private final Player player1;
    private final Player player2;
    private Player currentPlayer;
    private Player winner;
    private GameState state;
    private final LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private int turnCount;

    public Game(Player player1, Player player2) {
        this.gameId = UUID.randomUUID().toString();
        this.player1 = player1;
        this.player2 = player2;
        this.currentPlayer = player1;
        this.state = GameState.SETUP;
        this.createdAt = LocalDateTime.now();
        this.turnCount = 0;
    }

    // Check if both players are ready and start the game
    public boolean startGame() {
        if (!player1.isReady() || !player2.isReady()) {
            return false;
        }
        
        this.state = GameState.IN_PROGRESS;
        this.startedAt = LocalDateTime.now();
        return true;
    }

    // Process a shot from the current player
    public Shot processShot(int x, int y) {
        if (state != GameState.IN_PROGRESS) {
            throw new IllegalStateException("Game is not in progress");
        }

        Player opponent = getOpponent(currentPlayer);
        Shot shot = opponent.getBoard().receiveShot(x, y);
        
        // Update player statistics
        currentPlayer.recordShot(shot.getResult() != Shot.ShotResult.MISS);
        
        // Check if ship was sunk
        if (shot.getResult() == Shot.ShotResult.SUNK) {
            opponent.shipSunk();
            
            // Check if opponent has lost
            if (opponent.hasLost()) {
                endGame(currentPlayer);
            }
        }
        
        // Switch turns
        switchTurn();
        
        return shot;
    }

    private void switchTurn() {
        currentPlayer = (currentPlayer == player1) ? player2 : player1;
        turnCount++;
    }

    private void endGame(Player winner) {
        this.winner = winner;
        this.state = GameState.FINISHED;
        this.finishedAt = LocalDateTime.now();
    }

    public void cancelGame() {
        this.state = GameState.CANCELLED;
        this.finishedAt = LocalDateTime.now();
    }

    private Player getOpponent(Player player) {
        return (player == player1) ? player2 : player1;
    }

    // Getters
    public String getGameId() {
        return gameId;
    }

    public Player getPlayer1() {
        return player1;
    }

    public Player getPlayer2() {
        return player2;
    }

    public Player getCurrentPlayer() {
        return currentPlayer;
    }

    public Player getWinner() {
        return winner;
    }

    public GameState getState() {
        return state;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public LocalDateTime getFinishedAt() {
        return finishedAt;
    }

    public int getTurnCount() {
        return turnCount;
    }

    public boolean isGameOver() {
        return state == GameState.FINISHED || state == GameState.CANCELLED;
    }
}
