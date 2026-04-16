export default function BattleMarkerLegend() {
    return (
        <section className="battle-marker-legend" aria-label="Hit marker legend">
            <span className="battle-marker-legend-item">
                <span className="battle-marker-swatch is-miss" aria-hidden="true">•</span>
                <span className="battle-marker-text">Miss</span>
            </span>
            <span className="battle-marker-legend-item">
                <span className="battle-marker-swatch is-hit" aria-hidden="true">✕</span>
                <span className="battle-marker-text">Hit</span>
            </span>
            <span className="battle-marker-legend-item">
                <span className="battle-marker-swatch is-sunk" aria-hidden="true">✕</span>
                <span className="battle-marker-text">Sunk</span>
            </span>
        </section>
    );
}
