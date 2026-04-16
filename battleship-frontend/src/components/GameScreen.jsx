import { useCallback, useEffect, useMemo, useState } from 'react';
import Board from './Board';
import Ships from './Ships';
import BattleStatus from './BattleStatus';
import BattleBoard from './BattleBoard';
import BattleActions from './BattleActions';
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
export default function GameScreen({ GoBack, persistLeaderboard, username }) {
    // Game state
    const [boardSize, setBoardSize] = useState(() => parseInt(localStorage.getItem(GRID_SIZE_STORAGE_KEY) || '10', 10));
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

    // Listen for grid size changes
    useEffect(() => {
        const handleGridSizeChange = () => {
            const newSize = parseInt(localStorage.getItem(GRID_SIZE_STORAGE_KEY) || '10', 10);
            setBoardSize(newSize);
            if (!setup) {
                setSetup(true);
                setStatusText('Place all ships to begin.');
            }
        };

        window.addEventListener('gridSizeChanged', handleGridSizeChange);
        return () => window.removeEventListener('gridSizeChanged', handleGridSizeChange);
    }, [setup]);

    // Memoized values
    const difficulty = useMemo(() => localStorage.getItem(DIFFICULTY_STORAGE_KEY) || 'medium', []);
    
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

    return (
        <section className="game-screen">
            <button className="back-to-menu-button" onClick={GoBack} title="Return to the main menu">
                <span className="back-arrow-icon" aria-hidden="true">←</span>
                <span>Back to Menu</span>
            </button>

            {setup && (
                <>
                    <h2>Place Your Ships</h2>
                    <p>Drag ships to the board or click to place. Right-click placed ships to remove them.</p>
                    <Ships
                        selectedShip={selectedShip}
                        setSelectedShip={setSelectedShip}
                        orientation={orientation}
                        setOrientation={setOrientation}
                        placedShips={placedShips}
                    />
                    <Board
                        boardSize={BOARD_SIZE}
                        selectedShip={selectedShip}
                        setSelectedShip={setSelectedShip}
                        orientation={orientation}
                        placedShips={placedShips}
                        setPlacedShips={setPlacedShips}
                        onFinishSetup={handleStartBattle}
                    />
                </>
            )}

            {!setup && (
                <>
                    <BattleStatus
                        difficulty={difficulty}
                        statusText={statusText}
                        turn={turn}
                        winner={winner}
                    />

                    <div className="battle-boards">
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

                    {winner && <BattleActions onNewBattle={handleNewBattle} />}
                </>
            )}
        </section>
    );
}
