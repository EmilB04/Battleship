import { useCallback, useEffect, useMemo, useState } from 'react';
import Board from './Board';
import Ships from './Ships';
import BattleStatus from './BattleStatus';
import BattleBoard from './BattleBoard';
import BattleMarkerLegend from './BattleMarkerLegend';
import { SHIP_TEMPLATES } from '../constants/gameConstants';
import { buildShipMap, getSunkShipIds } from '../utils/shipUtils';
import { getCellKey } from '../utils/cellUtils';
import { createMultiplayerRoomStream, fetchMultiplayerRoom, fireMultiplayerShot, leaveMultiplayerRoom, placeMultiplayerFleet, requestMultiplayerRematch } from '../utils/multiplayerApi';
import { clearMultiplayerSession, saveMultiplayerSession } from '../utils/multiplayerSession';

const FAST_POLL_INTERVAL_MS = 650;
const NORMAL_POLL_INTERVAL_MS = 1200;
const SLOW_POLL_INTERVAL_MS = 1800;

export default function MultiplayerGameScreen({ GoBack, session, username }) {
    const [room, setRoom] = useState(session?.room || null);
    const [setupShips, setSetupShips] = useState([]);
    const [selectedShip, setSelectedShip] = useState(null);
    const [orientation, setOrientation] = useState('horizontal');
    const [setupSubmitted, setSetupSubmitted] = useState(false);
    const [isPlacingFleet, setIsPlacingFleet] = useState(false);
    const [isFiring, setIsFiring] = useState(false);
    const [isRequestingRematch, setIsRequestingRematch] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [streamConnected, setStreamConnected] = useState(false);
    const [isWindowVisible, setIsWindowVisible] = useState(() => {
        return typeof document === 'undefined' ? true : !document.hidden;
    });

    const playerId = session?.playerId;
    const pin = session?.pin;

    const mySlot = useMemo(() => {
        if (!room || !playerId) {
            return null;
        }

        if (room.player1?.id === playerId) {
            return 'player1';
        }

        if (room.player2?.id === playerId) {
            return 'player2';
        }

        return null;
    }, [room, playerId]);

    const enemySlot = mySlot === 'player1' ? 'player2' : 'player1';
    const boardSize = room?.boardSize || 10;

    const myFleet = useMemo(() => {
        if (!room || !mySlot) {
            return [];
        }
        return room.fleets?.[mySlot] || [];
    }, [room, mySlot]);

    const enemyFleet = useMemo(() => {
        if (!room || !enemySlot) {
            return [];
        }
        return room.fleets?.[enemySlot] || [];
    }, [room, enemySlot]);

    const myShots = useMemo(() => {
        if (!room || !mySlot) {
            return [];
        }
        return room.shots?.[mySlot] || [];
    }, [room, mySlot]);

    const enemyShots = useMemo(() => {
        if (!room || !enemySlot) {
            return [];
        }
        return room.shots?.[enemySlot] || [];
    }, [room, enemySlot]);

    const myFleetMap = useMemo(() => buildShipMap(myFleet), [myFleet]);
    const enemyFleetMap = useMemo(() => buildShipMap(enemyFleet), [enemyFleet]);

    const myShotsSet = useMemo(() => new Set(myShots), [myShots]);
    const enemyShotsSet = useMemo(() => new Set(enemyShots), [enemyShots]);

    const myHits = useMemo(() => myShots.filter((key) => enemyFleetMap.has(key)), [myShots, enemyFleetMap]);
    const enemyHits = useMemo(() => enemyShots.filter((key) => myFleetMap.has(key)), [enemyShots, myFleetMap]);

    const myHitsSet = useMemo(() => new Set(myHits), [myHits]);
    const enemyHitsSet = useMemo(() => new Set(enemyHits), [enemyHits]);

    const mySunkShips = useMemo(() => getSunkShipIds(myFleet, enemyHitsSet), [myFleet, enemyHitsSet]);
    const enemySunkShips = useMemo(() => getSunkShipIds(enemyFleet, myHitsSet), [enemyFleet, myHitsSet]);

    const columnLabels = useMemo(
        () => Array.from({ length: boardSize }, (_, index) => String.fromCharCode(65 + index)),
        [boardSize]
    );
    const rowLabels = useMemo(() => Array.from({ length: boardSize }, (_, index) => index + 1), [boardSize]);

    const meDisplayName = mySlot === 'player1' ? room?.player1?.username : room?.player2?.username;
    const enemyDisplayName = mySlot === 'player1' ? room?.player2?.username : room?.player1?.username;

    const hasPlacedFleet = myFleet.length > 0;
    const enemyReady = Boolean(room?.player2?.id) && enemyFleet.length > 0;
    const bothPlayersJoined = Boolean(room?.player1?.id) && Boolean(room?.player2?.id);
    const matchStarted = room?.status === 'playing' || room?.status === 'finished';
    const isMyTurn = room?.turn === mySlot && room?.status === 'playing';

    const winner = useMemo(() => {
        if (!room?.winner || !mySlot) {
            return null;
        }
        return room.winner === mySlot ? 'player' : 'bot';
    }, [room, mySlot]);

    const myRematchReady = useMemo(() => {
        if (!room || !mySlot) {
            return false;
        }

        return mySlot === 'player1' ? Boolean(room.player1?.rematchReady) : Boolean(room.player2?.rematchReady);
    }, [room, mySlot]);

    const enemyRematchReady = useMemo(() => {
        if (!room || !enemySlot) {
            return false;
        }

        return enemySlot === 'player1' ? Boolean(room.player1?.rematchReady) : Boolean(room.player2?.rematchReady);
    }, [room, enemySlot]);

    const statusText = useMemo(() => {
        if (!room || !mySlot) {
            return 'Connecting to room...';
        }

        if (!bothPlayersJoined) {
            return `Share PIN ${room.pin} with a friend. Waiting for second player to join.`;
        }

        if (!hasPlacedFleet) {
            return 'Place all ships and press Start Game to lock in your fleet.';
        }

        if (!enemyReady) {
            return 'Fleet locked. Waiting for opponent to finish setup.';
        }

        if (room.status === 'playing') {
            return isMyTurn
                ? `Your turn. Fire at ${enemyDisplayName || 'opponent'}'s board.`
                : `Waiting for ${enemyDisplayName || 'opponent'} to fire.`;
        }

        if (room.status === 'finished') {
            if (room.victoryReason === 'forfeit') {
                return winner === 'player' ? 'Opponent left the room. You win by forfeit.' : 'You left the room. Defeat by forfeit.';
            }

            return winner === 'player' ? 'You sank all enemy ships. Victory.' : 'Your fleet was sunk. Defeat.';
        }

        return 'Preparing match...';
    }, [room, mySlot, bothPlayersJoined, hasPlacedFleet, enemyReady, isMyTurn, enemyDisplayName, winner]);

    const refreshRoom = useCallback(async () => {
        if (!pin || !playerId) {
            return;
        }

        try {
            const result = await fetchMultiplayerRoom({ pin, playerId });
            setRoom(result.room);
            saveMultiplayerSession({
                pin,
                playerId,
                username: username || meDisplayName || 'Player',
                status: result.room?.status || ''
            });
            setErrorText('');
        } catch (error) {
            setErrorText(String(error?.message || error));
        }
    }, [pin, playerId, username, meDisplayName]);

    useEffect(() => {
        refreshRoom();
    }, [refreshRoom]);

    useEffect(() => {
        if (!pin || !playerId) {
            return undefined;
        }

        const stream = createMultiplayerRoomStream({
            pin,
            playerId,
            onOpen: () => {
                setStreamConnected(true);
            },
            onRoom: (nextRoom) => {
                setRoom(nextRoom);
                setStreamConnected(true);
                setErrorText('');
            },
            onError: () => {
                setStreamConnected(false);
            }
        });

        return () => {
            stream.close();
            setStreamConnected(false);
        };
    }, [pin, playerId]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsWindowVisible(!document.hidden);
        };

        const handleWindowFocus = () => {
            refreshRoom();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleWindowFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, [refreshRoom]);

    const pollIntervalMs = useMemo(() => {
        if (!isWindowVisible) {
            return SLOW_POLL_INTERVAL_MS;
        }

        if (room?.status === 'playing' && isMyTurn) {
            return FAST_POLL_INTERVAL_MS;
        }

        return NORMAL_POLL_INTERVAL_MS;
    }, [isWindowVisible, room?.status, isMyTurn]);

    useEffect(() => {
        if (!pin || !playerId || streamConnected) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            refreshRoom();
        }, pollIntervalMs);

        return () => window.clearTimeout(timeoutId);
    }, [pin, playerId, refreshRoom, pollIntervalMs, room?.updatedAt, streamConnected]);

    const handleStartBattle = useCallback(async () => {
        if (setupShips.length !== SHIP_TEMPLATES.length || !pin || !playerId || isPlacingFleet) {
            return;
        }

        setIsPlacingFleet(true);
        setErrorText('');

        try {
            const result = await placeMultiplayerFleet({ pin, playerId, fleet: setupShips });
            setRoom(result.room);
            setSetupSubmitted(true);
        } catch (error) {
            setErrorText(String(error?.message || error));
        } finally {
            setIsPlacingFleet(false);
        }
    }, [setupShips, pin, playerId, isPlacingFleet]);

    const handleFire = useCallback(async (row, col) => {
        if (!isMyTurn || !pin || !playerId || isFiring || winner) {
            return;
        }

        const key = getCellKey(row, col);
        if (myShotsSet.has(key)) {
            return;
        }

        setIsFiring(true);
        setErrorText('');

        try {
            const result = await fireMultiplayerShot({ pin, playerId, row, col });
            setRoom(result.room);
        } catch (error) {
            setErrorText(String(error?.message || error));
        } finally {
            setIsFiring(false);
        }
    }, [isMyTurn, pin, playerId, isFiring, winner, myShotsSet]);

    const handleBackToMenu = useCallback(async () => {
        const isGameInProgress = room?.status === 'playing' && !winner;
        if (isGameInProgress) {
            const shouldLeave = window.confirm('A multiplayer game is currently in progress. Leave this room and return to main menu?');
            if (!shouldLeave) {
                return;
            }
        }

        if (pin && playerId) {
            try {
                await leaveMultiplayerRoom({ pin, playerId });
            } catch {
                // Best effort leave; user can still return to menu.
            }
        }

        clearMultiplayerSession();

        GoBack();
    }, [room, winner, pin, playerId, GoBack]);

    const handleRequestRematch = useCallback(async () => {
        if (!pin || !playerId || isRequestingRematch || !winner) {
            return;
        }

        setIsRequestingRematch(true);
        setErrorText('');

        try {
            const result = await requestMultiplayerRematch({ pin, playerId });
            setRoom(result.room);
            setSetupSubmitted(false);
            setSetupShips([]);
            setSelectedShip(null);
        } catch (error) {
            setErrorText(String(error?.message || error));
        } finally {
            setIsRequestingRematch(false);
        }
    }, [pin, playerId, isRequestingRematch, winner]);

    const rematchStatusText = useMemo(() => {
        if (!winner) {
            return '';
        }

        if (myRematchReady && enemyRematchReady) {
            return 'Both players accepted rematch. Resetting battle...';
        }

        if (myRematchReady) {
            return 'Rematch requested. Waiting for opponent to accept.';
        }

        if (enemyRematchReady) {
            return 'Opponent requested a rematch.';
        }

        return 'Want another round in the same room?';
    }, [winner, myRematchReady, enemyRematchReady]);

    const isMultiplayerInProgress = room?.status === 'playing' && !winner;
    const backButtonLabel = isMultiplayerInProgress ? 'Forfeit' : 'Back to Menu';
    const backButtonTitle = isMultiplayerInProgress ? 'Forfeit this multiplayer battle and return to the main menu' : 'Return to the main menu';

    return (
        <section className={`game-screen ${!matchStarted ? 'is-setup' : ''}`}>
            <button className="back-to-menu-button" onClick={handleBackToMenu} title={backButtonTitle}>
                <span className="back-arrow-icon" aria-hidden="true">←</span>
                <span>{backButtonLabel}</span>
            </button>

            <BattleStatus
                difficulty="pvp"
                statusText={`${statusText}${streamConnected ? '' : ' (Reconnecting...)'}`}
                turn={isMyTurn ? 'player' : 'bot'}
                winner={winner}
                headerTitle={(
                    <>
                        Multiplayer Room{' '}
                        <span className="multiplayer-room-pin-highlight">{room?.pin || '------'}</span>
                    </>
                )}
                subtitleText={`You: ${meDisplayName || username} | Opponent: ${enemyDisplayName || 'Waiting...'}`}
                turnLabel={isMyTurn ? 'You' : (enemyDisplayName || 'Opponent')}
                showTurn={room?.status === 'playing'}
            />

            {errorText && <p className="battle-status" role="status">Error: {errorText}</p>}

            {!hasPlacedFleet && (
                <div className="setup-stage">
                    <div className="setup-controls">
                        <div className="setup-header">
                            <h2>Place Your Ships</h2>
                            <p>Room PIN: <strong>{room?.pin || pin}</strong>. Place ships and lock in your fleet.</p>
                        </div>
                        <Ships
                            selectedShip={selectedShip}
                            setSelectedShip={setSelectedShip}
                            orientation={orientation}
                            setOrientation={setOrientation}
                            placedShips={setupShips}
                        />
                    </div>
                    <div className="setup-board-stage">
                        <Board
                            boardSize={boardSize}
                            selectedShip={selectedShip}
                            setSelectedShip={setSelectedShip}
                            orientation={orientation}
                            setOrientation={setOrientation}
                            placedShips={setupShips}
                            setPlacedShips={setSetupShips}
                            onFinishSetup={handleStartBattle}
                        />
                    </div>
                </div>
            )}

            {hasPlacedFleet && !matchStarted && (
                <div className="setup-stage">
                    <p className="battle-status">
                        {setupSubmitted ? 'Fleet locked in.' : 'Fleet ready.'} Waiting for both players to finish setup.
                    </p>
                    <p className="battle-subtitle">Room PIN: <strong>{room?.pin || pin}</strong></p>
                </div>
            )}

            {matchStarted && (
                <>
                    <div className={`battle-boards ${winner ? 'has-summary' : 'is-compact'}`}>
                        <BattleBoard
                            boardType="player"
                            columnLabels={columnLabels}
                            rowLabels={rowLabels}
                            shotSet={enemyShotsSet}
                            hitSet={enemyHitsSet}
                            shipMap={myFleetMap}
                            sunkShips={mySunkShips}
                            turn={isMyTurn ? 'player' : 'bot'}
                            winner={winner}
                            onShoot={handleFire}
                            getCellKey={getCellKey}
                        />

                        <BattleBoard
                            boardType="enemy"
                            columnLabels={columnLabels}
                            rowLabels={rowLabels}
                            shotSet={myShotsSet}
                            hitSet={myHitsSet}
                            shipMap={enemyFleetMap}
                            sunkShips={enemySunkShips}
                            turn={isMyTurn ? 'player' : 'bot'}
                            winner={winner}
                            onShoot={handleFire}
                            getCellKey={getCellKey}
                        />
                    </div>

                    {!winner && (
                        <div className="battle-marker-legend-row">
                            <BattleMarkerLegend />
                        </div>
                    )}

                    {winner && (
                        <div className="battle-marker-legend-row">
                            <button
                                className="battle-new-button"
                                onClick={handleRequestRematch}
                                disabled={isRequestingRematch || myRematchReady}
                            >
                                {myRematchReady ? 'Rematch Requested' : (isRequestingRematch ? 'Requesting...' : 'Request Rematch')}
                            </button>
                            <p className="battle-subtitle">{rematchStatusText}</p>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
