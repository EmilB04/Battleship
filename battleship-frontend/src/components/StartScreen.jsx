import '../styles/components/startScreenStyle.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import HowToPlayScreen from './HowToPlayScreen';
import SettingsScreen from './SettingsScreen';
import Leaderboard from './Leaderboard';
import useGlobalEscape from '../hooks/useGlobalEscape';

const MENU_ANIMATION_MS = 260;

export default function StartScreen({
    StartGame,
    leaderboard,
    leaderboardStatus,
    onDeleteEntry,
    devMode
}) {
    const [showHowToPlay, setShowHowToPlay] = useState(false);
    const [isHowToPlayClosing, setIsHowToPlayClosing] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isSettingsClosing, setIsSettingsClosing] = useState(false);
    const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
    const [isUsernamePromptClosing, setIsUsernamePromptClosing] = useState(false);
    const [username, setUsername] = useState('');
    const closeTimersRef = useRef([]);

    useEffect(() => {
        return () => {
            closeTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
            closeTimersRef.current = [];
        };
    }, []);

    const shouldAnimateMenus = () => {
        const animationsEnabled = localStorage.getItem('animations') !== 'false';
        const animationsClassDisabled = document.documentElement.classList.contains('no-animations');
        return animationsEnabled && !animationsClassDisabled;
    };

    const closeWithAnimation = (setShow, setClosing) => {
        if (!shouldAnimateMenus()) {
            setClosing(false);
            setShow(false);
            return;
        }

        setClosing(true);
        const timerId = window.setTimeout(() => {
            setShow(false);
            setClosing(false);
            closeTimersRef.current = closeTimersRef.current.filter((id) => id !== timerId);
        }, MENU_ANIMATION_MS);
        closeTimersRef.current.push(timerId);
    };

    const handleStartClick = () => {
        setIsUsernamePromptClosing(false);
        setShowUsernamePrompt(true);
    };

    const handleOpenHowToPlay = () => {
        setIsHowToPlayClosing(false);
        setShowHowToPlay(true);
    };

    const handleOpenSettings = () => {
        setIsSettingsClosing(false);
        setShowSettings(true);
    };

    const handleCloseHowToPlay = () => {
        if (!showHowToPlay || isHowToPlayClosing) {
            return;
        }

        closeWithAnimation(setShowHowToPlay, setIsHowToPlayClosing);
    };

    const handleCloseSettings = () => {
        if (!showSettings || isSettingsClosing) {
            return;
        }

        closeWithAnimation(setShowSettings, setIsSettingsClosing);
    };

    const handleCloseUsernamePrompt = () => {
        if (!showUsernamePrompt || isUsernamePromptClosing) {
            return;
        }

        closeWithAnimation(setShowUsernamePrompt, setIsUsernamePromptClosing);
    };

    const handleUsernameSubmit = () => {
        const trimmedUsername = username.trim();
        if (trimmedUsername) {
            setIsUsernamePromptClosing(false);
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

    const handleGlobalEscape = useCallback(() => {
        if (showUsernamePrompt && !isUsernamePromptClosing) {
            handleCloseUsernamePrompt();
            return;
        }

        if (showSettings && !isSettingsClosing) {
            handleCloseSettings();
            return;
        }

        if (showHowToPlay && !isHowToPlayClosing) {
            handleCloseHowToPlay();
        }
    }, [
        showUsernamePrompt,
        isUsernamePromptClosing,
        showSettings,
        isSettingsClosing,
        showHowToPlay,
        isHowToPlayClosing,
        handleCloseUsernamePrompt,
        handleCloseSettings,
        handleCloseHowToPlay
    ]);

    useGlobalEscape(handleGlobalEscape, showUsernamePrompt || showSettings || showHowToPlay);

    return (
        <>
            <section className="start-screen">
                <h1>Battleship</h1>
                <ul className='game-options'>
                    <li>
                        <button className="start-button" onClick={handleStartClick}>Start Game</button>
                    </li>
                    <li>
                        <button className="how-to-play" onClick={handleOpenHowToPlay}>How to Play</button>
                    </li>
                    <li>
                        <button className="settings-button" onClick={handleOpenSettings}>Settings</button>
                    </li>
                </ul>
            </section>

            {showUsernamePrompt && (
                <div className={`modal-overlay ${isUsernamePromptClosing ? 'is-closing' : ''}`} onClick={handleCloseUsernamePrompt}>
                    <div className={`modal-content username-modal ${isUsernamePromptClosing ? 'is-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
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
                                handleCloseUsernamePrompt();
                                setUsername('');
                            }} className="modal-cancel">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <Leaderboard
                entries={leaderboard}
                status={leaderboardStatus}
                onDeleteEntry={onDeleteEntry}
                devMode={devMode}
            />
            {devMode && <div className="dev-mode-indicator">🔧 Developer Mode</div>}
            {showHowToPlay && <HowToPlayScreen isClosing={isHowToPlayClosing} onClose={handleCloseHowToPlay} />}
            {showSettings && <SettingsScreen isClosing={isSettingsClosing} onClose={handleCloseSettings} />}
        </>
    );
}
