import '../styles/components/startOverlays.css';

export default function SettingsScreen({ onClose }) {
    return (
        <div className="settings overlay" onClick={onClose}>
            <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                <section className="settings-screen">
                    <h2>Settings</h2>
                    <p>Settings options will be available here soon!</p>
                </section>
            </div>
        </div>
    );
}