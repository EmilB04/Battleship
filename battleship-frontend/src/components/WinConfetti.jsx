import { useEffect, useMemo, useState } from 'react';

const CONFETTI_COLORS = ['#ffb703', '#00ff41', '#e63946', '#3a86ff', '#ffffff'];
const PIECE_COUNT = 42;

export default function WinConfetti() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = window.setTimeout(() => setVisible(false), 7600);
        return () => window.clearTimeout(timer);
    }, []);

    const pieces = useMemo(() => {
        return Array.from({ length: PIECE_COUNT }, (_, index) => {
            const left = Math.random() * 100;
            const drift = (Math.random() - 0.5) * 26;
            const delay = Math.random() * 0.8;
            const duration = 4.8 + Math.random() * 2.8;
            const size = 6 + Math.random() * 8;
            const rotate = Math.random() * 360;
            const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];

            return {
                id: `piece-${index}`,
                style: {
                    left: `${left}%`,
                    width: `${size}px`,
                    height: `${size * 0.55}px`,
                    backgroundColor: color,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                    transform: `translateX(${drift}px) rotate(${rotate}deg)`
                }
            };
        });
    }, []);

    if (!visible) {
        return null;
    }

    return (
        <div className="win-confetti" aria-hidden="true">
            {pieces.map((piece) => (
                <span key={piece.id} className="confetti-piece" style={piece.style} />
            ))}
        </div>
    );
}