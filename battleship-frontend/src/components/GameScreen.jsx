import { useCallback, useEffect, useMemo, useState } from 'react';
import Board from './Board';
import Ships from './Ships';
import BattleStatus from './BattleStatus';
import BattleBoard from './BattleBoard';
import BattleActions from './BattleActions';
import PlayerSummary from './PlayerSummary';
import BattleMarkerLegend from './BattleMarkerLegend';
import MultiplayerGameScreen from './MultiplayerGameScreen';
import '../styles/components/gameScreenStyle.css';

// Constants
import { SHIP_TEMPLATES, BOT_TURN_DELAY, DIFFICULTY_STORAGE_KEY, GRID_SIZE_STORAGE_KEY } from '../constants/gameConstants';

// Utilities
import { getCellKey, getNeighboringCells } from '../utils/cellUtils';
import { buildShipMap, getSunkShipIds } from '../utils/shipUtils';
import { generateBotFleet, createLeaderboardEntry, checkPlayerVictory, checkBotVictory } from '../utils/gameLogic';
import { getAIShot } from '../utils/aiStrategies';

/**
 * GameScreen Component
 * Main game interface for Battleship game
 * Manages game state, player input, and AI opponent
 */
export default function GameScreen({ GoBack, persistLeaderboard, username, gameMode = 'singleplayer', multiplayerSession = null }) {
    if (gameMode === 'multiplayer') {
        return <MultiplayerGameScreen GoBack={GoBack} session={multiplayerSession} username={username} />;
    }

    return <SingleplayerGameScreen GoBack={GoBack} persistLeaderboard={persistLeaderboard} username={username} />;
}

