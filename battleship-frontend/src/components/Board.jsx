import { useState } from 'react';
import '../styles/components/boardStyle.css';

export default function Board({ selectedShip, setSelectedShip, orientation, placedShips = [], setPlacedShips, onFinishSetup }) {
    const BOARD_SIZE = 10;
    const [hoveredCells, setHoveredCells] = useState([]);

    // Calculate if all ships are placed (5 ships total)
    const TOTAL_SHIPS = 5;
    const allShipsPlaced = placedShips.length === TOTAL_SHIPS;

    const handleStartGame = () => {
        if (allShipsPlaced && onFinishSetup) {
            onFinishSetup();
        }
    };

    // Generate column labels (A-J)
    const columnLabels = Array.from({ length: BOARD_SIZE }, (_, i) => String.fromCharCode(65 + i));
    
    // Generate row labels (1-10)
    const rowLabels = Array.from({ length: BOARD_SIZE }, (_, i) => i + 1);

    // Check if a position is valid for placing a ship
    const isValidPlacement = (row, col, ship, orientation) => {
        if (!ship) return false;

        // Check if ship fits within board
        if (orientation === 'horizontal') {
            if (col + ship.length > BOARD_SIZE) return false;
        } else {
            if (row + ship.length > BOARD_SIZE) return false;
        }

        // Check for overlaps with existing ships
        for (let i = 0; i < ship.length; i++) {
            const checkRow = orientation === 'horizontal' ? row : row + i;
            const checkCol = orientation === 'horizontal' ? col + i : col;
            
            if (isCellOccupied(checkRow, checkCol)) {
                return false;
            }
        }

        return true;
    };

    // Check if a cell is occupied by any placed ship
    const isCellOccupied = (row, col) => {
        return placedShips.some(ship => {
            const cells = getShipCells(ship);
            return cells.some(cell => cell.row === row && cell.col === col);
        });
    };

    // Get all cells occupied by a ship
    const getShipCells = (ship) => {
        const cells = [];
        for (let i = 0; i < ship.length; i++) {
            if (ship.orientation === 'horizontal') {
                cells.push({ row: ship.row, col: ship.col + i });
            } else {
                cells.push({ row: ship.row + i, col: ship.col });
            }
        }
        return cells;
    };

    // Get preview cells when hovering
    const getPreviewCells = (row, col) => {
        if (!selectedShip) return [];
        if (!isValidPlacement(row, col, selectedShip, orientation)) return [];

        const cells = [];
        for (let i = 0; i < selectedShip.length; i++) {
            if (orientation === 'horizontal') {
                cells.push(`${row}-${col + i}`);
            } else {
                cells.push(`${row + i}-${col}`);
            }
        }
        return cells;
    };

    // Handle cell hover
    const handleCellMouseEnter = (row, col) => {
        if (!selectedShip) return;
        const preview = getPreviewCells(row, col);
        setHoveredCells(preview);
    };

    const handleCellMouseLeave = () => {
        setHoveredCells([]);
    };

    // Handle cell click to place ship
    const handleCellClick = (row, col) => {
        if (!selectedShip) return;
        
        if (isValidPlacement(row, col, selectedShip, orientation)) {
            const newShip = {
                ...selectedShip,
                row,
                col,
                orientation
            };
            setPlacedShips([...placedShips, newShip]);
            setSelectedShip(null);
        }
    };

    // Handle drag and drop
    const handleDragOver = (e, row, col) => {
        e.preventDefault();
        if (!selectedShip) return;
        const preview = getPreviewCells(row, col);
        setHoveredCells(preview);
    };

    const handleDrop = (e, row, col) => {
        e.preventDefault();
        handleCellClick(row, col);
        setHoveredCells([]);
    };

    // Handle right-click or double-click to remove ship
    const handleCellContextMenu = (e, row, col) => {
        e.preventDefault();
        removeShipAtCell(row, col);
    };

    const handleCellDoubleClick = (row, col) => {
        removeShipAtCell(row, col);
    };

    const removeShipAtCell = (row, col) => {
        const shipToRemove = placedShips.find(ship => {
            const cells = getShipCells(ship);
            return cells.some(cell => cell.row === row && cell.col === col);
        });

        if (shipToRemove) {
            setPlacedShips(placedShips.filter(ship => ship.id !== shipToRemove.id));
        }
    };

    // Get ship info at a specific cell
    const getShipAtCell = (row, col) => {
        return placedShips.find(ship => {
            const cells = getShipCells(ship);
            return cells.some(cell => cell.row === row && cell.col === col);
        });
    };

    return (
        <section className="board-screen">
            <table className="game-board">
                <tbody>
                    {/* Header row with column labels */}
                    <tr>
                        <td className="board-label corner"></td>
                        {columnLabels.map((label) => (
                            <td key={label} className="board-label column-label">
                                {label}
                            </td>
                        ))}
                    </tr>
                    
                    {/* Board rows */}
                    {rowLabels.map((rowLabel, rowIndex) => (
                        <tr key={rowIndex}>
                            {/* Row label */}
                            <td className="board-label row-label">{rowLabel}</td>
                            
                            {/* Board cells */}
                            {columnLabels.map((_, colIndex) => {
                                const cellKey = `${rowIndex}-${colIndex}`;
                                const isHovered = hoveredCells.includes(cellKey);
                                const isOccupied = isCellOccupied(rowIndex, colIndex);
                                const ship = getShipAtCell(rowIndex, colIndex);
                                
                                return (
                                    <td
                                        key={cellKey}
                                        className={`board-cell ${isOccupied ? 'occupied' : ''} ${isHovered ? 'hover-preview' : ''}`}
                                        style={{
                                            backgroundColor: isOccupied && ship ? ship.color : undefined
                                        }}
                                        onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                                        onMouseLeave={handleCellMouseLeave}
                                        onClick={() => handleCellClick(rowIndex, colIndex)}
                                        onContextMenu={(e) => handleCellContextMenu(e, rowIndex, colIndex)}
                                        onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                                        onDragOver={(e) => handleDragOver(e, rowIndex, colIndex)}
                                        onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                                    >
                                        {isOccupied && ship && (
                                            <span className="ship-label">{ship.label}</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {/* Start Game button */}
            <button 
                id="start-game-button"
                onClick={handleStartGame}
                disabled={!allShipsPlaced}
                title={!allShipsPlaced ? `Place all ${TOTAL_SHIPS} ships to start (${placedShips.length}/${TOTAL_SHIPS})` : 'Start the game!'}
            >
                {allShipsPlaced ? 'Start Game' : `Place Ships (${placedShips.length}/${TOTAL_SHIPS})`}
            </button>
        </section>
    );
}