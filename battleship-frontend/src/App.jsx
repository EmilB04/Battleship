import './styles/App.css'
import './styles/theme.css';
import StartScreen from './components/StartScreen';
import Footer from './components/Footer';
import { useState, useEffect } from 'react';
import GameScreen from './components/GameScreen';

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';

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
  }, []);

  return (
    <>
      {gameStarted ? <GameScreen /> : <StartScreen StartGame={() => setGameStarted(true)} />}
      <Footer />
    </>
  )
}

export default App