function SingleplayerGameScreen({ GoBack, persistLeaderboard, username }) {
    // Game state
    const [boardSize, setBoardSize] = useState(() => parseInt(localStorage.getItem(GRID_SIZE_STORAGE_KEY) || '10', 10));
    const [difficulty, setDifficulty] = useState(() => localStorage.getItem(DIFFICULTY_STORAGE_KEY) || 'medium');
    const BOARD_SIZE = boardSize;
    
    const [setup, setSetup] = useState(true);
    const [selectedShip, setSelectedShip] = useState(null);
    const [orientation, setOrientation] = useState('horizontal');
    
    // Fleet state
    const [placedShips, setPlacedShips] = useState([]);
    const [botShips, setBotShips] = useState([]);
    
    // Shot tracking
    const [playerShots, setPlayerShots] = useState([]);
    const [botShots, setBotShots] = useState([]);
    const [playerHits, setPlayerHits] = useState([]);
    const [botHits, setBotHits] = useState([]);
    
    // Game status
    const [turn, setTurn] = useState('player');
    const [winner, setWinner] = useState(null);
    const [statusText, setStatusText] = useState('Place all ships to begin.');
    const [aiTargetQueue, setAiTargetQueue] = useState([]);

    // Persist setup preferences
    useEffect(() => {
        localStorage.setItem(GRID_SIZE_STORAGE_KEY, String(boardSize));
    }, [boardSize]);

    useEffect(() => {
        localStorage.setItem(DIFFICULTY_STORAGE_KEY, difficulty);
    }, [difficulty]);
    
    const playerShotsSet = useMemo(() => new Set(playerShots), [playerShots]);
    const botShotsSet = useMemo(() => new Set(botShots), [botShots]);
    const playerHitsSet = useMemo(() => new Set(playerHits), [playerHits]);
    const botHitsSet = useMemo(() => new Set(botHits), [botHits]);

    const playerShipMap = useMemo(() => buildShipMap(placedShips), [placedShips]);
    const botShipMap = useMemo(() => buildShipMap(botShips), [botShips]);

    const playerSunkShips = useMemo(
        () => getSunkShipIds(placedShips, botHitsSet),
        [placedShips, botHitsSet]
    );
    const botSunkShips = useMemo(
        () => getSunkShipIds(botShips, playerHitsSet),
        [botShips, playerHitsSet]
    );

    const columnLabels = useMemo(
        () => Array.from({ length: BOARD_SIZE }, (_, i) => String.fromCharCode(65 + i)),
        [BOARD_SIZE]
    );
    const rowLabels = useMemo(() => Array.from({ length: BOARD_SIZE }, (_, i) => i + 1), [BOARD_SIZE]);

    const playerSummary = useMemo(() => {
        if (!winner) {
            return null;
        }

        const shots = playerShots.length;
        const hits = playerHits.length;
        const accuracy = shots > 0 ? Math.round((hits / shots) * 100) : 0;

        return {
            shots,
            hits,
            misses: Math.max(0, shots - hits),
            accuracy,
            shipsSunk: botSunkShips.size,
            winnerLabel: winner === 'player' ? 'You' : 'AI Bot'
        };
    }, [winner, playerShots.length, playerHits.length, botSunkShips.size]);

    // Helper: Reset battle state
    const resetBattleState = useCallback(() => {
        setPlayerShots([]);
        setBotShots([]);
        setPlayerHits([]);
        setBotHits([]);
        setAiTargetQueue([]);
        setTurn('player');
        setWinner(null);
    }, []);

    // Event handler: Start battle
    const handleStartBattle = useCallback(() => {
        const newBotFleet = generateBotFleet(SHIP_TEMPLATES, BOARD_SIZE);
        setBotShips(newBotFleet);
        resetBattleState();
        setSetup(false);
        setStatusText(`Battle started against ${difficulty.toUpperCase()} AI. Your move.`);
    }, [BOARD_SIZE, difficulty, resetBattleState]);

    // Event handler: Player shot
    const handlePlayerShot = useCallback((row, col) => {
        if (setup || winner || turn !== 'player') {
            return;
        }

        const shotKey = getCellKey(row, col);
        if (playerShotsSet.has(shotKey)) {
            return;
        }

        const isHit = botShipMap.has(shotKey);
        const nextPlayerShots = [...playerShots, shotKey];
        const nextPlayerHits = isHit ? [...playerHits, shotKey] : playerHits;

        setPlayerShots(nextPlayerShots);
        if (isHit) {
            setPlayerHits(nextPlayerHits);
        }

        const nextHitsSet = new Set(nextPlayerHits);
        const playerWins = checkPlayerVictory(botShips, nextHitsSet);

        if (playerWins) {
            setWinner('player');
            const entry = createLeaderboardEntry(
                username,
                'player',
                difficulty,
                BOARD_SIZE,
                nextPlayerShots.length,
                nextPlayerHits.length
            );
            persistLeaderboard(entry);
            return;
        }

        setTurn('bot');
    }, [setup, winner, turn, playerShotsSet, botShipMap, playerShots, playerHits, botShips, username, difficulty, BOARD_SIZE, persistLeaderboard]);

    // Event handler: Bot turn
    const runBotTurn = useCallback(() => {
        if (winner || setup || turn !== 'bot') {
            return;
        }

        // Get AI shot based on difficulty
        const botShotKey = getAIShot(
            difficulty,
            botShotsSet,
            botHitsSet,
            aiTargetQueue,
            placedShips,
            playerShipMap,
            BOARD_SIZE
        );

        if (!botShotKey) {
            return;
        }

        const shipId = playerShipMap.get(botShotKey);
        const isHit = Boolean(shipId);
        const nextBotShots = [...botShots, botShotKey];
        const nextBotHits = isHit ? [...botHits, botShotKey] : botHits;

        setBotShots(nextBotShots);
        if (isHit) {
            setBotHits(nextBotHits);
        }

        // Update AI target queue
        setAiTargetQueue((prevQueue) => {
            const filteredQueue = prevQueue.filter((cellKey) => cellKey !== botShotKey && !botShotsSet.has(cellKey));
            if (!isHit) {
                return filteredQueue;
            }

            const neighbors = getNeighboringCells(botShotKey, BOARD_SIZE).filter(
                (cellKey) => !botShotsSet.has(cellKey) && cellKey !== botShotKey
            );

            const deduped = [...new Set([...filteredQueue, ...neighbors])];

            // Check if ship is sunk
            const nextHitsSet = new Set(nextBotHits);
            const nextSunkIds = getSunkShipIds(placedShips, nextHitsSet);
            if (shipId && nextSunkIds.has(shipId)) {
                return [];
            }

            return deduped;
        });

        // Check if player is defeated
        const playerDefeated = checkBotVictory(placedShips, new Set(nextBotHits));

        if (playerDefeated) {
            setWinner('bot');
            const entry = createLeaderboardEntry(
                username,
                'bot',
                difficulty,
                BOARD_SIZE,
                playerShots.length,
                playerHits.length
            );
            persistLeaderboard(entry);
            return;
        }

        setTurn('player');
    }, [
        winner,
        setup,
        turn,
        difficulty,
        botShotsSet,
        botHitsSet,
        aiTargetQueue,
        placedShips,
        playerShipMap,
        BOARD_SIZE,
        botShots,
        botHits,
        playerShots.length,
        playerHits.length,
        username,
        persistLeaderboard
    ]);

    // Bot turn delay
    useEffect(() => {
        if (turn !== 'bot' || winner || setup) {
            return;
        }

        const timer = window.setTimeout(() => {
            runBotTurn();
        }, BOT_TURN_DELAY);

        return () => window.clearTimeout(timer);
    }, [turn, winner, setup, runBotTurn]);

    // Event handler: New battle
    const handleNewBattle = useCallback(() => {
        setSetup(true);
        setSelectedShip(null);
        setOrientation('horizontal');
        setPlacedShips([]);
        setBotShips([]);
        resetBattleState();
        setStatusText('Place all ships to begin.');
    }, [resetBattleState]);

    const handleBackToMenu = useCallback(() => {
        const isGameInProgress = !setup && !winner;
        if (!isGameInProgress) {
            GoBack();
            return;
        }

        const shouldLeave = window.confirm('A game is currently in progress. Leave this battle and return to the main menu?');
        if (shouldLeave) {
            GoBack();
        }
    }, [setup, winner, GoBack]);

    const handleBoardSizeChange = useCallback((event) => {
        const nextSize = parseInt(event.target.value, 10);
        if (Number.isNaN(nextSize) || nextSize === boardSize) {
            return;
        }

        setBoardSize(nextSize);
        setPlacedShips([]);
        setSelectedShip(null);
        setStatusText('Place all ships to begin.');
    }, [boardSize]);

    const handleDifficultyChange = useCallback((event) => {
        setDifficulty(event.target.value);
    }, []);

    return (
        <section className={`game-screen ${setup ? 'is-setup' : ''}`}>
            <button className="back-to-menu-button" onClick={handleBackToMenu} title="Return to the main menu">
                <span className="back-arrow-icon" aria-hidden="true">←</span>
                <span>Back to Menu</span>
            </button>

            {setup && (
                <div className="setup-stage">
                    <div className="setup-controls">
                        <div className="setup-header">
                            <h2>Place Your Ships</h2>
                            <p>Drag ships to the board or click to place. Right-click placed ships to remove them.</p>
                        </div>
                        <div className="setup-options" aria-label="Game setup options">
                            <div className="setup-option">
                                <label htmlFor="setup-grid-size">Grid Size</label>
                                <select
                                    id="setup-grid-size"
                                    value={String(boardSize)}
                                    onChange={handleBoardSizeChange}
                                >
                                    <option value="8">8x8</option>
                                    <option value="10">10x10 (Standard)</option>
                                    <option value="12">12x12</option>
                                </select>
                            </div>
                            <div className="setup-option">
                                <label htmlFor="setup-difficulty">AI Difficulty</label>
                                <select
                                    id="setup-difficulty"
                                    value={difficulty}
                                    onChange={handleDifficultyChange}
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                    <option value="extreme">Extreme</option>
                                </select>
                            </div>
                        </div>
                        <Ships
                            selectedShip={selectedShip}
                            setSelectedShip={setSelectedShip}
                            orientation={orientation}
                            setOrientation={setOrientation}
                            placedShips={placedShips}
                        />
                    </div>
                    <div className="setup-board-stage">
                        <Board
                            boardSize={BOARD_SIZE}
                            selectedShip={selectedShip}
                            setSelectedShip={setSelectedShip}
                            orientation={orientation}
                            setOrientation={setOrientation}
                            placedShips={placedShips}
                            setPlacedShips={setPlacedShips}
                            onFinishSetup={handleStartBattle}
                        />
                    </div>
                </div>
            )}

            {!setup && (
                <>
                    <BattleStatus
                        difficulty={difficulty}
                        statusText={statusText}
                        turn={turn}
                        winner={winner}
                    />

                    <div className={`battle-boards ${winner ? 'has-summary' : 'is-compact'}`}>
                        <BattleBoard
                            boardType="player"
                            columnLabels={columnLabels}
                            rowLabels={rowLabels}
                            shotSet={botShotsSet}
                            hitSet={botHitsSet}
                            shipMap={playerShipMap}
                            sunkShips={playerSunkShips}
                            turn={turn}
                            winner={winner}
                            onShoot={handlePlayerShot}
                            getCellKey={getCellKey}
                        />

                        {winner && (
                            <div className="battle-middle-column">
                                <PlayerSummary summary={playerSummary} />
                            </div>
                        )}

                        <BattleBoard
                            boardType="enemy"
                            columnLabels={columnLabels}
                            rowLabels={rowLabels}
                            shotSet={playerShotsSet}
                            hitSet={playerHitsSet}
                            shipMap={botShipMap}
                            sunkShips={botSunkShips}
                            turn={turn}
                            winner={winner}
                            onShoot={handlePlayerShot}
                            getCellKey={getCellKey}
                        />
                    </div>

                    {!winner && (
                        <div className="battle-marker-legend-row">
                            <BattleMarkerLegend />
                        </div>
                    )}

                    {winner && <BattleActions onNewBattle={handleNewBattle} onQuit={GoBack} />}
                </>
            )}
        </section>
    );
}
