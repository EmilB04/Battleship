export default function BattleActions({ onNewBattle }) {
    return (
        <div className="battle-actions">
            <button id="start-game-button" onClick={onNewBattle}>New Battle</button>
        </div>
    );
}
