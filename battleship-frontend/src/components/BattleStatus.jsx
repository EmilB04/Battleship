import WinConfetti from './WinConfetti';

export default function BattleStatus({
    difficulty,
    statusText,
    turn,
    winner,
    headerTitle = 'Battle In Progress',
    subtitleText,
    turnLabel,
    showTurn = true
}) {
    const resolvedSubtitle = subtitleText || `Difficulty: ${String(difficulty || '').toUpperCase()}`;
    const resolvedTurnLabel = turnLabel || (turn === 'player' ? 'You' : 'AI Bot');

    return (
        <>
            {winner === 'player' && <WinConfetti />}
            <h2 className="battle-header-title">{headerTitle}</h2>
            <p className="battle-subtitle"><strong>{resolvedSubtitle}</strong></p>
            {statusText && <p className="battle-status">{statusText}</p>}
            {!winner && showTurn && <p className="battle-turn">Turn: {resolvedTurnLabel}</p>}
            {winner && (
                <p className={`battle-winner ${winner === 'player' ? 'winner-player' : 'winner-bot'}`}>
                    {winner === 'player' ? 'You win!' : 'You lose!'}
                </p>
            )}
        </>
    );
}
