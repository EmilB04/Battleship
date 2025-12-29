import { useState } from 'react';
import '../styles/components/shipsStyle.css';

export default function Ships() {
    const ships = [
        { id: 1, name: 'Carrier', label: 'CA',  length: 5, color: '#e63946' },
        { id: 2, name: 'Battleship', label: 'BS', length: 4, color: '#ff6b35' },
        { id: 3, name: 'Cruiser', label: 'CR', length: 3, color: '#ffb703' },
        { id: 4, name: 'Submarine', label: 'SM', length: 3, color: '#00ff41' },
        { id: 5, name: 'Destroyer', label: 'DE', length: 2, color: '#2e86ab' }
    ];

    const [selectedShip, setSelectedShip] = useState(null);
    const [orientation, setOrientation] = useState('horizontal');

    return (
        <section className="ships-container">
            <div className="ships-header">
                <h3>Your Fleet</h3>
                <button 
                    className="orientation-button"
                    onClick={() => setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal')}
                >
                    Rotate: {orientation === 'horizontal' ? '→' : '↓'}
                </button>
            </div>
            <div className="ships-row">
                {ships.map(ship => (
                    <div 
                        key={ship.id}
                        className={`ship-item ${selectedShip?.id === ship.id ? 'selected' : ''}`}
                        onClick={() => setSelectedShip(ship)}
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