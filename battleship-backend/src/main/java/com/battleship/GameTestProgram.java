package com.battleship;

import com.battleship.model.Board;
import com.battleship.model.Cell;
import com.battleship.model.Game;
import com.battleship.model.Player;
import com.battleship.model.Ship;
import com.battleship.model.Shot;
import com.battleship.service.GameService;

/**
 * Test program to demonstrate and verify Battleship game logic
 */
public class GameTestProgram {

    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("   BATTLESHIP GAME LOGIC TEST PROGRAM");
        System.out.println("=================================================\n");

        GameTestProgram tester = new GameTestProgram();
        
        // Run all tests
        tester.testShipPlacement();
        tester.testShootingMechanics();
        tester.testGameFlow();
        tester.testRandomPlacement();
        tester.testValidation();
        tester.testGameService();
        tester.testCompleteGame();

        System.out.println("\n=================================================");
        System.out.println("   ALL TESTS COMPLETED SUCCESSFULLY!");
        System.out.println("=================================================");
    }

    /**
     * Test 1: Ship Placement
     */
    public void testShipPlacement() {
        System.out.println("\n[TEST 1] Testing Ship Placement");
        System.out.println("----------------------------------");

        Board board = new Board();
        
        // Test creating and placing a carrier horizontally
        Ship carrier = board.createShip(Ship.ShipType.CARRIER);
        boolean placed = board.placeShip(carrier, 0, 0, Ship.Orientation.HORIZONTAL);
        System.out.println("✓ Carrier (size 5) placed horizontally at (0,0): " + placed);
        assert placed : "Carrier should be placed successfully";

        // Test placing a battleship vertically
        Ship battleship = board.createShip(Ship.ShipType.BATTLESHIP);
        placed = board.placeShip(battleship, 2, 2, Ship.Orientation.VERTICAL);
        System.out.println("✓ Battleship (size 4) placed vertically at (2,2): " + placed);
        assert placed : "Battleship should be placed successfully";

        // Test invalid placement (overlapping)
        Ship cruiser = board.createShip(Ship.ShipType.CRUISER);
        placed = board.placeShip(cruiser, 0, 0, Ship.Orientation.HORIZONTAL);
        System.out.println("✓ Cruiser placement at occupied space (0,0): " + placed + " (should be false)");
        assert !placed : "Cruiser should not be placed on occupied space";

        // Test invalid placement (adjacent ships)
        placed = board.placeShip(cruiser, 1, 0, Ship.Orientation.HORIZONTAL);
        System.out.println("✓ Cruiser placement adjacent to carrier: " + placed + " (should be false)");
        assert !placed : "Cruiser should not be placed adjacent to another ship";

        // Test valid placement
        placed = board.placeShip(cruiser, 5, 5, Ship.Orientation.HORIZONTAL);
        System.out.println("✓ Cruiser placed at valid position (5,5): " + placed);
        assert placed : "Cruiser should be placed at valid position";

        System.out.println("✓ Ship placement tests passed!");
    }

    /**
     * Test 2: Shooting Mechanics
     */
    public void testShootingMechanics() {
        System.out.println("\n[TEST 2] Testing Shooting Mechanics");
        System.out.println("------------------------------------");

        Board board = new Board();
        Ship destroyer = board.createShip(Ship.ShipType.DESTROYER);
        board.placeShip(destroyer, 3, 3, Ship.Orientation.HORIZONTAL);

        // Test miss
        Shot shot1 = board.shootAt(0, 0);
        System.out.println("✓ Shot at empty cell (0,0): " + shot1.getResult() + " (should be MISS)");
        assert shot1.getResult() == Shot.ShotResult.MISS : "Shot at empty cell should miss";

        // Test hit
        Shot shot2 = board.shootAt(3, 3);
        System.out.println("✓ Shot at destroyer (3,3): " + shot2.getResult() + " (should be HIT)");
        assert shot2.getResult() == Shot.ShotResult.HIT : "Shot at ship should hit";

        // Test second hit
        Shot shot3 = board.shootAt(4, 3);
        System.out.println("✓ Shot at destroyer (4,3): " + shot3.getResult() + " (should be SUNK)");
        assert shot3.getResult() == Shot.ShotResult.SUNK : "Second hit on destroyer should sink it";
        assert destroyer.isSunk() : "Destroyer should be sunk";

        // Test shooting at already shot cell
        try {
            board.shootAt(3, 3);
            assert false : "Should throw exception for duplicate shot";
        } catch (IllegalArgumentException e) {
            System.out.println("✓ Duplicate shot correctly prevented: " + e.getMessage());
        }

        System.out.println("✓ Shooting mechanics tests passed!");
    }

    /**
     * Test 3: Game Flow
     */
    public void testGameFlow() {
        System.out.println("\n[TEST 3] Testing Game Flow");
        System.out.println("--------------------------");

        Player player1 = new Player("Alice");
        Player player2 = new Player("Bob");
        Game game = new Game(player1, player2);

        System.out.println("✓ Game created with state: " + game.getState());
        assert game.getState() == Game.GameState.SETUP : "New game should be in SETUP state";

        // Try to start game without ready players
        boolean started = game.startGame();
        System.out.println("✓ Starting game without ready players: " + started + " (should be false)");
        assert !started : "Game should not start without ready players";

        // Set players ready
        player1.setReady(true);
        player2.setReady(true);
        started = game.startGame();
        System.out.println("✓ Starting game with ready players: " + started + " (should be true)");
        assert started : "Game should start with ready players";
        assert game.getState() == Game.GameState.IN_PROGRESS : "Game should be in IN_PROGRESS state";

        System.out.println("✓ Current player: " + game.getCurrentPlayer().getName());
        assert game.getCurrentPlayer() == player1 : "Player 1 should start";

        System.out.println("✓ Game flow tests passed!");
    }

    /**
     * Test 4: Random Placement
     */
    public void testRandomPlacement() {
        System.out.println("\n[TEST 4] Testing Random Ship Placement");
        System.out.println("---------------------------------------");

        Board board = new Board();
        board.randomlyPlaceAllShips();

        int placedShips = board.getShips().size();
        System.out.println("✓ Number of ships placed: " + placedShips);
        assert placedShips == 5 : "All 5 ships should be placed";

        // Verify all ships are actually placed
        long actuallyPlaced = board.getShips().stream().filter(Ship::isPlaced).count();
        System.out.println("✓ Number of ships with positions: " + actuallyPlaced);
        assert actuallyPlaced == 5 : "All ships should have positions";

        // Print ship positions
        System.out.println("\nShip Positions:");
        for (Ship ship : board.getShips()) {
            System.out.printf("  - %s: (%d,%d) %s, Size: %d\n",
                ship.getType(),
                ship.getStartX(),
                ship.getStartY(),
                ship.getOrientation(),
                ship.getSize());
        }

        System.out.println("\n✓ Random placement tests passed!");
    }

    /**
     * Test 5: Validation Logic
     */
    public void testValidation() {
        System.out.println("\n[TEST 5] Testing Validation Logic");
        System.out.println("----------------------------------");

        Board board = new Board();

        // Test out of bounds
        try {
            board.shootAt(10, 10);
            assert false : "Should throw exception for out of bounds";
        } catch (IllegalArgumentException e) {
            System.out.println("✓ Out of bounds shot prevented: " + e.getMessage());
        }

        // Test negative coordinates
        try {
            board.shootAt(-1, 5);
            assert false : "Should throw exception for negative coordinates";
        } catch (IllegalArgumentException e) {
            System.out.println("✓ Negative coordinate shot prevented: " + e.getMessage());
        }

        // Test ship placement out of bounds
        Ship carrier = board.createShip(Ship.ShipType.CARRIER);
        boolean placed = board.placeShip(carrier, 8, 0, Ship.Orientation.HORIZONTAL);
        System.out.println("✓ Ship placement out of bounds: " + placed + " (should be false)");
        assert !placed : "Ship should not be placed out of bounds";

        // Test duplicate ship type
        try {
            board.createShip(Ship.ShipType.CARRIER);
            assert false : "Should throw exception for duplicate ship type";
        } catch (IllegalArgumentException e) {
            System.out.println("✓ Duplicate ship type prevented: " + e.getMessage());
        }

        System.out.println("✓ Validation tests passed!");
    }

    /**
     * Test 6: Game Service
     */
    public void testGameService() {
        System.out.println("\n[TEST 6] Testing Game Service");
        System.out.println("------------------------------");

        GameService service = new GameService();
        
        // Create game
        Game game = service.createGame("Charlie", "Diana");
        System.out.println("✓ Game created with ID: " + game.getGameId());
        
        String gameId = game.getGameId();
        String player1Id = game.getPlayer1().getId();
        String player2Id = game.getPlayer2().getId();

        // Random place ships for both players
        service.randomPlaceShips(gameId, player1Id);
        service.randomPlaceShips(gameId, player2Id);
        System.out.println("✓ Ships randomly placed for both players");

        // Set players ready to start the game
        service.setPlayerReady(gameId, player1Id);
        service.setPlayerReady(gameId, player2Id);
        
        assert game.getState() == Game.GameState.IN_PROGRESS : "Game should be in progress";
        System.out.println("✓ Game started: " + game.getState());

        // Fire a shot
        Shot shot = service.fireShot(gameId, player1Id, 5, 5);
        System.out.println("✓ Shot fired at (5,5): " + shot.getResult());

        // Check turn switched
        assert game.getCurrentPlayer() == game.getPlayer2() : "Turn should have switched";
        System.out.println("✓ Turn switched to: " + game.getCurrentPlayer().getName());

        System.out.println("✓ Game service tests passed!");
    }

    /**
     * Test 7: Complete Game Simulation
     */
    public void testCompleteGame() {
        System.out.println("\n[TEST 7] Simulating Complete Game");
        System.out.println("----------------------------------");

        Player player1 = new Player("Player 1");
        Player player2 = new Player("Player 2");
        
        // Setup boards
        player1.getBoard().randomlyPlaceAllShips();
        player2.getBoard().randomlyPlaceAllShips();
        player1.setReady(true);
        player2.setReady(true);

        Game game = new Game(player1, player2);
        game.startGame();

        System.out.println("✓ Game setup complete");
        System.out.println("  Player 1 ships: " + player1.getBoard().getShips().size());
        System.out.println("  Player 2 ships: " + player2.getBoard().getShips().size());

        // Simulate some turns
        int maxTurns = 20;
        int turn = 0;
        
        while (!game.isGameOver() && turn < maxTurns) {
            Player currentPlayer = game.getCurrentPlayer();
            Player opponent = (currentPlayer == player1) ? player2 : player1;
            
            // Find a valid shot (simple strategy - just shoot randomly)
            boolean shotFired = false;
            for (int x = 0; x < 10 && !shotFired; x++) {
                for (int y = 0; y < 10 && !shotFired; y++) {
                    try {
                        Shot shot = game.processShot(x, y);
                        System.out.printf("  Turn %d: %s shot at (%d,%d) - %s\n",
                            turn + 1,
                            currentPlayer.getName(),
                            x, y,
                            shot.getResult());
                        shotFired = true;
                        turn++;
                        
                        if (shot.getResult() == Shot.ShotResult.SUNK) {
                            System.out.println("    ★ " + shot.getSunkShip().getType() + " sunk!");
                            System.out.println("    Opponent ships remaining: " + opponent.getShipsRemaining());
                        }
                    } catch (IllegalArgumentException e) {
                        // Cell already shot, try next
                    }
                }
            }
        }

        System.out.println("\n✓ Game simulation statistics:");
        System.out.println("  Total turns: " + turn);
        System.out.println("  Game state: " + game.getState());
        System.out.println("  Player 1 - Shots: " + player1.getShotsFired() + 
                         ", Hits: " + player1.getShotsHit() + 
                         ", Accuracy: " + String.format("%.1f%%", player1.getAccuracy()));
        System.out.println("  Player 2 - Shots: " + player2.getShotsFired() + 
                         ", Hits: " + player2.getShotsHit() + 
                         ", Accuracy: " + String.format("%.1f%%", player2.getAccuracy()));

        if (game.getWinner() != null) {
            System.out.println("  Winner: " + game.getWinner().getName());
        }

        System.out.println("\n✓ Complete game simulation passed!");
    }

    /**
     * Helper method to print board state (for debugging)
     */
    @SuppressWarnings("unused")
    private void printBoard(Board board, boolean hideShips) {
        System.out.println("\n  Board State:");
        System.out.print("    ");
        for (int x = 0; x < 10; x++) {
            System.out.print(x + " ");
        }
        System.out.println();

        for (int y = 0; y < 10; y++) {
            System.out.print("  " + y + " ");
            for (int x = 0; x < 10; x++) {
                Cell cell = board.getCell(x, y);
                char symbol = '.';
                
                switch (cell.getState()) {
                    case EMPTY:
                        symbol = '.';
                        break;
                    case SHIP:
                        symbol = hideShips ? '.' : 'S';
                        break;
                    case MISS:
                        symbol = 'O';
                        break;
                    case HIT:
                        symbol = 'X';
                        break;
                }
                System.out.print(symbol + " ");
            }
            System.out.println();
        }
    }
}
