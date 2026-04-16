export default function PlayerSummary({ summary }) {
    if (!summary) {
        return null;
    }

    return (
        <section className="battle-summary-column" aria-live="polite">
            <p className="battle-summary-kicker">Battle Summary</p>
            <h3 className="battle-summary-title">Winner: {summary.winnerLabel}</h3>
            <p className="battle-summary-subtitle">Player Stats</p>
            <ul className="battle-summary-list">
                <li className="battle-summary-item">
                    <span className="battle-summary-label">Shots Fired</span>
                    <span className="battle-summary-value">{summary.shots}</span>
                </li>
                <li className="battle-summary-item">
                    <span className="battle-summary-label">Hits</span>
                    <span className="battle-summary-value">{summary.hits}</span>
                </li>
                <li className="battle-summary-item">
                    <span className="battle-summary-label">Misses</span>
                    <span className="battle-summary-value">{summary.misses}</span>
                </li>
                <li className="battle-summary-item">
                    <span className="battle-summary-label">Accuracy</span>
                    <span className="battle-summary-value">{summary.accuracy}%</span>
                </li>
                <li className="battle-summary-item">
                    <span className="battle-summary-label">Enemy Ships Sunk</span>
                    <span className="battle-summary-value">{summary.shipsSunk}</span>
                </li>
            </ul>
        </section>
    );
}
