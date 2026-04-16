import WinConfetti from './WinConfetti';

export default function BattleStatus({ difficulty, statusText, turn, winner }) {
    return (
        <>
            {winner === 'player' && <WinConfetti />}
            <h2>Battle In Progress</h2>
            <p className="battle-subtitle">Difficulty: <strong>{difficulty.toUpperCase()}</strong></p>
            <p className="battle-status">{statusText}</p>
            {!winner && <p className="battle-turn">Turn: {turn === 'player' ? 'You' : 'AI Bot'}</p>}
            {winner && (
                <p className={`battle-winner ${winner === 'player' ? 'winner-player' : 'winner-bot'}`}>
                    {winner === 'player' ? 'You win!' : 'You lose!'}
                </p>
            )}
        </>
    );
}
