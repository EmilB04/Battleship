export default function BattleActions({ onNewBattle, onQuit }) {
    return (
        <div className="battle-actions">
            <button id="start-game-button" onClick={onNewBattle}>New Battle</button>
            <button className="battle-quit-button" onClick={onQuit}>Quit</button>
        </div>
    );
}
