# Battleship Game Test Program

## Overview
`GameTestProgram.java` is a comprehensive testing program that demonstrates and verifies all game logic functionality of the Battleship backend.

## Running the Test Program

### Method 1: Using Maven
```bash
mvn compile exec:java -Dexec.mainClass="com.battleship.GameTestProgram"
```

### Method 2: Using Maven (quiet mode)
```bash
mvn compile exec:java -Dexec.mainClass="com.battleship.GameTestProgram" -q
```

### Method 3: Compile and Run Directly
```bash
mvn compile
java -cp target/classes com.battleship.GameTestProgram
```

## Test Coverage

The test program runs **7 comprehensive test suites**:

### Test 1: Ship Placement
Tests the ship placement logic including:
- ✓ Creating and placing ships (horizontal/vertical)
- ✓ Invalid placement detection (overlapping)
- ✓ Adjacent ship detection (ships can't touch)
- ✓ Valid placement confirmation

**Example Output:**
```
✓ Carrier (size 5) placed horizontally at (0,0): true
✓ Battleship (size 4) placed vertically at (2,2): true
✓ Cruiser placement at occupied space: false (should be false)
✓ Cruiser placement adjacent to carrier: false (should be false)
```

### Test 2: Shooting Mechanics
Tests the shooting system including:
- ✓ Miss detection (empty cells)
- ✓ Hit detection (ship cells)
- ✓ Ship sinking (all cells hit)
- ✓ Duplicate shot prevention

**Example Output:**
```
✓ Shot at empty cell (0,0): MISS
✓ Shot at destroyer (3,3): HIT
✓ Shot at destroyer (4,3): SUNK
✓ Duplicate shot correctly prevented
```

### Test 3: Game Flow
Tests the overall game state management:
- ✓ Game creation in SETUP state
- ✓ Ready state requirements
- ✓ Game start conditions
- ✓ State transitions (SETUP → IN_PROGRESS)
- ✓ Current player tracking

**Example Output:**
```
✓ Game created with state: SETUP
✓ Starting game without ready players: false
✓ Starting game with ready players: true
✓ Current player: Alice
```

### Test 4: Random Placement
Tests the random ship placement algorithm:
- ✓ All 5 ships placed successfully
- ✓ Valid placement (no overlaps/adjacency)
- ✓ Ships positioned within bounds
- ✓ Displays all ship positions

**Example Output:**
```
Ship Positions:
  - CARRIER: (3,4) VERTICAL, Size: 5
  - BATTLESHIP: (8,5) VERTICAL, Size: 4
  - CRUISER: (1,5) VERTICAL, Size: 3
  - SUBMARINE: (0,2) HORIZONTAL, Size: 3
  - DESTROYER: (8,0) VERTICAL, Size: 2
```

### Test 5: Validation Logic
Tests input validation and error handling:
- ✓ Out of bounds coordinate detection
- ✓ Negative coordinate handling
- ✓ Ship placement boundary checks
- ✓ Duplicate ship type prevention

**Example Output:**
```
✓ Out of bounds shot prevented: Coordinates are out of bounds.
✓ Negative coordinate shot prevented: Coordinates are out of bounds.
✓ Ship placement out of bounds: false
✓ Duplicate ship type prevented
```

### Test 6: Game Service
Tests the service layer integration:
- ✓ Game creation via service
- ✓ Random ship placement through service
- ✓ Player ready state management
- ✓ Shot firing through service
- ✓ Turn management

**Example Output:**
```
✓ Game created with ID: 59a116e9-39db-489e-b816-5995dc6ed70f
✓ Ships randomly placed for both players
✓ Game started: IN_PROGRESS
✓ Shot fired at (5,5): MISS
✓ Turn switched to: Diana
```

### Test 7: Complete Game Simulation
Simulates an actual game with:
- ✓ Full game setup (both players)
- ✓ Turn-based gameplay
- ✓ Ship sinking notifications
- ✓ Statistics tracking
- ✓ Win condition checking

**Example Output:**
```
Turn 1: Player 1 shot at (0,0) - MISS
Turn 2: Player 2 shot at (0,1) - HIT
Turn 3: Player 1 shot at (0,2) - SUNK
  ★ DESTROYER sunk!
  Opponent ships remaining: 4

Game Statistics:
  Total turns: 20
  Player 1 - Shots: 10, Hits: 2, Accuracy: 20.0%
  Player 2 - Shots: 10, Hits: 3, Accuracy: 30.0%
```

## Success Criteria

All tests pass if you see:
```
=================================================
   ALL TESTS COMPLETED SUCCESSFULLY!
=================================================
```

## What Gets Tested

### Core Game Models
- **Ship** - Creation, placement, hit tracking, sinking
- **Cell** - State management, occupation, shooting
- **Shot** - Result tracking, timestamp, sunk ship reference
- **Player** - Statistics, ready state, win/loss detection
- **Board** - Grid management, validation, placement, shooting
- **Game** - State management, turn-based flow, win conditions

### Service Layer
- **GameService** - Game creation, ship placement, shot processing

### Validation Rules
- Boundary checking (0-9 for both x and y)
- Overlap detection
- Adjacent ship detection (including diagonals)
- Duplicate shot prevention
- Turn validation
- State transition rules

### Statistics Tracking
- Shots fired/hit/missed
- Accuracy calculation
- Ships remaining
- Turn counting
- Game duration

## Assertion-Based Testing

The program uses Java assertions to verify correctness:
```java
assert placed : "Carrier should be placed successfully";
assert shot.getResult() == Shot.ShotResult.MISS : "Shot should miss";
assert game.getState() == Game.GameState.IN_PROGRESS : "Game should be in progress";
```

To enable assertions when running manually:
```bash
java -ea -cp target/classes com.battleship.GameTestProgram
```

## Troubleshooting

### If tests fail:
1. Check that all model classes are compiled
2. Verify Spring Boot dependencies are available
3. Ensure Java 21 is being used
4. Check for compilation errors: `mvn clean compile`

### Common Issues:
- **"Game is not in progress"** - Players need to be set ready before firing shots
- **"Coordinates are out of bounds"** - Coordinates must be 0-9
- **"Cell already shot"** - Cannot shoot same cell twice
- **"Not your turn"** - Must wait for your turn

## Integration with Spring Boot

This test program can run:
- **Standalone** - As shown above
- **Within Spring context** - Can be adapted to use `@SpringBootTest`
- **As unit tests** - Logic can be extracted to JUnit tests

## Future Enhancements

Potential additions to the test program:
- Performance benchmarking
- Stress testing (many concurrent games)
- AI strategy testing
- Edge case coverage
- Visual board display
- Interactive mode
- Test result export (JSON/XML)

## Related Files

- `src/main/java/com/battleship/model/*.java` - Game models being tested
- `src/main/java/com/battleship/service/GameService.java` - Service being tested
- `IMPROVEMENTS.md` - Documentation of all game features
