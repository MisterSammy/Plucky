import { fretMidX, stringY } from '@/lib/music';
import type { ChordDiagram } from '@/types';

interface ChordDiagramOverlayProps {
    diagram: ChordDiagram;
    nutX: number;
    scaleLength: number;
    topPadding: number;
    stringSpacing: number;
}

export default function ChordDiagramOverlay({
    diagram,
    nutX,
    scaleLength,
    topPadding,
    stringSpacing,
}: ChordDiagramOverlayProps) {
    return (
        <g>
            {/* Muted strings: X above nut */}
            {diagram.mutedStrings.map((str) => {
                const cx = nutX - 20;
                const cy = stringY(str, topPadding, stringSpacing);
                return (
                    <text
                        key={`muted-${str}`}
                        x={cx - 14}
                        y={cy + 4}
                        textAnchor="middle"
                        fill="#EF4444"
                        fontSize={11}
                        fontWeight="bold"
                        fontFamily="system-ui"
                        opacity={0.8}
                    >
                        X
                    </text>
                );
            })}

            {/* Open strings: O above nut */}
            {diagram.openStrings.map((str) => {
                const cx = nutX - 20;
                const cy = stringY(str, topPadding, stringSpacing);
                return (
                    <circle
                        key={`open-${str}`}
                        cx={cx - 14}
                        cy={cy}
                        r={5}
                        fill="none"
                        stroke="#22C55E"
                        strokeWidth={1.5}
                        opacity={0.8}
                    />
                );
            })}

            {/* Barre lines */}
            {diagram.barres.map((barre, i) => {
                const cx = fretMidX(barre.fret, nutX, scaleLength);
                const y1 = stringY(barre.fromString, topPadding, stringSpacing);
                const y2 = stringY(barre.toString, topPadding, stringSpacing);
                const barreHeight = Math.abs(y2 - y1);

                return (
                    <rect
                        key={`barre-${i}`}
                        x={cx - 6}
                        y={Math.min(y1, y2) - 4}
                        width={12}
                        height={barreHeight + 8}
                        rx={6}
                        fill="white"
                        opacity={0.15}
                        pointerEvents="none"
                    />
                );
            })}
        </g>
    );
}
