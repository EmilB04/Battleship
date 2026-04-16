import '../styles/components/startOverlays.css';

export default function HowToPlayScreen({ onClose, isClosing = false }) {
    return (
        <div className={`how-to-play overlay ${isClosing ? 'is-closing' : ''}`} onClick={onClose}>
            <div className={`overlay-content ${isClosing ? 'is-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                <section className="how-to-play-screen">
                    <h2>How to Play</h2>
                    <p>Welcome to Battleship! The objective of the game is to sink all of your opponent's ships before they sink yours.</p>
                    <div className="controls-guide" aria-label="Placement controls guide">
                        <div className="control-figure">
                            <div className="control-figure-title">Select a ship</div>
                            <div className="mouse-figure mouse-click" aria-hidden="true">
                                <span className="mouse-button left"></span>
                                <span className="mouse-wheel"></span>
                                <span className="mouse-button right"></span>
                            </div>
                            <div className="control-figure-copy">
                                <strong>Left Click</strong>
                                <span>Select a ship to place it.</span>
                            </div>
                        </div>
                        <div className="control-figure">
                            <div className="control-figure-title">Drag to place</div>
                            <div className="mouse-figure mouse-drag" aria-hidden="true">
                                <span className="mouse-button left active"></span>
                                <span className="mouse-wheel"></span>
                                <span className="mouse-button right"></span>
                                <span className="mouse-drag-arrow">↘</span>
                            </div>
                            <div className="control-figure-copy">
                                <strong>Drag & Drop</strong>
                                <span>Drag a ship onto the board to place it quickly.</span>
                            </div>
                        </div>
                        <div className="control-figure">
                            <div className="control-figure-title">Right click to remove</div>
                            <div className="mouse-figure mouse-right-click" aria-hidden="true">
                                <span className="mouse-button left"></span>
                                <span className="mouse-wheel"></span>
                                <span className="mouse-button right active"></span>
                            </div>
                            <div className="control-figure-copy">
                                <strong>Right Click</strong>
                                <span>Right click a placed ship to remove it.</span>
                            </div>
                        </div>
                    </div>
                    <h3>Game Setup</h3>
                    <ol>
                        <li>Each player has a grid where they will place their ships.</li>
                        <li>Use the rotate control to switch between horizontal and vertical placement.</li>
                        <li>Left click a ship to select it, then place it on the board.</li>
                        <li>Right click a placed ship to remove it if you want to reposition it.</li>
                        <li>Each player has a fleet consisting of different types of ships with varying lengths.</li>
                    </ol>
                    <h3>Gameplay</h3>
                    <ol>
                        <li>Players take turns calling out grid coordinates to attack their opponent's ships.</li>
                        <li>If a ship occupies the called coordinate, it's a "hit"; otherwise, it's a "miss".</li>
                        <li>The game continues until one player has sunk all of the opponent's ships.</li>
                    </ol>
                    <h3>Winning the Game</h3>
                    <p>The first player to sink all of their opponent's ships wins the game!</p>
                </section>
            </div>
        </div>
    );
}