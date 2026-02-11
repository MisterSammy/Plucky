import FretboardBackground from './FretboardBackground';
import NoteOverlay from './NoteOverlay';
import ChordDiagramOverlay from './ChordDiagramOverlay';
import PitchIndicator from './PitchIndicator';
import type { FretPosition, NoteWithOctave, PositionRange, ChordDiagram } from '@/types';

const WIDTH = 1200;
const HEIGHT = 200;
const NUT_X = 60;
const SCALE_LENGTH = 1120;
const TOP_PADDING = 25;
const BOTTOM_PADDING = 25;
const STRING_SPACING = (HEIGHT - TOP_PADDING - BOTTOM_PADDING) / 5;
const NUM_FRETS = 22;

interface FretboardSVGProps {
  positions: FretPosition[];
  tuningNotes: string[];
  onNoteClick: (position: FretPosition) => void;
  activeNoteIndex?: number | null;
  highlightRoot?: boolean;
  showAllNotes?: boolean;
  allPositions?: Omit<FretPosition, 'interval' | 'degree' | 'isRoot'>[];
  detectedNoteWithOctave?: NoteWithOctave | null;
  scaleName?: string;
  rootName?: string;
  activePositionRange?: PositionRange | null;
  hitDegrees?: Set<number>;
  chordDiagram?: ChordDiagram | null;
  showFingers?: boolean;
}

import { memo } from 'react';

export default memo(function FretboardSVG({
  positions,
  tuningNotes,
  onNoteClick,
  activeNoteIndex,
  highlightRoot = true,
  showAllNotes = false,
  allPositions = [],
  detectedNoteWithOctave,
  scaleName,
  rootName,
  activePositionRange,
  hitDegrees,
  chordDiagram,
  showFingers = false,
}: FretboardSVGProps) {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMinYMid meet"
      className="w-full h-auto"
      role="img"
      aria-label={`Guitar fretboard showing ${scaleName || 'scale'} in ${rootName || 'key'}`}
    >
      <FretboardBackground
        width={WIDTH}
        height={HEIGHT}
        nutX={NUT_X}
        scaleLength={SCALE_LENGTH}
        topPadding={TOP_PADDING}
        stringSpacing={STRING_SPACING}
        tuningNotes={tuningNotes}
        numFrets={NUM_FRETS}
        activePositionRange={activePositionRange}
      />
      <NoteOverlay
        positions={positions}
        nutX={NUT_X}
        scaleLength={SCALE_LENGTH}
        topPadding={TOP_PADDING}
        stringSpacing={STRING_SPACING}
        onNoteClick={onNoteClick}
        activeNoteIndex={activeNoteIndex}
        highlightRoot={highlightRoot}
        showAllNotes={showAllNotes}
        allPositions={allPositions}
        hitDegrees={hitDegrees}
        showFingers={showFingers}
      />
      {chordDiagram && (
        <ChordDiagramOverlay
          diagram={chordDiagram}
          nutX={NUT_X}
          scaleLength={SCALE_LENGTH}
          topPadding={TOP_PADDING}
          stringSpacing={STRING_SPACING}
        />
      )}
      {detectedNoteWithOctave && (
        <PitchIndicator
          detectedNoteWithOctave={detectedNoteWithOctave}
          positions={positions}
          nutX={NUT_X}
          scaleLength={SCALE_LENGTH}
          topPadding={TOP_PADDING}
          stringSpacing={STRING_SPACING}
        />
      )}
    </svg>
  );
})
