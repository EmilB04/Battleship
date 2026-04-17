import './styles/App.css'
import './styles/theme.css';
import StartScreen from './components/StartScreen';
import Footer from './components/Footer';
import { useState, useEffect, useCallback } from 'react';
import GameScreen from './components/GameScreen';
import { initializeTheme, setupSystemThemeListener } from './utils/themeManager';
import { initializeDevMode, setupDevModeListener } from './utils/devMode';
import {
  createLeaderboardEntryRemote,
  deleteLeaderboardEntryRemote,
  fetchLeaderboardEntries,
} from './utils/leaderboardApi';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [username, setUsername] = useState('');
  const [gameMode, setGameMode] = useState('singleplayer');
  const [multiplayerSession, setMultiplayerSession] = useState(null);
  const [devMode, setDevMode] = useState(() => initializeDevMode());
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardStatus, setLeaderboardStatus] = useState({ text: '', level: '' });

  const setStatusFromSource = useCallback((source) => {
    if (source === 'localhost') {
      setLeaderboardStatus({
        text: 'D1 is unavailable. Using localhost leaderboard API fallback.',
        level: 'warning'
      });
      return;
    }

    if (source === 'unavailable') {
      setLeaderboardStatus({
        text: 'Leaderboard service is unavailable right now. Scores will still be tracked locally during this session.',
        level: 'warning'
      });
      return;
    }

    setLeaderboardStatus({ text: '', level: '' });
  }, []);

  const persistLeaderboard = useCallback((entry) => {
    createLeaderboardEntryRemote(entry)
      .then(async ({ source }) => {
        setStatusFromSource(source);
        const { entries } = await fetchLeaderboardEntries();
        setLeaderboard(entries);
      })
      .catch((error) => {
        console.error('Failed to persist leaderboard entry:', error);
        setLeaderboardStatus({
          text: 'Leaderboard service is unavailable. Could not save result to D1 or localhost.',
          level: 'error'
        });
      });
  }, [setStatusFromSource]);

  const deleteLeaderboardEntry = useCallback((entryId) => {
    deleteLeaderboardEntryRemote(entryId)
      .then(({ source }) => {
        setStatusFromSource(source);
        setLeaderboard((prevLeaderboard) => prevLeaderboard.filter((entry) => entry.id !== entryId));
      })
      .catch((error) => {
        console.error('Failed to delete leaderboard entry:', error);
        setLeaderboardStatus({
          text: 'Leaderboard service is unavailable. Could not delete entry from D1 or localhost.',
          level: 'error'
        });
      });
  }, [setStatusFromSource]);

  // Setup dev mode listener
  useEffect(() => {
    const cleanup = setupDevModeListener((newMode) => {
      setDevMode(newMode);
    });

    return cleanup;
  }, []);

  // Load leaderboard from D1-backed API on startup.
  useEffect(() => {
    const loadLeaderboard = async () => {
      const { entries, source } = await fetchLeaderboardEntries();
      setStatusFromSource(source);
      setLeaderboard(entries);
    };

    loadLeaderboard();
  }, [setStatusFromSource]);

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();

    // Setup system theme listener
    const cleanup = setupSystemThemeListener();

    return cleanup;
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('game-active', gameStarted);
    document.body.classList.toggle('game-active', gameStarted);

    return () => {
      document.documentElement.classList.remove('game-active');
      document.body.classList.remove('game-active');
    };
  }, [gameStarted]);

  return (
    <div className={`app-shell ${gameStarted ? 'game-active' : ''}`}>
      {gameStarted ? (
        <GameScreen GoBack={() => {
          setGameStarted(false);
          setUsername('');
          setGameMode('singleplayer');
          setMultiplayerSession(null);
        }} persistLeaderboard={persistLeaderboard} username={username} gameMode={gameMode} multiplayerSession={multiplayerSession} />
      ) : (
        <StartScreen StartGame={(inputUsername, options = {}) => {
          setUsername(inputUsername);
          setGameMode(options.mode || 'singleplayer');
          setMultiplayerSession(options.session || null);
          setGameStarted(true);
        }}
          leaderboard={leaderboard}
          leaderboardStatus={leaderboardStatus}
          onDeleteEntry={deleteLeaderboardEntry}
          devMode={devMode}
        />
      )}
      {!gameStarted && <Footer />}
    </div>
  )
}

export default App
