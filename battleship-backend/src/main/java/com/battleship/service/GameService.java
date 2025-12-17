package com.battleship.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.battleship.model.Board;
import com.battleship.model.Game;
import com.battleship.model.Player;
import com.battleship.model.Ship;
import com.battleship.model.Shot;

@Service
public class GameService {
    private final Map<String, Game> games = new HashMap<>();
    private final Map<String, Player> players = new HashMap<>();

    public Game createGame(String player1Name, String player2Name) {
        Player player1 = new Player(player1Name);
        Player player2 = new Player(player2Name);
        
        players.put(player1.getId(), player1);
        players.put(player2.getId(), player2);
        
        Game game = new Game(player1, player2);
        games.put(game.getGameId(), game);
        
        return game;
    }

    public Optional<Game> getGame(String gameId) {
        return Optional.ofNullable(games.get(gameId));
    }

    public boolean placeShip(String gameId, String playerId, Ship.ShipType shipType, 
                           int x, int y, Ship.Orientation orientation) {
        Game game = games.get(gameId);
        if (game == null) {
            throw new IllegalArgumentException("Game not found");
        }

        Player player = getPlayerInGame(game, playerId);
        Board board = player.getBoard();
        
        Ship ship = board.createShip(shipType);
        return board.placeShip(ship, x, y, orientation);
    }

    public void randomPlaceShips(String gameId, String playerId) {
        Game game = games.get(gameId);
        if (game == null) {
            throw new IllegalArgumentException("Game not found");
        }

        Player player = getPlayerInGame(game, playerId);
        player.getBoard().randomlyPlaceAllShips();
        player.setReady(true);
    }

    public void setPlayerReady(String gameId, String playerId) {
        Game game = games.get(gameId);
        if (game == null) {
            throw new IllegalArgumentException("Game not found");
        }

        Player player = getPlayerInGame(game, playerId);
        player.setReady(true);
        
        // Try to start the game if both players are ready
        game.startGame();
    }

    public Shot fireShot(String gameId, String playerId, int x, int y) {
        Game game = games.get(gameId);
        if (game == null) {
            throw new IllegalArgumentException("Game not found");
        }

        Player player = getPlayerInGame(game, playerId);
        
        if (game.getCurrentPlayer() != player) {
            throw new IllegalStateException("Not your turn");
        }

        return game.processShot(x, y);
    }

    public void cancelGame(String gameId) {
        Game game = games.get(gameId);
        if (game != null) {
            game.cancelGame();
        }
    }

    private Player getPlayerInGame(Game game, String playerId) {
        if (game.getPlayer1().getId().equals(playerId)) {
            return game.getPlayer1();
        } else if (game.getPlayer2().getId().equals(playerId)) {
            return game.getPlayer2();
        }
        throw new IllegalArgumentException("Player not in this game");
    }

    public Map<String, Game> getAllGames() {
        return new HashMap<>(games);
    }
}
