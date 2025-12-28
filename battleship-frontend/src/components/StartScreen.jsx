import '../styles/components/startScreenStyle.css';

export default function StartScreen({ StartGame }) {

    return (
        <section className="start-screen">
            <h1>Battleship</h1>
            <ul className='game-options'>
                <li>
                    <button className="start-button" onClick={StartGame}>Start Game</button>
                </li>
                <li>
                    <button className="how-to-play">How to Play</button>
                </li>
                <li>
                    <button className="settings-button">Settings</button>
                </li>
            </ul>
        </section>
    );
}
