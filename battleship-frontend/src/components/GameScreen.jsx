
import { useState } from 'react';
import Board from './Board';
import Ships from './Ships';

export default function GameScreen() {
    const [setup, setSetup] = useState(true);
    return (
        <section className="game-screen">
            {setup ? 
                <>
                    <h2>Place Your Ships</h2>
                    <p>Arrange your fleet on the board before starting the game.</p>
                    <Ships />
                    <Board />
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