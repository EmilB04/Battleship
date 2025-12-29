import { useState, useEffect } from 'react';
import '../styles/components/boardStyle.css';

export default function Board({ selectedShip, setSelectedShip, orientation, placedShips = [], setPlacedShips }) {
    const [gridSize, setGridSize] = useState(() => {
        const saved = localStorage.getItem('gridSize');
        return saved ? parseInt(saved) : 10;
    });
    const [hoveredCells, setHoveredCells] = useState([]);

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

    const canPlaceShip = (row, col, ship) => {
        if (!ship) return false;
        
        // Check boundaries
        if (orientation === 'horizontal') {
            if (col + ship.length > gridSize) return false;
        } else {
            if (row + ship.length > gridSize) return false;
        }
        
        // Check for collisions with other ships
        for (let i = 0; i < ship.length; i++) {
            const checkRow = orientation === 'horizontal' ? row : row + i;
            const checkCol = orientation === 'horizontal' ? col + i : col;
            
            if (placedShips.some(placed => 
                placed.cells && placed.cells.some(cell => cell.row === checkRow && cell.col === checkCol)
            )) {
                return false;
            }
        }
        
        return true;
    };

    const getCellsForShip = (row, col, ship) => {
        const cells = [];
        for (let i = 0; i < ship.length; i++) {
            cells.push({
                row: orientation === 'horizontal' ? row : row + i,
                col: orientation === 'horizontal' ? col + i : col
            });
        }
        return cells;
    };

    const handleCellClick = (row, col) => {
        if (selectedShip && canPlaceShip(row, col, selectedShip)) {
            const cells = getCellsForShip(row, col, selectedShip);
            setPlacedShips([...placedShips, {
                ...selectedShip,
                cells,
                orientation
            }]);
            setSelectedShip(null); // Clear selection after placing
        }
    };

    const handleDragOver = (e, row, col) => {
        e.preventDefault();
        if (selectedShip && canPlaceShip(row, col, selectedShip)) {
            const cells = getCellsForShip(row, col, selectedShip);
            setHoveredCells(cells);
        } else {
            setHoveredCells([]);
        }
    };

    const handleDrop = (e, row, col) => {
        e.preventDefault();
        if (selectedShip && canPlaceShip(row, col, selectedShip)) {
            const cells = getCellsForShip(row, col, selectedShip);
            setPlacedShips([...placedShips, {
                ...selectedShip,
                cells,
                orientation
            }]);
            setSelectedShip(null); // Clear selection after placing
        }
        setHoveredCells([]);
    };

    const handleDragLeave = () => {
        setHoveredCells([]);
    };

    const handleCellRightClick = (e, row, col) => {
        e.preventDefault();
        const occupiedShip = isCellOccupied(row, col);
        if (occupiedShip) {
            // Remove the ship from placed ships
            setPlacedShips(placedShips.filter(ship => ship.id !== occupiedShip.id));
        }
    };

    const handleCellDoubleClick = (row, col) => {
        const occupiedShip = isCellOccupied(row, col);
        if (occupiedShip) {
            // Remove the ship from placed ships
            setPlacedShips(placedShips.filter(ship => ship.id !== occupiedShip.id));
        }
    };

    const isCellOccupied = (row, col) => {
        if (!placedShips || placedShips.length === 0) return null;
        return placedShips.find(ship => 
            ship.cells && ship.cells.some(cell => cell.row === row && cell.col === col)
        );
    };

    const isCellHovered = (row, col) => {
        if (!hoveredCells || hoveredCells.length === 0) return false;
        return hoveredCells.some(cell => cell.row === row && cell.col === col);
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
                            {[...Array(gridSize)].map((_, colIndex) => {
                                const occupiedShip = isCellOccupied(rowIndex, colIndex);
                                const isHovered = isCellHovered(rowIndex, colIndex);
                                
                                return (
                                    <td 
                                        key={colIndex} 
                                        className={`board-cell ${
                                            occupiedShip ? 'occupied' : ''
                                        } ${
                                            isHovered ? 'hover-preview' : ''
                                        }`}
                                        style={{
                                            backgroundColor: occupiedShip ? occupiedShip.color : undefined
                                        }}
                                        data-row={rowIndex}
                                        data-col={colIndex}
                                        onClick={() => handleCellClick(rowIndex, colIndex)}
                                        onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                                        onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
                                        onDragOver={(e) => handleDragOver(e, rowIndex, colIndex)}
                                        onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                                        onDragLeave={handleDragLeave}
                                        title={occupiedShip ? 'Double-click or right-click to remove' : ''}
                                    >
                                        {occupiedShip && (
                                            <span className="ship-label">{occupiedShip.label}</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}