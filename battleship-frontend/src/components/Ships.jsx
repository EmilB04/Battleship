import '../styles/components/shipsStyle.css';

export default function Ships({ selectedShip, setSelectedShip, orientation, setOrientation, placedShips }) {
    const ships = [
        { id: 1, name: 'Carrier', label: 'CA',  length: 5, color: 'var(--carrier)' },
        { id: 2, name: 'Battleship', label: 'BS', length: 4, color: 'var(--battleship)' },
        { id: 3, name: 'Cruiser', label: 'CR', length: 3, color: 'var(--cruiser)' },
        { id: 4, name: 'Submarine', label: 'SM', length: 3, color: 'var(--submarine)' },
        { id: 5, name: 'Destroyer', label: 'DE', length: 2, color: 'var(--destroyer)' }
    ];

    const isShipPlaced = (shipId) => placedShips.some(ship => ship.id === shipId);

    const handleDragStart = (e, ship) => {
        setSelectedShip(ship);
        e.dataTransfer.effectAllowed = 'move';

        // Keep the dragged ship semi-transparent for better visibility over the board.
        e.currentTarget.classList.add('is-dragging');

        const dragPreview = document.createElement('div');
        dragPreview.style.display = 'flex';
        dragPreview.style.flexDirection = orientation === 'vertical' ? 'column' : 'row';
        dragPreview.style.gap = '2px';
        dragPreview.style.opacity = '0.38';
        dragPreview.style.pointerEvents = 'none';
        dragPreview.style.position = 'absolute';
        dragPreview.style.top = '-9999px';
        dragPreview.style.left = '-9999px';

        const sampleCell = e.currentTarget.querySelector('.ship-cell');
        const computedCell = sampleCell ? window.getComputedStyle(sampleCell) : null;
        const cellWidth = computedCell?.width || '30px';
        const cellHeight = computedCell?.height || '30px';
        const cellBorderRadius = computedCell?.borderRadius || '6px';
        const cellBorder = computedCell?.border || '1px solid rgba(0, 0, 0, 0.25)';

        for (let i = 0; i < ship.length; i += 1) {
            const cell = document.createElement('div');
            cell.style.width = cellWidth;
            cell.style.height = cellHeight;
            cell.style.borderRadius = cellBorderRadius;
            cell.style.border = cellBorder;
            cell.style.backgroundColor = ship.color;
            dragPreview.appendChild(cell);
        }

        document.body.appendChild(dragPreview);

        const previewWidth = dragPreview.offsetWidth || 24;
        const previewHeight = dragPreview.offsetHeight || 24;
        e.dataTransfer.setDragImage(dragPreview, previewWidth / 2, previewHeight / 2);

        window.setTimeout(() => {
            if (dragPreview.parentNode) {
                dragPreview.parentNode.removeChild(dragPreview);
            }
        }, 0);
    };

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('is-dragging');
    };

    return (
        <section id="ships-container">
            
            <div id="ships-row">
                {ships.map(ship => (
                    <div 
                        key={ship.id}
                        className={`ship-item ${selectedShip?.id === ship.id ? 'selected' : ''} ${isShipPlaced(ship.id) ? 'placed' : ''}`}
                        onClick={() => !isShipPlaced(ship.id) && setSelectedShip(ship)}
                        style={{ cursor: isShipPlaced(ship.id) ? 'not-allowed' : 'pointer' }}
                    >
                        <div className="ship-name">{ship.name}</div>
                        <div 
                            className="ship-preview"
                            draggable={!isShipPlaced(ship.id)}
                            onDragStart={(e) => !isShipPlaced(ship.id) && handleDragStart(e, ship)}
                            onDragEnd={handleDragEnd}
                        >
                            {[...Array(ship.length)].map((_, index) => (
                                <div 
                                    key={index} 
                                    className="ship-cell"
                                    style={{ backgroundColor: ship.color }}
                                >
                                    <span className="ship-label">{ship.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="ship-length">Length: {ship.length}</div>
                    </div>
                ))}
            </div>
            <div id="header-buttons">
                <button
                    id="orientation-button"
                    onClick={() => setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal')}
                    aria-label={`Rotate ships to ${orientation === 'horizontal' ? 'vertical' : 'horizontal'}`}
                    title={`Rotate ships to ${orientation === 'horizontal' ? 'vertical' : 'horizontal'}`}
                >
                    <span className="orientation-button-text">Rotate Ships</span>
                    <span className="orientation-button-arrow" aria-hidden="true">{orientation === 'horizontal' ? '↔' : '↕'}</span>
                </button>
            </div>
        </section>
    );
}