import '../styles/components/howToPlayStyle.css';

export default function HowToPlayScreen({ onClose }) {
    return (
        <div className="overlay" onClick={onClose}>
            <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                <section className="how-to-play-screen">
                    <h2>How to Play</h2>
                    <p>Welcome to Battleship! The objective of the game is to sink all of your opponent's ships before they sink yours.</p>
                    <h3>Game Setup</h3>
                    <ol>
                        <li>Each player has a grid where they will place their ships.</li>
                        <li>Ships can be placed either horizontally or vertically on the grid.</li>
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