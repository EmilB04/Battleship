import { useCallback, useEffect, useMemo, useState } from 'react';
import Board from './Board';
import Ships from './Ships';
import BattleStatus from './BattleStatus';
import BattleBoard from './BattleBoard';
import BattleActions from './BattleActions';
import '../styles/components/gameScreenStyle.css';

const LEADERBOARD_STORAGE_KEY = 'battleshipLeaderboard';
const MAX_LEADERBOARD_ENTRIES = 15;
const SHIP_TEMPLATES = [
    { id: 1, name: 'Carrier', label: 'CA', length: 5, color: 'var(--carrier)' },
    { id: 2, name: 'Battleship', label: 'BS', length: 4, color: 'var(--battleship)' },
    { id: 3, name: 'Cruiser', label: 'CR', length: 3, color: 'var(--cruiser)' },
    { id: 4, name: 'Submarine', label: 'SM', length: 3, color: 'var(--submarine)' },
    { id: 5, name: 'Destroyer', label: 'DE', length: 2, color: 'var(--destroyer)' }
];


const getCellKey = (row, col) => `${row}-${col}`;

const parseCellKey = (cellKey) => {
    const [row, col] = cellKey.split('-').map(Number);
    return { row, col };
};

const getShipCells = (ship) => {
    const cells = [];
    for (let i = 0; i < ship.length; i++) {
        if (ship.orientation === 'horizontal') {
            cells.push({ row: ship.row, col: ship.col + i });
        } else {
            cells.push({ row: ship.row + i, col: ship.col });
        }
    }
    return cells;
};

const buildShipMap = (ships) => {
    const shipMap = new Map();
    ships.forEach((ship) => {
        getShipCells(ship).forEach((cell) => {
            shipMap.set(getCellKey(cell.row, cell.col), ship.id);
        });
    });
    return shipMap;
};

const getSunkShipIds = (ships, hitsSet) => {
    return new Set(
        ships
            .filter((ship) =>
                getShipCells(ship).every((cell) => hitsSet.has(getCellKey(cell.row, cell.col)))
            )
            .map((ship) => ship.id)
    );
};

