import { useAudioStore } from '@/stores/audioStore';
import { useScaleStore } from '@/stores/scaleStore';
import { useFretboardPositions } from '@/hooks/useFretboardPositions';
import { usePianoPositions } from '@/hooks/usePianoPositions';
import { SCALE_BY_ID } from '@/data/scales';
import { CHORD_BY_ID } from '@/data/chords';
import {
    buildNotesFromFretPositions,
    buildNotesFromPianoPositions,
    buildDefaultNotes,
    buildChordStrumNotes,
    buildChordPianoNotes,
    buildDefaultChordNotes,
} from '@/lib/noteSequence';

export default function PlayScaleButton() {
  const { isPlaying, playScale, playChord, stop } = useAudioStore();
  const { selectedRoot, selectedScaleId, selectedChordId, instrument, mode } = useScaleStore();
  const { filteredPositions, activePositionRange } = useFretboardPositions();
  const { positions: pianoPositions } = usePianoPositions();

  const isChordMode = mode === 'chords';

  const handleClick = async () => {
    if (isPlaying) {
      stop();
      return;
    }

    if (isChordMode) {
      const chord = CHORD_BY_ID[selectedChordId];
      if (!chord) return;

      let notes: string[];
      if (instrument === 'piano') {
        notes = buildChordPianoNotes(pianoPositions);
      } else if (activePositionRange && filteredPositions.length > 0) {
        notes = buildChordStrumNotes(filteredPositions);
      } else {
        notes = buildDefaultChordNotes(selectedRoot, chord.tonalName);
      }

      if (notes.length === 0) return;
      await playChord(notes);
    } else {
      const scale = SCALE_BY_ID[selectedScaleId];
      if (!scale) return;

      let notes: string[];
      if (instrument === 'piano') {
        notes = buildNotesFromPianoPositions(pianoPositions);
      } else if (activePositionRange && filteredPositions.length > 0) {
        notes = buildNotesFromFretPositions(filteredPositions);
      } else {
        notes = buildDefaultNotes(selectedRoot, scale.tonalName);
      }

      if (notes.length === 0) return;
      await playScale(notes);
    }
  };

  const label = isPlaying ? 'Stop' : isChordMode ? 'Play Chord' : 'Play Scale';

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        isPlaying
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'bg-accent hover:bg-accent-hover text-white'
      }`}
      aria-label={isPlaying ? 'Stop playback' : label}
    >
      {label}
    </button>
  );
}
