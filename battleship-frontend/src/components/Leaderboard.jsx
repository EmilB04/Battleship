import { useMemo, useState } from 'react';

export default function Leaderboard({
    entries,
    status,
    onDeleteEntry,
    devMode
}) {
    const [difficultySort, setDifficultySort] = useState('none');
    const [gridSort, setGridSort] = useState('none');
    const hasEntries = entries.length > 0;

    const sortedEntries = useMemo(() => {
        if (!hasEntries || (difficultySort === 'none' && gridSort === 'none')) {
            return entries;
        }

        const difficultyRank = {
            easy: 1,
            medium: 2,
            hard: 3,
            extreme: 4
        };

        return [...entries].sort((a, b) => {
            if (difficultySort !== 'none') {
                const diffA = difficultyRank[(a.difficulty || '').toLowerCase()] || Number.MAX_SAFE_INTEGER;
                const diffB = difficultyRank[(b.difficulty || '').toLowerCase()] || Number.MAX_SAFE_INTEGER;
                const difficultyDiff = diffA - diffB;
                if (difficultyDiff !== 0) {
                    return difficultySort === 'asc' ? difficultyDiff : -difficultyDiff;
                }
            }

            if (gridSort !== 'none') {
                const gridA = Number(a.gridSize) || 10;
                const gridB = Number(b.gridSize) || 10;
                const gridDiff = gridA - gridB;
                if (gridDiff !== 0) {
                    return gridSort === 'asc' ? gridDiff : -gridDiff;
                }
            }

            return 0;
        });
    }, [entries, hasEntries, difficultySort, gridSort]);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) {
            return timestamp;
        }

        return date.toLocaleString('nb-NO');
    };

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

            {status?.text && (
                <p className={`leaderboard-status leaderboard-status-${status.level || 'info'}`}>
                    {status.text}
                </p>
            )}

            {hasEntries && (
                <div className="leaderboard-controls" aria-label="Leaderboard sorting controls">
                    <div className="leaderboard-control">
                        <label htmlFor="leaderboard-sort-difficulty">Sort Difficulty</label>
                        <select
                            id="leaderboard-sort-difficulty"
                            value={difficultySort}
                            onChange={(event) => setDifficultySort(event.target.value)}
                        >
                            <option value="none">Default</option>
                            <option value="asc">Easy to Extreme</option>
                            <option value="desc">Extreme to Easy</option>
                        </select>
                    </div>
                    <div className="leaderboard-control">
                        <label htmlFor="leaderboard-sort-grid">Sort Grid</label>
                        <select
                            id="leaderboard-sort-grid"
                            value={gridSort}
                            onChange={(event) => setGridSort(event.target.value)}
                        >
                            <option value="none">Default</option>
                            <option value="asc">Small to Large</option>
                            <option value="desc">Large to Small</option>
                        </select>
                    </div>
                </div>
            )}

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
                        {sortedEntries.map((entry, index) => (
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
                                <td className="col-date">{formatDate(entry.timestamp)}</td>
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
