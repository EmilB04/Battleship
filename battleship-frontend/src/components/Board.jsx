import { useState, useEffect } from 'react';
import '../styles/components/boardStyle.css';

export default function Board() {
    const [gridSize, setGridSize] = useState(() => {
        const saved = localStorage.getItem('gridSize');
        return saved ? parseInt(saved) : 10;
    });

    useEffect(() => {
        const handleStorageChange = () => {
            const newSize = localStorage.getItem('gridSize');
            if (newSize) {
                setGridSize(parseInt(newSize));
            }
        };

        const handleGridSizeChange = () => {
            const newSize = localStorage.getItem('gridSize');
            if (newSize) {
                setGridSize(parseInt(newSize));
            }
        };

        // Listen for custom event from settings
        window.addEventListener('gridSizeChanged', handleGridSizeChange);
        // Listen for changes to gridSize in localStorage (cross-tab)
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('gridSizeChanged', handleGridSizeChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Generate column letters (A, B, C, ...)
    const getColumnLetter = (index) => {
        return String.fromCharCode(65 + index); // A=65 in ASCII
    };

    return (
        <section className="board-screen">
            <table className="game-board" style={{
                '--grid-size': gridSize
            }}>
                <thead>
                    <tr>
                        <th className="board-label corner">{gridSize}×{gridSize}</th>
                        {[...Array(gridSize)].map((_, colIndex) => (
                            <th key={colIndex} className="board-label column-label">
                                {colIndex + 1}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {[...Array(gridSize)].map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            <th className="board-label row-label">{getColumnLetter(rowIndex)}</th>
                            {[...Array(gridSize)].map((_, colIndex) => (
                                <td 
                                    key={colIndex} 
                                    className="board-cell"
                                    data-row={rowIndex}
                                    data-col={colIndex}
                                ></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}