export default function Leaderboard({ entries, onDeleteEntry, devMode }) {
    const hasEntries = entries.length > 0;

    const getRankClass = (index) => {
        if (index === 0) return 'rank-gold';
        if (index === 1) return 'rank-silver';
        if (index === 2) return 'rank-bronze';
        return '';
    };

    const handleDeleteEntry = (entryId) => {
        if (onDeleteEntry && devMode) {
            onDeleteEntry(entryId);
        }
    };

    return (
        <section className="leaderboard" aria-label="Leaderboard">
            <h3 className="leaderboard-title">Leaderboard</h3>

            {!hasEntries && <p className="leaderboard-empty">No completed matches yet.</p>}

            {hasEntries && (
                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th className="col-rank">Rank</th>
                            <th className="col-player">Player</th>
                            <th className="col-result">Result</th>
                            <th className="col-difficulty">Difficulty</th>
                            <th className="col-grid">Grid</th>
                            <th className="col-score">Score</th>
                            <th className="col-stats">Shots</th>
                            <th className="col-stats">Accuracy</th>
                            <th className="col-date">Date</th>
                            {devMode && <th className="col-action">Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry, index) => (
                            <tr key={entry.id} className="leaderboard-row">
                                <td className={`col-rank ${getRankClass(index)}`}>#{index + 1}</td>
                                <td className="col-player">{entry.username || 'Anonymous'}</td>
                                <td className={`col-result ${entry.result === 'player' ? 'victory' : 'defeat'}`}>
                                    {entry.result === 'player' ? 'Victory' : 'Defeat'}
                                </td>
                                <td className="col-difficulty">{entry.difficulty.toUpperCase()}</td>
                                <td className="col-grid">{entry.gridSize || 10}x{entry.gridSize || 10}</td>
                                <td className="col-score">{entry.score}</td>
                                <td className="col-stats">{entry.playerShots}</td>
                                <td className="col-stats">{entry.accuracy}%</td>
                                <td className="col-date">{new Date(entry.timestamp).toLocaleString()}</td>
                                {devMode && (
                                    <td className="col-action">
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDeleteEntry(entry.id)}
                                            title="Delete this entry"
                                        >
                                            ✕
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
}
