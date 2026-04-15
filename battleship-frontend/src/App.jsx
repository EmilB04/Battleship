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
  normalizeLeaderboardEntries,
} from './utils/leaderboardApi';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [username, setUsername] = useState('');
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

    setLeaderboardStatus({ text: '', level: '' });
  }, []);

  const persistLeaderboard = useCallback((entry) => {
    createLeaderboardEntryRemote(entry)
      .then(({ entry: savedEntry, source }) => {
        setStatusFromSource(source);
        setLeaderboard((prevEntries) => {
          const withoutDuplicate = prevEntries.filter((item) => item.id !== savedEntry.id);
          return normalizeLeaderboardEntries([savedEntry, ...withoutDuplicate]);
        });
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
      try {
        const { entries, source } = await fetchLeaderboardEntries();
        setStatusFromSource(source);
        setLeaderboard(entries);
      } catch (error) {
        console.error('Failed to load leaderboard entries:', error);
        setLeaderboardStatus({
          text: 'Leaderboard service is unavailable. Could not load from D1 or localhost.',
          level: 'error'
        });
        setLeaderboard([]);
      }
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

  return (
    <>
      {gameStarted ? (
        <GameScreen GoBack={() => {
          setGameStarted(false);
          setUsername('');
        }} persistLeaderboard={persistLeaderboard} username={username} />
      ) : (
        <StartScreen StartGame={(inputUsername) => {
          setUsername(inputUsername);
          setGameStarted(true);
        }}
          leaderboard={leaderboard}
          leaderboardStatus={leaderboardStatus}
          onDeleteEntry={deleteLeaderboardEntry}
          devMode={devMode}
        />
      )}
      <Footer />
    </>
  )
}

export default App
