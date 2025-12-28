import './styles/App.css'
import './styles/theme.css';
import StartScreen from './components/StartScreen';
import Footer from './components/Footer';
import { useState } from 'react';
import GameScreen from './components/GameScreen';

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <>
      {gameStarted ? <GameScreen /> : <StartScreen StartGame={() => setGameStarted(true)} />}
      <Footer />
    </>
  )
}

export default App
