import './styles/App.css'
import './styles/theme.css';
import StartScreen from './components/StartScreen';
import Footer from './components/Footer';
import { useState, useEffect, useCallback } from 'react';
import GameScreen from './components/GameScreen';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [username, setUsername] = useState('');
  const [devMode, setDevMode] = useState(() => localStorage.getItem('devMode') === 'true');
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

  // Toggle developer mode with Ctrl+Shift+D
  useEffect(() => {
    console.log('Press Ctrl+Shift+D to toggle Developer Mode');
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setDevMode((prev) => {
          const newMode = !prev;
          localStorage.setItem('devMode', newMode.toString());
          console.log(newMode ? '🔧 Developer Mode Enabled' : '🔧 Developer Mode Disabled');
          return newMode;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    const animationsEnabled = localStorage.getItem('animations') !== 'false';

    // Apply theme
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark-mode');
      document.documentElement.classList.remove('light-mode');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark-mode');
    } else {
      // System theme - use media query
      document.documentElement.classList.remove('dark-mode', 'light-mode');

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'system') {
          // Re-check system preference
          document.documentElement.classList.remove('dark-mode', 'light-mode');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // Apply animations setting
    if (!animationsEnabled) {
      document.documentElement.classList.add('no-animations');
    } else {
      document.documentElement.classList.remove('no-animations');
    }
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
