import { fretMidX, stringY } from '@/lib/music';
import type { FretPosition, NoteWithOctave } from '@/types';

interface PitchIndicatorProps {
  detectedNoteWithOctave: NoteWithOctave;
  positions: FretPosition[];
  nutX: number;
  scaleLength: number;
  topPadding: number;
  stringSpacing: number;
}

export default function PitchIndicator({
  detectedNoteWithOctave,
  positions,
  nutX,
  scaleLength,
  topPadding,
  stringSpacing,
}: PitchIndicatorProps) {
  const matching = positions.filter((p) => p.noteWithOctave === detectedNoteWithOctave);

  return (
    <g>
      {matching.map((pos) => {
        const cx = fretMidX(pos.fret, nutX, scaleLength);
        const cy = stringY(pos.string, topPadding, stringSpacing);
        return (
          <g key={`pitch-${pos.string}-${pos.fret}`}>
            <circle
              cx={cx}
              cy={cy}
              r={20}
              fill="none"
              stroke="#22C55E"
              strokeWidth={3}
              opacity={0.8}
            >
              <animate
                attributeName="r"
                values="16;24;16"
                dur="1s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="1;0.3;1"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        );
      })}
    </g>
  );
}
