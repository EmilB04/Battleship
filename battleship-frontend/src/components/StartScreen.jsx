import '../styles/components/startScreenStyle.css';
import { useState } from 'react';
import HowToPlayScreen from './HowToPlayScreen';
import SettingsScreen from './SettingsScreen';


export default function StartScreen({ StartGame }) {
    const [showHowToPlay, setShowHowToPlay] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    return (
        <>
            <section className="start-screen">
                <h1>Battleship</h1>
                <ul className='game-options'>
                    <li>
                        <button className="start-button" onClick={StartGame}>Start Game</button>
                    </li>
                    <li>
                        <button className="how-to-play" onClick={() => setShowHowToPlay(true)}>How to Play</button>
                    </li>
                    <li>
                        <button className="settings-button" onClick={() => setShowSettings(true)}>Settings</button>
                    </li>
                </ul>
            </section>
            {showHowToPlay && <HowToPlayScreen onClose={() => setShowHowToPlay(false)} />}
            {showSettings && <SettingsScreen onClose={() => setShowSettings(false)} />}
        </>
    );
}
