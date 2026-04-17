import { useMemo, useState } from 'react';

export default function Leaderboard({
    entries,
    status,
    onDeleteEntry,
    devMode
}) {
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [gridFilter, setGridFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const hasEntries = entries.length > 0;

    const filteredEntries = useMemo(() => {
        if (!hasEntries) {
            return entries;
        }

        return entries.filter((entry) => {
            const entryDifficulty = (entry.difficulty || '').toLowerCase();
            const entryGrid = String(entry.gridSize || 10);

            const difficultyMatches = difficultyFilter === 'all' || entryDifficulty === difficultyFilter;
            const gridMatches = gridFilter === 'all' || entryGrid === gridFilter;

            return difficultyMatches && gridMatches;
        });
    }, [entries, hasEntries, difficultyFilter, gridFilter]);

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
                    <button
                        type="button"
                        className={`leaderboard-filter-toggle ${showFilters ? 'is-active' : ''}`}
                        onClick={() => setShowFilters((prevValue) => !prevValue)}
                    >
                        Filter
                    </button>
                    {showFilters && (
                        <>
                            <div className="leaderboard-quick-group" role="group" aria-label="Filter by grid size">
                                <span className="leaderboard-quick-label">Grid</span>
                                {['all', '8', '10', '12'].map((size) => {
                                    const isActive = gridFilter === size;
                                    const label = size === 'all' ? 'All' : `${size}x${size}`;

                                    return (
                                        <button
                                            key={`grid-${size}`}
                                            type="button"
                                            className={`leaderboard-quick-button ${isActive ? 'is-active' : ''}`}
                                            onClick={() => setGridFilter(size)}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="leaderboard-quick-group" role="group" aria-label="Filter by difficulty">
                                <span className="leaderboard-quick-label">Difficulty</span>
                                {['all', 'easy', 'medium', 'hard', 'extreme'].map((difficulty) => {
                                    const isActive = difficultyFilter === difficulty;

                                    return (
                                        <button
                                            key={`difficulty-${difficulty}`}
                                            type="button"
                                            className={`leaderboard-quick-button ${isActive ? 'is-active' : ''}`}
                                            onClick={() => setDifficultyFilter(difficulty)}
                                        >
                                            {difficulty === 'all' ? 'All' : difficulty}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            )}

            {!hasEntries && <p className="leaderboard-empty">No completed matches yet.</p>}

            {hasEntries && filteredEntries.length === 0 && (
                <p className="leaderboard-empty">No entries match current filters.</p>
            )}

            {hasEntries && filteredEntries.length > 0 && (
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
                        {filteredEntries.map((entry, index) => (
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
