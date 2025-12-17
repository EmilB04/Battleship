# Battleship Game - Backend

A complete, fully functional Battleship game backend built with Spring Boot 3.5.8 and Java 21.

## Quick Start

### Run the Test Program
```bash
./run-tests.sh
```

### Start the Server
```bash
mvn spring-boot:run
```

The REST API will be available at `http://localhost:8080/api/games`

## Features

### ✅ Complete Game Logic
- **5 Ship Types**: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2)
- **Turn-based Gameplay**: Two-player with automatic turn management
- **Hit Detection**: Accurate hit/miss/sunk results
- **Win Conditions**: Automatic game end when all ships are sunk
- **Ship Placement Validation**: 
  - No overlapping ships
  - Ships can't touch (including diagonally)
  - Boundary checking
  - Manual or random placement

### 🎮 Game States
- **SETUP**: Players placing ships
- **IN_PROGRESS**: Active gameplay
- **FINISHED**: Game completed with winner
- **CANCELLED**: Game abandoned

### 📊 Statistics Tracking
- Shots fired/hit/missed per player
- Accuracy percentage
- Ships remaining
- Turn count
- Game duration timestamps

### 🔌 REST API
- Create and manage games
- Place ships (manual or random)
- Fire shots
- View game state
- Cancel games

## Project Structure

```
src/main/java/com/battleship/
├── model/              # Game domain models
│   ├── Board.java      # 10x10 game board with placement/shooting logic
│   ├── Cell.java       # Individual board cell with state
│   ├── Game.java       # Game flow and turn management
│   ├── Player.java     # Player with statistics
│   ├── Ship.java       # Ship types, placement, hit tracking
│   └── Shot.java       # Shot results and timestamp
├── service/            # Business logic
│   └── GameService.java
├── controller/         # REST endpoints
│   └── GameController.java
├── dto/               # Data transfer objects
│   ├── CreateGameRequest.java
│   ├── PlaceShipRequest.java
│   └── FireShotRequest.java
├── Application.java   # Spring Boot main class
└── GameTestProgram.java  # Comprehensive test program
```

## Testing

### Automated Test Program

Run the comprehensive test suite that validates all game logic:

```bash
./run-tests.sh
```

The test program includes **7 test suites**:

1. **Ship Placement** - Validation, adjacency, boundaries
2. **Shooting Mechanics** - Hit/miss/sunk detection
3. **Game Flow** - State transitions, turn management
4. **Random Placement** - Algorithm validation
5. **Validation Logic** - Error handling, boundary checks
6. **Game Service** - Service layer integration
7. **Complete Game Simulation** - Full gameplay with statistics

See [TEST_PROGRAM.md](TEST_PROGRAM.md) for detailed documentation.

### Manual Testing

You can also test individual components:
```bash
# Compile the project
mvn clean compile

# Run specific test
mvn exec:java -Dexec.mainClass="com.battleship.GameTestProgram"
```

## API Examples

### Create a Game
```bash
curl -X POST http://localhost:8080/api/games \
  -H "Content-Type: application/json" \
  -d '{"player1Name": "Alice", "player2Name": "Bob"}'
```

### Random Place Ships
```bash
curl -X POST http://localhost:8080/api/games/{gameId}/players/{playerId}/random-placement
```

### Place Ship Manually
```bash
curl -X POST http://localhost:8080/api/games/place-ship \
  -H "Content-Type: application/json" \
  -d '{
    "gameId": "...",
    "playerId": "...",
    "shipType": "CARRIER",
    "x": 0,
    "y": 0,
    "orientation": "HORIZONTAL"
  }'
```

### Fire Shot
```bash
curl -X POST http://localhost:8080/api/games/fire-shot \
  -H "Content-Type: application/json" \
  -d '{
    "gameId": "...",
    "playerId": "...",
    "x": 5,
    "y": 5
  }'
```

### Get Game State
```bash
curl http://localhost:8080/api/games/{gameId}
```

## Technology Stack

- **Java 21** - Latest LTS version
- **Spring Boot 3.5.8** - Latest Spring Boot version
- **Spring Framework 6.2.x** - Core framework
- **Maven 3.9+** - Build tool
- **Spring Web** - REST API
- **Spring WebSocket** - Ready for real-time features

## Game Rules

### Ship Placement
- Each player has 5 ships of different sizes
- Ships can be placed horizontally or vertically
- Ships cannot overlap
- Ships cannot touch each other (including diagonally)
- Ships must be within the 10x10 board

### Gameplay
- Players take turns firing shots
- Each shot targets a coordinate (x, y) where 0 ≤ x, y ≤ 9
- Results: HIT (hit a ship), MISS (hit water), SUNK (destroyed a ship)
- Cannot shoot the same cell twice
- Game ends when all of one player's ships are sunk

### Winning
- First player to sink all opponent's ships wins
- Statistics are tracked for analysis

## Development

### Build
```bash
mvn clean compile
```

### Package
```bash
mvn clean package
```

### Run
```bash
mvn spring-boot:run
```

### Clean
```bash
mvn clean
```

## Future Enhancements

Potential features to add:
- 🔐 Authentication and user management
- 💾 Database persistence (PostgreSQL/MongoDB)
- 🔌 WebSocket for real-time gameplay
- 🤖 AI opponent with difficulty levels
- 📊 Leaderboard and rankings
- 🎨 Frontend UI (React/Vue/Angular)
- 🎮 Different game modes (salvo, mine, etc.)
- 📱 Mobile app integration
- 🔄 Game replays
- 💬 In-game chat
- 🌐 Multiplayer lobby system
- 🏆 Achievements and badges

## Contributing

This is a demonstration project showcasing:
- Clean architecture with separation of concerns
- Comprehensive game logic implementation
- RESTful API design
- Test-driven development approach
- Modern Java and Spring Boot features

## License

This project is for educational and demonstration purposes.

## Authors

Created as a comprehensive Battleship game implementation with Spring Boot 3.5.8.
