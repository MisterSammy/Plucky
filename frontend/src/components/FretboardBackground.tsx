import { fretX, stringY } from '@/lib/music';
import type { PositionRange } from '@/types';

interface FretboardBackgroundProps {
  width: number;
  height: number;
  nutX: number;
  scaleLength: number;
  topPadding: number;
  stringSpacing: number;
  tuningNotes: string[];
  numFrets: number;
  activePositionRange?: PositionRange | null;
}

const FRET_MARKERS_SINGLE = [3, 5, 7, 9, 15, 17, 19, 21];
const FRET_MARKERS_DOUBLE = [12];

export default function FretboardBackground({
  height,
  nutX,
  scaleLength,
  topPadding,
  stringSpacing,
  tuningNotes,
  numFrets,
  activePositionRange,
}: FretboardBackgroundProps) {
  const totalStringHeight = stringSpacing * 5;
  const fretboardTop = topPadding;
  const fretboardBottom = topPadding + totalStringHeight;
  const fretboardMidY = (fretboardTop + fretboardBottom) / 2;

  return (
    <g>
      {/* Fretboard wood background */}
      <rect
        x={nutX - 4}
        y={fretboardTop - 10}
        width={scaleLength + 8}
        height={totalStringHeight + 20}
        rx={2}
        fill="currentColor"
        className="text-amber-900/20 dark:text-amber-800/15"
      />

      {/* Fret markers */}
      {FRET_MARKERS_SINGLE.map((fret) => {
        if (fret > numFrets) return null;
        const prevFretXPos = fret === 0 ? nutX : fretX(fret - 1, nutX, scaleLength);
        const currentFretXPos = fretX(fret, nutX, scaleLength);
        const midX = (prevFretXPos + currentFretXPos) / 2;
        return (
          <circle
            key={`marker-${fret}`}
            cx={midX}
            cy={fretboardMidY}
            r={6}
            className="fill-gray-300 dark:fill-gray-600"
            opacity={0.5}
          />
        );
      })}
      {FRET_MARKERS_DOUBLE.map((fret) => {
        if (fret > numFrets) return null;
        const prevFretXPos = fretX(fret - 1, nutX, scaleLength);
        const currentFretXPos = fretX(fret, nutX, scaleLength);
        const midX = (prevFretXPos + currentFretXPos) / 2;
        return (
          <g key={`marker-double-${fret}`}>
            <circle
              cx={midX}
              cy={fretboardMidY - stringSpacing * 1.2}
              r={6}
              className="fill-gray-300 dark:fill-gray-600"
              opacity={0.5}
            />
            <circle
              cx={midX}
              cy={fretboardMidY + stringSpacing * 1.2}
              r={6}
              className="fill-gray-300 dark:fill-gray-600"
              opacity={0.5}
            />
          </g>
        );
      })}

      {/* Nut */}
      <rect
        x={nutX - 2}
        y={fretboardTop - 5}
        width={4}
        height={totalStringHeight + 10}
        className="fill-gray-800 dark:fill-gray-200"
      />

      {/* Frets */}
      {Array.from({ length: numFrets }, (_, i) => i + 1).map((fret) => {
        const x = fretX(fret, nutX, scaleLength);
        return (
          <line
            key={`fret-${fret}`}
            x1={x}
            y1={fretboardTop - 3}
            x2={x}
            y2={fretboardBottom + 3}
            stroke="#9CA3AF"
            strokeWidth={2}
            opacity={0.6}
          />
        );
      })}

      {/* Strings */}
      {Array.from({ length: 6 }, (_, i) => {
        const y = stringY(i, topPadding, stringSpacing);
        const thickness = 1 + i * 0.4;
        return (
          <line
            key={`string-${i}`}
            x1={nutX - 2}
            y1={y}
            x2={nutX + scaleLength}
            y2={y}
            stroke="#B0B0B0"
            strokeWidth={thickness}
            opacity={0.7}
          />
        );
      })}

      {/* String labels (open note names) */}
      {tuningNotes.map((note, i) => {
        const y = stringY(i, topPadding, stringSpacing);
        const label = note.replace(/\d+$/, '');
        return (
          <text
            key={`label-${i}`}
            x={nutX - 20}
            y={y + 4}
            textAnchor="middle"
            className="fill-gray-500 dark:fill-gray-400"
            fontSize={10}
            fontFamily="system-ui"
          >
            {label}
          </text>
        );
      })}

      {/* Position highlight */}
      {activePositionRange && (() => {
        const leftX = activePositionRange.startFret === 0
          ? nutX - 4
          : fretX(activePositionRange.startFret - 1, nutX, scaleLength);
        const rightX = fretX(activePositionRange.endFret, nutX, scaleLength);
        return (
          <rect
            x={leftX}
            y={fretboardTop - 12}
            width={rightX - leftX}
            height={totalStringHeight + 24}
            rx={4}
            fill="rgba(59, 130, 246, 0.08)"
            stroke="rgba(59, 130, 246, 0.4)"
            strokeWidth={1.5}
            strokeDasharray="6 3"
          />
        );
      })()}

      {/* Fret numbers */}
      {[1, 3, 5, 7, 9, 12, 15, 17, 19, 21].map((fret) => {
        if (fret > numFrets) return null;
        const prevX = fret === 1 ? nutX : fretX(fret - 1, nutX, scaleLength);
        const curX = fretX(fret, nutX, scaleLength);
        const midX = (prevX + curX) / 2;
        return (
          <text
            key={`fretnum-${fret}`}
            x={midX}
            y={height - 3}
            textAnchor="middle"
            className="fill-gray-400 dark:fill-gray-500"
            fontSize={9}
            fontFamily="system-ui"
          >
            {fret}
          </text>
        );
      })}
    </g>
  );
}
