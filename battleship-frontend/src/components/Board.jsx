import { useCallback, useMemo, useState } from 'react';
import '../styles/components/boardStyle.css';
import { getShipCells, isValidShipPlacement } from '../utils/shipUtils';

export default function Board({ boardSize = 10, selectedShip, setSelectedShip, orientation, setOrientation, placedShips = [], setPlacedShips, onFinishSetup }) {
    const BOARD_SIZE = boardSize;
    const [hoverAnchor, setHoverAnchor] = useState(null);
    const facingLabel = orientation === 'horizontal' ? 'Horizontal' : 'Vertical';
    const facingArrow = orientation === 'horizontal' ? '↔' : '↕';

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

    // Check if a cell is occupied by any placed ship
    const isCellOccupied = (row, col) => {
        return placedShips.some(ship => {
            const cells = getShipCells(ship);
            return cells.some(cell => cell.row === row && cell.col === col);
        });
    };

    // Check if a position is valid for placing a ship
    const isValidPlacement = useCallback((row, col, ship, orientation) => {
        if (!ship) return false;
        const candidateShip = { ...ship, row, col, orientation };
        return isValidShipPlacement(placedShips, candidateShip, BOARD_SIZE);
    }, [placedShips, BOARD_SIZE]);

    const hoveredCells = useMemo(() => {
        if (!selectedShip || !hoverAnchor) {
            return [];
        }

        const { row, col } = hoverAnchor;
        if (!isValidPlacement(row, col, selectedShip, orientation)) {
            return [];
        }

        const cells = [];
        for (let i = 0; i < selectedShip.length; i++) {
            if (orientation === 'horizontal') {
                cells.push(`${row}-${col + i}`);
            } else {
                cells.push(`${row + i}-${col}`);
            }
        }

        return cells;
    }, [selectedShip, hoverAnchor, orientation, isValidPlacement]);

    // Handle cell hover
    const handleCellMouseEnter = (row, col) => {
        if (!selectedShip) return;
        setHoverAnchor({ row, col });
    };

    const handleCellMouseLeave = () => {
        setHoverAnchor(null);
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
            setHoverAnchor(null);
            setSelectedShip(null);
        }
    };

    // Handle drag and drop
    const handleDragOver = (e, row, col) => {
        e.preventDefault();
        if (!selectedShip) return;
        setHoverAnchor({ row, col });
    };

    const handleDrop = (e, row, col) => {
        e.preventDefault();
        handleCellClick(row, col);
        setHoverAnchor(null);
    };

    // Handle right-click or double-click to remove ship
    const handleCellContextMenu = (e, row, col) => {
        e.preventDefault();
        removeShipAtCell(row, col);
    };

    const handleCellDoubleClick = (row, col) => {
        removeShipAtCell(row, col);
    };

    const handleBoardWheel = useCallback((e) => {
        e.preventDefault();

        if (!setOrientation || e.deltaY === 0) {
            return;
        }

        setOrientation(e.deltaY < 0 ? 'horizontal' : 'vertical');
    }, [setOrientation]);

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
        <section className="board-screen" onWheel={handleBoardWheel}>
            <div className="board-placement-area">
                <div className="board-direction board-direction-left" aria-hidden="true">
                    <span className="board-direction-label">Facing</span>
                    <span className="board-direction-arrow">{facingArrow}</span>
                    <span className="board-direction-text">{facingLabel}</span>
                </div>

                <table className="game-board" style={{ '--grid-size': BOARD_SIZE }}>
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
                                    const isPreviewPlacement = isHovered && !isOccupied && Boolean(selectedShip);
                                    
                                    return (
                                        <td
                                            key={cellKey}
                                            className={`board-cell ${isOccupied ? 'occupied' : ''} ${isHovered ? 'hover-preview' : ''} ${isPreviewPlacement ? 'preview-placement' : ''}`}
                                            style={{
                                                backgroundColor: isOccupied && ship ? ship.color : undefined,
                                                '--preview-ship-color': isPreviewPlacement && selectedShip ? selectedShip.color : undefined
                                            }}
                                            onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                                            onMouseLeave={handleCellMouseLeave}
                                            onClick={() => handleCellClick(rowIndex, colIndex)}
                                            onContextMenu={(e) => handleCellContextMenu(e, rowIndex, colIndex)}
                                            onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                                            onDragOver={(e) => handleDragOver(e, rowIndex, colIndex)}
                                            onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                                        >
                                            {(isOccupied && ship) || isPreviewPlacement ? (
                                                <span className={`ship-label ${isPreviewPlacement ? 'ship-label-preview' : ''}`}>
                                                    {isOccupied && ship ? ship.label : selectedShip.label}
                                                </span>
                                            ) : null}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="board-direction board-direction-right" aria-hidden="true">
                    <span className="board-direction-label">Facing</span>
                    <span className="board-direction-arrow">{facingArrow}</span>
                    <span className="board-direction-text">{facingLabel}</span>
                </div>
            </div>
            
            {/* Start Game button */}
            <button 
                id="start-game-button"
                onClick={handleStartGame}
                disabled={!allShipsPlaced}
                title={!allShipsPlaced ? `Place all ${TOTAL_SHIPS} ships to start (${placedShips.length}/${TOTAL_SHIPS})` : 'Start the game!'}
            >
                {allShipsPlaced ? 'Start Game' : `Placed Ships (${placedShips.length}/${TOTAL_SHIPS})`}
            </button>
        </section>
    );
}