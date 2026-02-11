import { memo } from 'react';
import { fretMidX, stringY, DEGREE_COLORS } from '@/lib/music';
import type { FretPosition } from '@/types';

interface NoteOverlayProps {
  positions: FretPosition[];
  nutX: number;
  scaleLength: number;
  topPadding: number;
  stringSpacing: number;
  onNoteClick: (position: FretPosition) => void;
  activeNoteIndex?: number | null;
  highlightRoot?: boolean;
  showAllNotes?: boolean;
  allPositions?: Omit<FretPosition, 'interval' | 'degree' | 'isRoot'>[];
  hitDegrees?: Set<number>;
  showFingers?: boolean;
}

export default memo(function NoteOverlay({
  positions,
  nutX,
  scaleLength,
  topPadding,
  stringSpacing,
  onNoteClick,
  activeNoteIndex,
  highlightRoot = true,
  showAllNotes = false,
  allPositions = [],
  hitDegrees,
  showFingers = false,
}: NoteOverlayProps) {
  return (
    <g>
      {/* Non-scale notes (shown dimly when showAllNotes is true) */}
      {showAllNotes &&
        allPositions
          .filter(
            (pos) =>
              !positions.some((sp) => sp.string === pos.string && sp.fret === pos.fret)
          )
          .map((pos) => {
            const cx = fretMidX(pos.fret, nutX, scaleLength);
            const cy = stringY(pos.string, topPadding, stringSpacing);
            return (
              <g key={`all-${pos.string}-${pos.fret}`}>
                <circle cx={cx} cy={cy} r={8} fill="#6B7280" opacity={0.2} />
                <text
                  x={cx}
                  y={cy + 3}
                  textAnchor="middle"
                  fill="#9CA3AF"
                  fontSize={7}
                  fontFamily="system-ui"
                  opacity={0.5}
                >
                  {pos.note}
                </text>
              </g>
            );
          })}

      {/* Scale notes */}
      {positions.map((pos) => {
        const cx = fretMidX(pos.fret, nutX, scaleLength);
        const cy = stringY(pos.string, topPadding, stringSpacing);
        const colorIdx = ((pos.degree - 1) % DEGREE_COLORS.length);
        const color = DEGREE_COLORS[colorIdx];
        const isRoot = pos.isRoot && highlightRoot;
        const r = isRoot ? 16 : 14;
        const isActive = activeNoteIndex !== null && activeNoteIndex !== undefined && pos.degree === activeNoteIndex + 1;
        const isHit = hitDegrees?.has(pos.degree) ?? false;

        return (
          <g
            key={`note-${pos.string}-${pos.fret}`}
            onClick={() => onNoteClick(pos)}
            style={{ cursor: 'pointer' }}
            role="button"
            aria-label={`${pos.note}, fret ${pos.fret}, string ${pos.string + 1}`}
          >
            {isHit && (
              <circle
                cx={cx}
                cy={cy}
                r={r + 5}
                fill="none"
                stroke="#22C55E"
                strokeWidth={2.5}
                opacity={0.85}
              />
            )}
            {isActive && (
              <circle
                cx={cx}
                cy={cy}
                r={r + 6}
                fill="none"
                stroke={color}
                strokeWidth={2}
                opacity={0.6}
                className="animate-ping"
              />
            )}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill={color}
              opacity={0.9}
              stroke={isRoot ? '#fff' : 'none'}
              strokeWidth={isRoot ? 2 : 0}
            />
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              fill="white"
              fontSize={10}
              fontWeight={isRoot ? 'bold' : 'normal'}
              fontFamily="system-ui"
              pointerEvents="none"
            >
              {showFingers && pos.finger ? pos.finger : (pos.displayNote ?? pos.note)}
            </text>
          </g>
        );
      })}
    </g>
  );
})
