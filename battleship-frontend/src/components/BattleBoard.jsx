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

    return (
        <section className="battle-board-wrap">
            <h3>{isEnemyBoard ? 'Enemy Waters' : 'Your Fleet'}</h3>
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

                                return (
                                    <td
                                        key={`${boardType}-${key}`}
                                        className={classNames}
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
        </section>
    );
}
