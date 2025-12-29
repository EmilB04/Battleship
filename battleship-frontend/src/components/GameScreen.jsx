
import { useState } from 'react';
import Board from './Board';
import Ships from './Ships';

export default function GameScreen() {
    const [setup, setSetup] = useState(true);
    const [selectedShip, setSelectedShip] = useState(null);
    const [orientation, setOrientation] = useState('horizontal');
    const [placedShips, setPlacedShips] = useState([]);
    
    return (
        <section className="game-screen">
            {setup ? 
                <>
                    <h2>Place Your Ships</h2>
                    <p>Drag ships to the board or click to place. Double-click or right-click placed ships to remove them.</p>
                    <Ships 
                        selectedShip={selectedShip}
                        setSelectedShip={setSelectedShip}
                        orientation={orientation}
                        setOrientation={setOrientation}
                        placedShips={placedShips}
                    />
                    <Board 
                        selectedShip={selectedShip}
                        setSelectedShip={setSelectedShip}
                        orientation={orientation}
                        placedShips={placedShips}
                        setPlacedShips={setPlacedShips}
                    />
                    <button className="start-button" onClick={() => setSetup(false)}>Finish Setup</button>
                </> 
                : 
                <>
                    <h2>Game In Progress</h2>
                    <p>The game has started! Take turns with your opponent to sink their ships.</p>
                </>
            }
        </section>
    );
}