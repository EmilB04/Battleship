import { useEffect, useState } from 'react';
import '../styles/components/shipsStyle.css';

export default function Ships({ selectedShip, setSelectedShip, orientation, setOrientation, placedShips, onFinishSetup }) {
    const ships = [
        { id: 1, name: 'Carrier', label: 'CA',  length: 5, color: '#e63946' },
        { id: 2, name: 'Battleship', label: 'BS', length: 4, color: '#ff6b35' },
        { id: 3, name: 'Cruiser', label: 'CR', length: 3, color: '#ffb703' },
        { id: 4, name: 'Submarine', label: 'SM', length: 3, color: '#00ff41' },
        { id: 5, name: 'Destroyer', label: 'DE', length: 2, color: '#005275ff' }
    ];

    const isShipPlaced = (shipId) => placedShips.some(ship => ship.id === shipId);
    const allShipsPlaced = placedShips.length === ships.length;

    const handleDragStart = (e, ship) => {
        setSelectedShip(ship);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleFinishSetup = () => {
        if (allShipsPlaced && onFinishSetup) {
            onFinishSetup();
        }
    };

    return (
        <section className="ships-container">
            <div className="ships-header">
                <h3>Your Fleet</h3>
                <div className="header-buttons">
                    <button 
                        className="orientation-button"
                        onClick={() => setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal')}
                    >
                        Rotate: {orientation === 'horizontal' ? '→' : '↓'}
                    </button>
                    <button 
                        className="finish-setup-button"
                        onClick={handleFinishSetup}
                        disabled={!allShipsPlaced}
                    >
                        Finish Setup
                    </button>
                </div>
            </div>
            <div className="ships-row">
                {ships.map(ship => (
                    <div 
                        key={ship.id}
                        className={`ship-item ${selectedShip?.id === ship.id ? 'selected' : ''} ${isShipPlaced(ship.id) ? 'placed' : ''}`}
                        onClick={() => !isShipPlaced(ship.id) && setSelectedShip(ship)}
                        draggable={!isShipPlaced(ship.id)}
                        onDragStart={(e) => handleDragStart(e, ship)}
                    >
                        <div className="ship-name">{ship.name}</div>
                        <div className={`ship-preview ${orientation}`}>
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
        </section>
    );
}