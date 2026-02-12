import { useEffect, useState } from 'react';

const PARTICLE_COLORS = ['#ffd700', '#ff6b00', '#ff4500', '#ffaa00', '#b9f2ff'];
const PARTICLE_COUNT = 30;

function randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export default function CelebrationOverlay() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 10000);
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div className="celebration-overlay">
            {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
                <span
                    key={i}
                    className="celebration-particle"
                    style={{
                        left: `${randomBetween(5, 95)}%`,
                        bottom: `${randomBetween(-10, 20)}%`,
                        width: `${randomBetween(3, 6)}px`,
                        height: `${randomBetween(3, 6)}px`,
                        backgroundColor: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
                        animationDuration: `${randomBetween(2, 5)}s`,
                        animationDelay: `${randomBetween(0, 3)}s`,
                    }}
                />
            ))}
        </div>
    );
}
