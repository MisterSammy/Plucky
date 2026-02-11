import { Scale, Note } from 'tonal';
import { useAudioStore } from '@/stores/audioStore';
import { useScaleStore } from '@/stores/scaleStore';
import { useFretboardPositions } from '@/hooks/useFretboardPositions';
import { SCALE_BY_ID } from '@/data/scales';
import type { FretPosition } from '@/types';

function buildNotesFromPositions(positions: FretPosition[]): string[] {
  // Deduplicate by MIDI value (same pitch on different strings)
  const seen = new Set<number>();
  const unique: FretPosition[] = [];
  for (const p of positions) {
    if (!seen.has(p.midi)) {
      seen.add(p.midi);
      unique.push(p);
    }
  }

  unique.sort((a, b) => a.midi - b.midi);
  if (unique.length === 0) return [];

  // Start from the first root note, play up to the highest note, then back down
  const rootIdx = unique.findIndex(p => p.isRoot);
  const startIdx = rootIdx >= 0 ? rootIdx : 0;

  const ascending = unique.slice(startIdx);
  const descending = [...ascending].reverse().slice(1);

  return [...ascending, ...descending].map(p => p.noteWithOctave);
}

function buildDefaultNotes(selectedRoot: string, scaleTonalName: string): string[] {
  const scaleData = Scale.get(`${selectedRoot} ${scaleTonalName}`);
  if (!scaleData.notes.length) return [];

  const ascending = scaleData.notes.map((n) => {
    const midi = Note.midi(`${n}3`);
    const rootMidi = Note.midi(`${selectedRoot}3`);
    if (midi !== null && rootMidi !== null && midi < rootMidi) {
      return `${n}4`;
    }
    return `${n}3`;
  });
  // Add the root an octave up
  ascending.push(`${selectedRoot}4`);

  const descending = [...ascending].reverse().slice(1);
  return [...ascending, ...descending];
}

export default function PlayScaleButton() {
  const { isPlaying, playScale, stop } = useAudioStore();
  const { selectedRoot, selectedScaleId } = useScaleStore();
  const { filteredPositions, activePositionRange } = useFretboardPositions();

  const handleClick = async () => {
    if (isPlaying) {
      stop();
      return;
    }

    const scale = SCALE_BY_ID[selectedScaleId];
    if (!scale) return;

    let notes: string[];

    if (activePositionRange && filteredPositions.length > 0) {
      notes = buildNotesFromPositions(filteredPositions);
    } else {
      notes = buildDefaultNotes(selectedRoot, scale.tonalName);
    }

    if (notes.length === 0) return;

    await playScale(notes);
  };

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        isPlaying
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'bg-accent hover:bg-accent-hover text-white'
      }`}
      aria-label={isPlaying ? 'Stop playback' : 'Play scale'}
    >
      {isPlaying ? 'Stop' : 'Play Scale'}
    </button>
  );
}
