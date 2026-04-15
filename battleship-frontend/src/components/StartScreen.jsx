import '../styles/components/startScreenStyle.css';
import { useState } from 'react';
import HowToPlayScreen from './HowToPlayScreen';
import SettingsScreen from './SettingsScreen';
import Leaderboard from './Leaderboard';

export default function StartScreen({ StartGame, leaderboard }) {
    const [showHowToPlay, setShowHowToPlay] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
    const [username, setUsername] = useState('');

    const handleStartClick = () => {
        setShowUsernamePrompt(true);
    };

    const handleUsernameSubmit = () => {
        const trimmedUsername = username.trim();
        if (trimmedUsername) {
            setShowUsernamePrompt(false);
            StartGame(trimmedUsername);
            setUsername('');
        }
    };

    const handleUsernameKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleUsernameSubmit();
        }
    };

    return (
        <>
            <section className="start-screen">
                <h1>Battleship</h1>
                <ul className='game-options'>
                    <li>
                        <button className="start-button" onClick={handleStartClick}>Start Game</button>
                    </li>
                    <li>
                        <button className="how-to-play" onClick={() => setShowHowToPlay(true)}>How to Play</button>
                    </li>
                    <li>
                        <button className="settings-button" onClick={() => setShowSettings(true)}>Settings</button>
                    </li>
                </ul>
            </section>

            {showUsernamePrompt && (
                <div className="modal-overlay">
                    <div className="modal-content username-modal">
                        <h2>Enter Your Username</h2>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyPress={handleUsernameKeyPress}
                            placeholder="Enter username"
                            autoFocus
                            maxLength={20}
                        />
                        <div className="modal-buttons">
                            <button onClick={handleUsernameSubmit} className="modal-submit">Start Battle</button>
                            <button onClick={() => {
                                setShowUsernamePrompt(false);
                                setUsername('');
                            }} className="modal-cancel">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <Leaderboard entries={leaderboard} />
            {showHowToPlay && <HowToPlayScreen onClose={() => setShowHowToPlay(false)} />}
            {showSettings && <SettingsScreen onClose={() => setShowSettings(false)} />}
        </>
    );
}
