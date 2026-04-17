import '../styles/components/startScreenStyle.css';
import { useEffect, useRef, useState } from 'react';
import { FaUser, FaUsers } from 'react-icons/fa';
import HowToPlayScreen from './HowToPlayScreen';
import SettingsScreen from './SettingsScreen';
import Leaderboard from './Leaderboard';
import useGlobalEscape from '../hooks/useGlobalEscape';
import { createMultiplayerRoom, joinMultiplayerRoom, resumeMultiplayerSession } from '../utils/multiplayerApi';
import { clearMultiplayerSession, loadMultiplayerSession, saveMultiplayerSession } from '../utils/multiplayerSession';

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
    const [showMultiplayerPrompt, setShowMultiplayerPrompt] = useState(false);
    const [isMultiplayerPromptClosing, setIsMultiplayerPromptClosing] = useState(false);
    const [multiplayerMode, setMultiplayerMode] = useState('create');
    const [multiplayerUsername, setMultiplayerUsername] = useState('');
    const [multiplayerPin, setMultiplayerPin] = useState('');
    const [multiplayerBoardSize, setMultiplayerBoardSize] = useState('10');
    const [multiplayerError, setMultiplayerError] = useState('');
    const [multiplayerLoading, setMultiplayerLoading] = useState(false);
    const [savedMultiplayerSession, setSavedMultiplayerSession] = useState(() => loadMultiplayerSession());
    const [savedSessionStatus, setSavedSessionStatus] = useState(() => loadMultiplayerSession()?.status || '');
    const [resumeLoading, setResumeLoading] = useState(false);
    const closeTimersRef = useRef([]);

    useEffect(() => {
        const cachedSession = loadMultiplayerSession();
        if (!cachedSession) {
            setSavedMultiplayerSession(null);
            setSavedSessionStatus('');
            return;
        }

        setSavedMultiplayerSession(cachedSession);
        setSavedSessionStatus(cachedSession.status || '');

        let isCancelled = false;

        const syncSessionStatus = async () => {
            try {
                const result = await resumeMultiplayerSession({
                    pin: cachedSession.pin,
                    playerId: cachedSession.playerId
                });

                if (isCancelled) {
                    return;
                }

                const nextStatus = result?.room?.status || '';
                saveMultiplayerSession({
                    pin: cachedSession.pin,
                    playerId: cachedSession.playerId,
                    username: cachedSession.username,
                    status: nextStatus
                });
                setSavedMultiplayerSession(loadMultiplayerSession());
                setSavedSessionStatus(nextStatus);
            } catch {
                if (isCancelled) {
                    return;
                }

                clearMultiplayerSession();
                setSavedMultiplayerSession(null);
                setSavedSessionStatus('');
            }
        };

        syncSessionStatus();

        return () => {
            isCancelled = true;
        };
    }, []);

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

    const handleOpenMultiplayerPrompt = () => {
        setIsMultiplayerPromptClosing(false);
        setMultiplayerError('');
        setShowMultiplayerPrompt(true);
    };

    const handleCloseMultiplayerPrompt = () => {
        if (!showMultiplayerPrompt || isMultiplayerPromptClosing || multiplayerLoading) {
            return;
        }

        closeWithAnimation(setShowMultiplayerPrompt, setIsMultiplayerPromptClosing);
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

    const handleGlobalEscape = () => {
        if (showMultiplayerPrompt && !isMultiplayerPromptClosing) {
            handleCloseMultiplayerPrompt();
            return;
        }

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
    };

    useGlobalEscape(handleGlobalEscape, showUsernamePrompt || showMultiplayerPrompt || showSettings || showHowToPlay);

    const handleMultiplayerSubmit = async () => {
        const trimmedUsername = multiplayerUsername.trim();
        if (!trimmedUsername) {
            setMultiplayerError('Please enter a username.');
            return;
        }

        setMultiplayerLoading(true);
        setMultiplayerError('');

        try {
            if (multiplayerMode === 'create') {
                const result = await createMultiplayerRoom({
                    username: trimmedUsername,
                    boardSize: Number(multiplayerBoardSize)
                });

                saveMultiplayerSession({
                    pin: result.room.pin,
                    playerId: result.playerId,
                    username: trimmedUsername,
                    status: result.room?.status || ''
                });
                setSavedMultiplayerSession(loadMultiplayerSession());
                setSavedSessionStatus(result.room?.status || '');

                setShowMultiplayerPrompt(false);
                StartGame(trimmedUsername, {
                    mode: 'multiplayer',
                    session: {
                        pin: result.room.pin,
                        playerId: result.playerId,
                        room: result.room
                    }
                });
            } else {
                const normalizedPin = multiplayerPin.trim();
                if (!/^\d{6}$/.test(normalizedPin)) {
                    throw new Error('PIN must be exactly 6 digits.');
                }

                const result = await joinMultiplayerRoom({
                    username: trimmedUsername,
                    pin: normalizedPin
                });

                saveMultiplayerSession({
                    pin: result.room.pin,
                    playerId: result.playerId,
                    username: trimmedUsername,
                    status: result.room?.status || ''
                });
                setSavedMultiplayerSession(loadMultiplayerSession());
                setSavedSessionStatus(result.room?.status || '');

                setShowMultiplayerPrompt(false);
                StartGame(trimmedUsername, {
                    mode: 'multiplayer',
                    session: {
                        pin: result.room.pin,
                        playerId: result.playerId,
                        room: result.room
                    }
                });
            }
        } catch (error) {
            setMultiplayerError(String(error?.message || error));
        } finally {
            setMultiplayerLoading(false);
        }
    };

    const handleMultiplayerKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleMultiplayerSubmit();
        }
    };

    const handleResumeMultiplayer = async () => {
        const session = loadMultiplayerSession();
        if (!session) {
            clearMultiplayerSession();
            setSavedMultiplayerSession(null);
            setSavedSessionStatus('');
            return;
        }

        setResumeLoading(true);
        try {
            const result = await resumeMultiplayerSession({ pin: session.pin, playerId: session.playerId });
            saveMultiplayerSession({
                pin: session.pin,
                playerId: session.playerId,
                username: session.username,
                status: result.room?.status || ''
            });
            setSavedMultiplayerSession(loadMultiplayerSession());
            setSavedSessionStatus(result.room?.status || '');
            StartGame(session.username, {
                mode: 'multiplayer',
                session: {
                    pin: session.pin,
                    playerId: session.playerId,
                    room: result.room
                }
            });
        } catch {
            clearMultiplayerSession();
            setSavedMultiplayerSession(null);
            setSavedSessionStatus('');
        } finally {
            setResumeLoading(false);
        }
    };

    return (
        <>
            <section className="start-screen">
                <h1>Battleship</h1>
                <ul className='game-options'>
                    <li>
                        <button className="start-button" onClick={handleStartClick}>
                            <FaUser className="start-mode-icon" aria-hidden="true" focusable="false" />
                            <span>Singleplayer</span>
                        </button>
                    </li>
                    <li>
                        <button className="start-button" onClick={handleOpenMultiplayerPrompt}>
                            <FaUsers className="start-mode-icon" aria-hidden="true" focusable="false" />
                            <span>Multiplayer</span>
                        </button>
                    </li>
                    {savedMultiplayerSession && (
                        <li>
                            <button className="start-button" onClick={handleResumeMultiplayer} disabled={resumeLoading}>
                                <FaUsers className="start-mode-icon" aria-hidden="true" focusable="false" />
                                <span>{resumeLoading ? 'Resuming...' : `Resume Room ${savedMultiplayerSession.pin}`}</span>
                                {savedSessionStatus === 'playing' && (
                                    <span className="resume-live-chip" aria-label="Live ongoing game">
                                        <span className="resume-live-dot" aria-hidden="true"></span>
                                        <span>LIVE</span>
                                    </span>
                                )}
                            </button>
                        </li>
                    )}
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

            {showMultiplayerPrompt && (
                <div className={`modal-overlay ${isMultiplayerPromptClosing ? 'is-closing' : ''}`} onClick={handleCloseMultiplayerPrompt}>
                    <div className={`modal-content username-modal multiplayer-modal ${isMultiplayerPromptClosing ? 'is-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
                        <h2>Multiplayer Lobby</h2>

                        <div className="multiplayer-mode-row" role="group" aria-label="Choose multiplayer mode">
                            <button
                                type="button"
                                className={`multiplayer-mode-button ${multiplayerMode === 'create' ? 'is-active' : ''}`}
                                onClick={() => {
                                    setMultiplayerMode('create');
                                    setMultiplayerError('');
                                }}
                            >
                                Create Room
                            </button>
                            <button
                                type="button"
                                className={`multiplayer-mode-button ${multiplayerMode === 'join' ? 'is-active' : ''}`}
                                onClick={() => {
                                    setMultiplayerMode('join');
                                    setMultiplayerError('');
                                }}
                            >
                                Join Room
                            </button>
                        </div>

                        <input
                            type="text"
                            value={multiplayerUsername}
                            onChange={(event) => setMultiplayerUsername(event.target.value)}
                            onKeyDown={handleMultiplayerKeyPress}
                            placeholder="Your username"
                            autoFocus
                            maxLength={20}
                            disabled={multiplayerLoading}
                        />

                        {multiplayerMode === 'join' ? (
                            <input
                                type="text"
                                value={multiplayerPin}
                                onChange={(event) => setMultiplayerPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
                                onKeyDown={handleMultiplayerKeyPress}
                                placeholder="6-digit room PIN"
                                inputMode="numeric"
                                maxLength={6}
                                disabled={multiplayerLoading}
                            />
                        ) : (
                            <label className="multiplayer-board-size" htmlFor="multiplayer-board-size">
                                Board size
                                <select
                                    id="multiplayer-board-size"
                                    value={multiplayerBoardSize}
                                    onChange={(event) => setMultiplayerBoardSize(event.target.value)}
                                    disabled={multiplayerLoading}
                                >
                                    <option value="8">8x8</option>
                                    <option value="10">10x10 (Standard)</option>
                                    <option value="12">12x12</option>
                                </select>
                            </label>
                        )}

                        {multiplayerError && <p className="multiplayer-error">{multiplayerError}</p>}

                        <div className="modal-buttons">
                            <button onClick={handleMultiplayerSubmit} className="modal-submit" disabled={multiplayerLoading}>
                                {multiplayerLoading ? 'Connecting...' : (multiplayerMode === 'create' ? 'Create & Start' : 'Join & Start')}
                            </button>
                            <button onClick={handleCloseMultiplayerPrompt} className="modal-cancel" disabled={multiplayerLoading}>Cancel</button>
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
