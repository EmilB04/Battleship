import './styles/App.css'
import './styles/theme.css';
import StartScreen from './components/StartScreen';
import Footer from './components/Footer';
import { useState, useEffect, useCallback } from 'react';
import GameScreen from './components/GameScreen';
import { initializeTheme, setupSystemThemeListener } from './utils/themeManager';
import { initializeDevMode, setupDevModeListener } from './utils/devMode';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [username, setUsername] = useState('');
  const [devMode, setDevMode] = useState(() => initializeDevMode());
  const [leaderboard, setLeaderboard] = useState(() => {
    try {
      const stored = localStorage.getItem('battleshipLeaderboard');
      if (!stored) {
        return [];
      }
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const persistLeaderboard = useCallback((entries) => {
    setLeaderboard(entries);
    localStorage.setItem('battleshipLeaderboard', JSON.stringify(entries));
  }, []);

  const deleteLeaderboardEntry = useCallback((entryId) => {
    setLeaderboard((prevLeaderboard) => {
      const updated = prevLeaderboard.filter((entry) => entry.id !== entryId);
      persistLeaderboard(updated);
      return updated;
    });
  }, [persistLeaderboard]);

  // Setup dev mode listener
  useEffect(() => {
    const cleanup = setupDevModeListener((newMode) => {
      setDevMode(newMode);
    });

    return cleanup;
  }, []);

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
        }} leaderboard={leaderboard} onDeleteEntry={deleteLeaderboardEntry} devMode={devMode} />
      )}
      <Footer />
    </>
  )
}

export default App