export default function GameScreen({ GoBack, persistLeaderboard, username }) {
    const [boardSize, setBoardSize] = useState(() => parseInt(localStorage.getItem('gridSize') || '10', 10));
    const BOARD_SIZE = boardSize;
    const [setup, setSetup] = useState(true);
    const [selectedShip, setSelectedShip] = useState(null);
    const [orientation, setOrientation] = useState('horizontal');
    const [placedShips, setPlacedShips] = useState([]);
    const [botShips, setBotShips] = useState([]);
    const [playerShots, setPlayerShots] = useState([]);
    const [botShots, setBotShots] = useState([]);
    const [playerHits, setPlayerHits] = useState([]);
    const [botHits, setBotHits] = useState([]);
    const [turn, setTurn] = useState('player');
    const [winner, setWinner] = useState(null);
    const [statusText, setStatusText] = useState('Place all ships to begin.');
    const [aiTargetQueue, setAiTargetQueue] = useState([]);

    // Listen for grid size changes
    useEffect(() => {
        const handleGridSizeChange = () => {
            const newSize = parseInt(localStorage.getItem('gridSize') || '10', 10);
            setBoardSize(newSize);
            // Reset game when grid size changes
            if (!setup) {
                setSetup(true);
                setStatusText('Place all ships to begin.');
            }
        };

        window.addEventListener('gridSizeChanged', handleGridSizeChange);
        return () => window.removeEventListener('gridSizeChanged', handleGridSizeChange);
    }, [setup]);

    // Helper functions that depend on BOARD_SIZE
    const isPlacementValid = useCallback((ships, candidateShip) => {
        for (const cell of getShipCells(candidateShip)) {
            if (cell.row < 0 || cell.row >= BOARD_SIZE || cell.col < 0 || cell.col >= BOARD_SIZE) {
                return false;
            }

            const overlaps = ships.some((ship) =>
                getShipCells(ship).some(
                    (shipCell) => shipCell.row === cell.row && shipCell.col === cell.col
                )
            );

            if (overlaps) {
                return false;
            }
        }

        return true;
    }, [BOARD_SIZE]);

    const generateBotFleet = useCallback(() => {
        let attempts = 0;
        const MAX_ATTEMPTS = 5;

        while (attempts < MAX_ATTEMPTS) {
            attempts += 1;
            const botShips = [];
            let allShipsPlaced = true;

            for (const shipTemplate of SHIP_TEMPLATES) {
                let placed = false;
                let shipAttempts = 0;

                while (!placed && shipAttempts < 300) {
                    shipAttempts += 1;
                    const orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';
                    const row = Math.floor(Math.random() * BOARD_SIZE);
                    const col = Math.floor(Math.random() * BOARD_SIZE);
                    const candidate = { ...shipTemplate, row, col, orientation };

                    if (isPlacementValid(botShips, candidate)) {
                        botShips.push(candidate);
                        placed = true;
                    }
                }

                if (!placed) {
                    allShipsPlaced = false;
                    break;
                }
            }

            if (allShipsPlaced) {
                return botShips;
            }
        }

        // Fallback - should rarely happen
        return [];
    }, [BOARD_SIZE, isPlacementValid]);

    const getNeighborKeys = useCallback((cellKey) => {
        const { row, col } = parseCellKey(cellKey);
        const directions = [
            [row - 1, col],
            [row + 1, col],
            [row, col - 1],
            [row, col + 1]
        ];

        return directions
            .filter(([r, c]) => r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE)
            .map(([r, c]) => getCellKey(r, c));
    }, [BOARD_SIZE]);

    const pickRandomCell = useCallback((cells) => {
        if (!cells.length) {
            return null;
        }
        const idx = Math.floor(Math.random() * cells.length);
        return cells[idx];
    }, []);

    const getUnshotCells = useCallback((shotsSet) => {
        const cells = [];
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const key = getCellKey(row, col);
                if (!shotsSet.has(key)) {
                    cells.push(key);
                }
            }
        }
        return cells;
    }, [BOARD_SIZE]);

    const pickEasyShot = useCallback((shotsSet) => pickRandomCell(getUnshotCells(shotsSet)), [pickRandomCell, getUnshotCells]);

    const pickMediumShot = useCallback((shotsSet, targetQueue) => {
        const queueCandidate = targetQueue.find((cellKey) => !shotsSet.has(cellKey));
        if (queueCandidate) {
            return queueCandidate;
        }

        const checkerboard = getUnshotCells(shotsSet).filter((cellKey) => {
            const { row, col } = parseCellKey(cellKey);
            return (row + col) % 2 === 0;
        });

        return pickRandomCell(checkerboard.length ? checkerboard : getUnshotCells(shotsSet));
    }, [getUnshotCells, pickRandomCell]);

    const pickHardShot = useCallback((shotsSet, hitsSet, ships, shipMap) => {
        const missesSet = new Set([...shotsSet].filter((cellKey) => !hitsSet.has(cellKey)));
        const sunkIds = getSunkShipIds(ships, hitsSet);
        const remainingLengths = ships
            .filter((ship) => !sunkIds.has(ship.id))
            .map((ship) => ship.length);

        const unresolvedHits = [...hitsSet].filter((cellKey) => {
            const shipId = shipMap.get(cellKey);
            return shipId && !sunkIds.has(shipId);
        });

        const score = new Map();

        const addPlacementScore = (cells) => {
            cells.forEach((cellKey) => {
                if (!shotsSet.has(cellKey)) {
                    score.set(cellKey, (score.get(cellKey) || 0) + 1);
                }
            });
        };

        remainingLengths.forEach((length) => {
            for (let row = 0; row < BOARD_SIZE; row++) {
                for (let col = 0; col < BOARD_SIZE; col++) {
                    const horizontal = [];
                    for (let i = 0; i < length; i++) {
                        horizontal.push(getCellKey(row, col + i));
                    }

                    const vertical = [];
                    for (let i = 0; i < length; i++) {
                        vertical.push(getCellKey(row + i, col));
                    }

                    [horizontal, vertical].forEach((placement) => {
                        const inBounds = placement.every((cellKey) => {
                            const { row: r, col: c } = parseCellKey(cellKey);
                            return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
                        });

                        if (!inBounds) {
                            return;
                        }

                        const conflictsMiss = placement.some((cellKey) => missesSet.has(cellKey));
                        if (conflictsMiss) {
                            return;
                        }

                        const missesKnownHits = unresolvedHits.length > 0
                            && !placement.some((cellKey) => unresolvedHits.includes(cellKey));
                        if (missesKnownHits) {
                            return;
                        }

                        addPlacementScore(placement);
                    });
                }
            }
        });

        let bestCell = null;
        let bestScore = -1;
        score.forEach((cellScore, cellKey) => {
            if (cellScore > bestScore) {
                bestScore = cellScore;
                bestCell = cellKey;
            }
        });

        if (bestCell) {
            return bestCell;
        }

        return pickMediumShot(shotsSet, []);
    }, [BOARD_SIZE, pickMediumShot]);

    const difficulty = useMemo(() => localStorage.getItem('difficulty') || 'medium', []);
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



    const resetBattleState = () => {
        setPlayerShots([]);
        setBotShots([]);
        setPlayerHits([]);
        setBotHits([]);
        setAiTargetQueue([]);
        setTurn('player');
        setWinner(null);
    };

    const saveMatchResult = useCallback((result, shotsCount, hitsCount) => {
        const accuracy = shotsCount ? Math.round((hitsCount / shotsCount) * 100) : 0;
        const speedBonus = Math.max(0, 120 - shotsCount * 2);
        const baseScore = result === 'player' ? 1000 : 250;
        const score = baseScore + accuracy * 4 + speedBonus;

        const newEntry = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: new Date().toISOString(),
            username,
            result,
            difficulty,
            gridSize: BOARD_SIZE,
            score,
            playerShots: shotsCount,
            accuracy
        };

        try {
            const stored = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
            const currentLeaderboard = stored ? JSON.parse(stored) : [];
            const nextEntries = [newEntry, ...currentLeaderboard]
                .sort((a, b) => b.score - a.score || Date.parse(b.timestamp) - Date.parse(a.timestamp))
                .slice(0, MAX_LEADERBOARD_ENTRIES);

            persistLeaderboard(nextEntries);
        } catch {
            // If localStorage read fails, just persist the new entry
            persistLeaderboard([newEntry]);
        }
    }, [difficulty, username, BOARD_SIZE, persistLeaderboard]);

    const handleStartBattle = () => {
        setBotShips(generateBotFleet());
        resetBattleState();
        setSetup(false);
        setStatusText(`Battle started against ${difficulty.toUpperCase()} AI. Your move.`);
    };

    const runBotTurn = useCallback(() => {
        if (winner || setup || turn !== 'bot') {
            return;
        }

        let botShotKey;
        if (difficulty === 'easy') {
            botShotKey = pickEasyShot(botShotsSet);
        } else if (difficulty === 'medium') {
            botShotKey = pickMediumShot(botShotsSet, aiTargetQueue);
        } else {
            botShotKey = pickHardShot(botShotsSet, botHitsSet, placedShips, playerShipMap);
        }

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

        setAiTargetQueue((prevQueue) => {
            const filteredQueue = prevQueue.filter((cellKey) => cellKey !== botShotKey && !botShotsSet.has(cellKey));
            if (!isHit) {
                return filteredQueue;
            }

            const additions = getNeighborKeys(botShotKey).filter(
                (cellKey) => !botShotsSet.has(cellKey) && cellKey !== botShotKey
            );

            const deduped = [...new Set([...filteredQueue, ...additions])];

            const nextHitsSet = new Set(nextBotHits);
            const nextSunkIds = getSunkShipIds(placedShips, nextHitsSet);
            if (shipId && nextSunkIds.has(shipId)) {
                return [];
            }

            return deduped;
        });

        const playerDefeated = placedShips.every((ship) =>
            getShipCells(ship).every((cell) =>
                new Set(nextBotHits).has(getCellKey(cell.row, cell.col))
            )
        );

        if (playerDefeated) {
            setWinner('bot');
            setStatusText('The AI sank your fleet.');
            saveMatchResult('bot', playerShots.length, playerHits.length);
            return;
        }

        setTurn('player');
        setStatusText(isHit ? 'AI scored a hit. Your turn.' : 'AI missed. Your turn.');
    }, [
        winner,
        setup,
        turn,
        difficulty,
        botShotsSet,
        aiTargetQueue,
        botHitsSet,
        placedShips,
        playerShipMap,
        botShots,
        botHits,
        playerShots.length,
        playerHits.length,
        saveMatchResult,
        getNeighborKeys,
        pickEasyShot,
        pickMediumShot,
        pickHardShot
    ]);

    const handlePlayerShot = (row, col) => {
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
        const botDefeated = botShips.every((ship) =>
            getShipCells(ship).every((cell) => nextHitsSet.has(getCellKey(cell.row, cell.col)))
        );

        if (botDefeated) {
            setWinner('player');
            setStatusText('You sank all enemy ships. Victory.');
            saveMatchResult('player', nextPlayerShots.length, nextPlayerHits.length);
            return;
        }

        setTurn('bot');
        setStatusText(isHit ? 'Direct hit. AI is thinking...' : 'Miss. AI is thinking...');
    };

    useEffect(() => {
        if (turn !== 'bot' || winner || setup) {
            return;
        }

        const timer = window.setTimeout(() => {
            runBotTurn();
        }, 600);

        return () => window.clearTimeout(timer);
    }, [turn, winner, setup, runBotTurn]);

    const handleNewBattle = () => {
        setSetup(true);
        setSelectedShip(null);
        setOrientation('horizontal');
        setPlacedShips([]);
        setBotShips([]);
        resetBattleState();
        setStatusText('Place all ships to begin.');
    };
    
    return (
        <section className="game-screen">
            <button style={{position: "absolute", top: "10px", left: "10px"}} onClick={GoBack}>← Back to Menu</button>
            {setup ? 
                <>
                    <h2>Place Your Ships</h2>
                    <p>Drag ships to the board or click to place. Double-click or right-click placed ships to remove them.</p>
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
                : 
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

                    <BattleActions onNewBattle={handleNewBattle} />
                </>
            }
        </section>
    );
}