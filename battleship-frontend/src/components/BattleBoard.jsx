import { useEffect, useMemo, useRef, useState } from 'react';
import { SHIP_TEMPLATES } from '../constants/gameConstants';

const SUNK_EFFECT_MS = 700;

const playSunkExplosionSound = () => {
    if (typeof window === 'undefined' || localStorage.getItem('soundEnabled') === 'false') {
        return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
        return;
    }

    try {
        const audioCtx = new AudioContextClass();
        const now = audioCtx.currentTime;

        const bodyGain = audioCtx.createGain();
        bodyGain.gain.setValueAtTime(0.0001, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
        bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
        bodyGain.connect(audioCtx.destination);

        const bodyOsc = audioCtx.createOscillator();
        bodyOsc.type = 'triangle';
        bodyOsc.frequency.setValueAtTime(210, now);
        bodyOsc.frequency.exponentialRampToValueAtTime(52, now + 0.42);
        bodyOsc.connect(bodyGain);
        bodyOsc.start(now);
        bodyOsc.stop(now + 0.44);

        const noiseBuffer = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 0.28), audioCtx.sampleRate);
        const channelData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < channelData.length; i++) {
            channelData[i] = (Math.random() * 2 - 1) * (1 - i / channelData.length);
        }

        const noiseSource = audioCtx.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(1900, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(450, now + 0.22);

        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.0001, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);

        noiseSource.start(now);
        noiseSource.stop(now + 0.3);

        window.setTimeout(() => {
            audioCtx.close().catch(() => {});
        }, 650);
    } catch {
        // Ignore audio failures so gameplay is never blocked.
    }
};

export default function BattleBoard({
    boardType,
    columnLabels,
    rowLabels,
    shotSet,
    hitSet,
    shipMap,
    sunkShips,
    turn,
    winner,
    onShoot,
    getCellKey
}) {
    const [explodingCells, setExplodingCells] = useState(() => new Set());
    const previousSunkShipsRef = useRef(new Set());
    const hasTrackedSunkShipsRef = useRef(false);
    const isEnemyBoard = boardType === 'enemy';
    const isActiveBoard = isEnemyBoard ? turn === 'player' : turn === 'bot';
    const shipTemplateById = useMemo(() => new Map(SHIP_TEMPLATES.map((ship) => [ship.id, ship])), []);
    const remainingShips = SHIP_TEMPLATES.filter((ship) => !sunkShips.has(ship.id));
    const panelClassName = isEnemyBoard ? 'ships-remaining-panel panel-right' : 'ships-remaining-panel panel-left';

    useEffect(() => {
        if (!hasTrackedSunkShipsRef.current) {
            previousSunkShipsRef.current = new Set(sunkShips);
            hasTrackedSunkShipsRef.current = true;
            return;
        }

        const previouslySunk = previousSunkShipsRef.current;
        const newlySunkIds = [...sunkShips].filter((shipId) => !previouslySunk.has(shipId));
        previousSunkShipsRef.current = new Set(sunkShips);

        if (newlySunkIds.length === 0) {
            return;
        }

        const newlySunkSet = new Set(newlySunkIds);
        const newlySunkCellKeys = [];
        shipMap.forEach((shipId, cellKey) => {
            if (newlySunkSet.has(shipId)) {
                newlySunkCellKeys.push(cellKey);
            }
        });

        if (newlySunkCellKeys.length === 0) {
            return;
        }

        playSunkExplosionSound();

        if (document.documentElement.classList.contains('no-animations')) {
            return;
        }

        const explosionSet = new Set(newlySunkCellKeys);
        const startTimer = window.setTimeout(() => {
            setExplodingCells(explosionSet);
        }, 0);

        const clearTimer = window.setTimeout(() => {
            setExplodingCells(new Set());
        }, SUNK_EFFECT_MS);

        return () => {
            window.clearTimeout(startTimer);
            window.clearTimeout(clearTimer);
        };
    }, [sunkShips, shipMap]);

    return (
        <section className={`battle-board-wrap ${isActiveBoard ? 'is-active' : 'is-inactive'}`}>
            <div className="battle-board-content">
                {!winner && (
                    <aside className={panelClassName} aria-label={`${isEnemyBoard ? 'Enemy' : 'Your'} ships remaining`}>
                        <p className="ships-remaining-title">Ships Remaining</p>
                        <ul className="ships-remaining-list">
                            {remainingShips.map((ship) => (
                                <li key={`${boardType}-remaining-${ship.id}`} className="ships-remaining-item">
                                    <span className="ships-remaining-swatch" style={{ backgroundColor: ship.color }} aria-hidden="true"></span>
                                    <span className="ships-remaining-label">{ship.label}</span>
                                    <span className="ships-remaining-name">{ship.name}</span>
                                    <span className="ships-remaining-length">L{ship.length}</span>
                                </li>
                            ))}
                        </ul>
                    </aside>
                )}

                <div className="board-center-column">
                    <h3 className="battle-board-title">{isEnemyBoard ? 'Enemy Waters' : 'Your Fleet'}</h3>
                    <table className="game-board">
                        <tbody>
                            <tr>
                                <td className="board-label corner"></td>
                                {columnLabels.map((label) => (
                                    <td key={`${boardType}-label-${label}`} className="board-label column-label">
                                        {label}
                                    </td>
                                ))}
                            </tr>

                            {rowLabels.map((rowLabel, rowIdx) => (
                                <tr key={`${boardType}-row-${rowIdx}`}>
                                    <td className="board-label row-label">{rowLabel}</td>
                                    {columnLabels.map((_, colIdx) => {
                                        const key = getCellKey(rowIdx, colIdx);
                                        const wasShot = shotSet.has(key);
                                        const wasHit = hitSet.has(key);
                                        const shipId = shipMap.get(key);
                                        const isSunk = shipId ? sunkShips.has(shipId) : false;
                                        const showShip = !isEnemyBoard && Boolean(shipId);
                                        const shipColor = shipId ? shipTemplateById.get(shipId)?.color : undefined;
                                        const isExploding = explodingCells.has(key);

                                        const classNames = [
                                            'board-cell',
                                            showShip ? 'ship' : '',
                                            wasHit ? 'hit' : '',
                                            wasShot && !wasHit ? 'miss' : '',
                                            isSunk ? 'sunk' : '',
                                            isExploding ? 'sunk-exploding' : '',
                                            isEnemyBoard && !wasShot && turn === 'player' && !winner ? 'targetable' : ''
                                        ]
                                            .filter(Boolean)
                                            .join(' ');

                                        const cellStyle = showShip && shipColor ? { '--ship-cell-color': shipColor } : undefined;

                                        return (
                                            <td
                                                key={`${boardType}-${key}`}
                                                className={classNames}
                                                style={cellStyle}
                                                onClick={
                                                    isEnemyBoard
                                                        ? () => onShoot(rowIdx, colIdx)
                                                        : undefined
                                                }
                                            >
                                                {isExploding && (
                                                    <span className="sunk-explosion" aria-hidden="true">
                                                        <span className="sunk-explosion-core"></span>
                                                        <span className="sunk-explosion-ring"></span>
                                                        <span className="sunk-explosion-sparks"></span>
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
