import { SHIP_TEMPLATES } from '../constants/gameConstants';

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
    const isEnemyBoard = boardType === 'enemy';
    const isActiveBoard = isEnemyBoard ? turn === 'player' : turn === 'bot';
    const shipTemplateById = new Map(SHIP_TEMPLATES.map((ship) => [ship.id, ship]));
    const remainingShips = SHIP_TEMPLATES.filter((ship) => !sunkShips.has(ship.id));
    const panelClassName = isEnemyBoard ? 'ships-remaining-panel panel-right' : 'ships-remaining-panel panel-left';

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

                                        const classNames = [
                                            'board-cell',
                                            showShip ? 'ship' : '',
                                            wasHit ? 'hit' : '',
                                            wasShot && !wasHit ? 'miss' : '',
                                            isSunk ? 'sunk' : '',
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
                                            />
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
