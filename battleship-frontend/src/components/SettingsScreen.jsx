import '../styles/components/startOverlays.css';
import { useState, useEffect } from 'react';

export default function SettingsScreen({ onClose }) {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');
    const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('soundEnabled') !== 'false');
    const [gridSize, setGridSize] = useState(() => localStorage.getItem('gridSize') || '10');
    const [difficulty, setDifficulty] = useState(() => localStorage.getItem('difficulty') || 'medium');
    const [animations, setAnimations] = useState(() => localStorage.getItem('animations') !== 'false');

    useEffect(() => {
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-mode');
            document.documentElement.classList.remove('light-mode');
        } else if (theme === 'light') {
            document.documentElement.classList.add('light-mode');
            document.documentElement.classList.remove('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode', 'light-mode');
        }
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('soundEnabled', soundEnabled);
    }, [soundEnabled]);

    useEffect(() => {
        localStorage.setItem('gridSize', gridSize);
    }, [gridSize]);

    useEffect(() => {
        localStorage.setItem('difficulty', difficulty);
    }, [difficulty]);

    useEffect(() => {
        localStorage.setItem('animations', animations);
        
        if (animations) {
            document.documentElement.classList.remove('no-animations');
        } else {
            document.documentElement.classList.add('no-animations');
        }
    }, [animations]);

    return (
        <div className="settings overlay" onClick={onClose}>
            <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                <section className="settings-screen">
                    <h2>Settings</h2>
                    
                    <div className="settings-group">
                        <h3>Display</h3>
                        
                        <div className="setting-item">
                            <label htmlFor="theme">Theme</label>
                            <select 
                                id="theme" 
                                value={theme} 
                                onChange={(e) => setTheme(e.target.value)}
                            >
                                <option value="system">System</option>
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>

                        <div className="setting-item">
                            <label htmlFor="animations">
                                <input
                                    type="checkbox"
                                    id="animations"
                                    checked={animations}
                                    onChange={(e) => setAnimations(e.target.checked)}
                                />
                                Enable Animations
                            </label>
                        </div>
                    </div>

                    <div className="settings-group">
                        <h3>Audio</h3>
                        
                        <div className="setting-item">
                            <label htmlFor="sound">
                                <input
                                    type="checkbox"
                                    id="sound"
                                    checked={soundEnabled}
                                    onChange={(e) => setSoundEnabled(e.target.checked)}
                                />
                                Enable Sound Effects
                            </label>
                        </div>
                    </div>

                    <div className="settings-group">
                        <h3>Gameplay</h3>
                        
                        <div className="setting-item">
                            <label htmlFor="gridSize">Grid Size</label>
                            <select 
                                id="gridSize" 
                                value={gridSize} 
                                onChange={(e) => setGridSize(e.target.value)}
                            >
                                <option value="8">8x8</option>
                                <option value="10">10x10 (Standard)</option>
                                <option value="12">12x12</option>
                            </select>
                        </div>

                        <div className="setting-item">
                            <label htmlFor="difficulty">AI Difficulty</label>
                            <select 
                                id="difficulty" 
                                value={difficulty} 
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}