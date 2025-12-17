package com.battleship.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.battleship.dto.CreateGameRequest;
import com.battleship.dto.FireShotRequest;
import com.battleship.dto.PlaceShipRequest;
import com.battleship.model.Game;
import com.battleship.model.Shot;
import com.battleship.service.GameService;

@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = "*")
public class GameController {

    @Autowired
    private GameService gameService;

    @PostMapping
    public ResponseEntity<Game> createGame(@RequestBody CreateGameRequest request) {
        try {
            Game game = gameService.createGame(request.getPlayer1Name(), request.getPlayer2Name());
            return ResponseEntity.status(HttpStatus.CREATED).body(game);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<Game> getGame(@PathVariable String gameId) {
        return gameService.getGame(gameId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<Map<String, Game>> getAllGames() {
        return ResponseEntity.ok(gameService.getAllGames());
    }

    @PostMapping("/place-ship")
    public ResponseEntity<String> placeShip(@RequestBody PlaceShipRequest request) {
        try {
            boolean success = gameService.placeShip(
                request.getGameId(),
                request.getPlayerId(),
                request.getShipType(),
                request.getX(),
                request.getY(),
                request.getOrientation()
            );
            
            if (success) {
                return ResponseEntity.ok("Ship placed successfully");
            } else {
                return ResponseEntity.badRequest().body("Invalid ship placement");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{gameId}/players/{playerId}/random-placement")
    public ResponseEntity<String> randomPlaceShips(
            @PathVariable String gameId,
            @PathVariable String playerId) {
        try {
            gameService.randomPlaceShips(gameId, playerId);
            return ResponseEntity.ok("Ships placed randomly");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{gameId}/players/{playerId}/ready")
    public ResponseEntity<String> setPlayerReady(
            @PathVariable String gameId,
            @PathVariable String playerId) {
        try {
            gameService.setPlayerReady(gameId, playerId);
            return ResponseEntity.ok("Player ready");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/fire-shot")
    public ResponseEntity<Shot> fireShot(@RequestBody FireShotRequest request) {
        try {
            Shot shot = gameService.fireShot(
                request.getGameId(),
                request.getPlayerId(),
                request.getX(),
                request.getY()
            );
            return ResponseEntity.ok(shot);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{gameId}")
    public ResponseEntity<String> cancelGame(@PathVariable String gameId) {
        try {
            gameService.cancelGame(gameId);
            return ResponseEntity.ok("Game cancelled");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
