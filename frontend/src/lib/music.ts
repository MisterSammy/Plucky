import { Note, Scale, Interval } from 'tonal';
import type { NoteName, NoteWithOctave, FretPosition, TuningPreset, PositionRange } from '@/types';

const CHROMATIC_SHARPS: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const DEGREE_COLORS: string[] = [
  '#EF4444', // Root (red-500)
  '#F97316', // 2nd (orange-500)
  '#EAB308', // 3rd (yellow-500)
  '#22C55E', // 4th (green-500)
  '#06B6D4', // 5th (cyan-500)
  '#3B82F6', // 6th (blue-500)
  '#8B5CF6', // 7th (violet-500)
];

function normalizeToSharp(noteName: string): NoteName {
  const simplified = Note.simplify(noteName);
  const enharmonic = Note.enharmonic(simplified);
  // Check if the simplified version is already a sharp/natural
  const pc = Note.pitchClass(simplified);
  if (CHROMATIC_SHARPS.includes(pc as NoteName)) {
    return pc as NoteName;
  }
  const enPc = Note.pitchClass(enharmonic);
  if (CHROMATIC_SHARPS.includes(enPc as NoteName)) {
    return enPc as NoteName;
  }
  // Fallback: use midi to get the right note
  const midi = Note.midi(noteName);
  if (midi !== null) {
    const idx = midi % 12;
    return CHROMATIC_SHARPS[idx];
  }
  return pc as NoteName;
}

export function computeFretNote(
  openStringNote: NoteWithOctave,
  fret: number
): { note: NoteName; noteWithOctave: NoteWithOctave; midi: number; frequency: number } {
  const openMidi = Note.midi(openStringNote);
  if (openMidi === null) throw new Error(`Invalid note: ${openStringNote}`);

  const frettedMidi = openMidi + fret;
  const fromMidi = Note.fromMidi(frettedMidi);
  const note = normalizeToSharp(fromMidi);
  const octave = Math.floor((frettedMidi - 12) / 12);
  const noteWithOctave = `${note}${octave}` as NoteWithOctave;
  const frequency = Note.freq(noteWithOctave) ?? 0;

  return { note, noteWithOctave, midi: frettedMidi, frequency };
}

export function getAllFretboardNotes(
  tuning: TuningPreset
): Omit<FretPosition, 'interval' | 'degree' | 'isRoot'>[] {
  const positions: Omit<FretPosition, 'interval' | 'degree' | 'isRoot'>[] = [];
  for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
    const openNote = tuning.notes[stringIdx];
    for (let fret = 0; fret <= 22; fret++) {
      const { note, noteWithOctave, midi, frequency } = computeFretNote(openNote, fret);
      positions.push({ string: stringIdx, fret, note, noteWithOctave, midi, frequency });
    }
  }
  return positions;
}

export function getScalePositions(
  root: NoteName,
  scaleTonalName: string,
  tuning: TuningPreset
): FretPosition[] {
  const scaleData = Scale.get(`${root} ${scaleTonalName}`);
  if (!scaleData.notes.length) return [];

  const scaleNotes = scaleData.notes.map(normalizeToSharp);
  const allPositions = getAllFretboardNotes(tuning);
  const result: FretPosition[] = [];

  for (const pos of allPositions) {
    const noteIdx = scaleNotes.indexOf(pos.note);
    if (noteIdx === -1) continue;

    const interval = Interval.distance(root, pos.note) || scaleData.intervals[noteIdx] || '1P';
    const degree = noteIdx + 1;
    const isRoot = pos.note === root;

    result.push({
      ...pos,
      interval,
      degree,
      isRoot,
    });
  }

  return result;
}

export function fretX(fret: number, nutX: number, scaleLength: number): number {
  return nutX + scaleLength * (1 - 1 / Math.pow(2, fret / 12));
}

export function fretMidX(fret: number, nutX: number, scaleLength: number): number {
  if (fret === 0) return nutX - 20;
  const left = fretX(fret - 1, nutX, scaleLength);
  const right = fretX(fret, nutX, scaleLength);
  return (left + right) / 2;
}

export function stringY(stringIndex: number, topPadding: number, stringSpacing: number): number {
  return topPadding + stringIndex * stringSpacing;
}

export function computeScalePositions(scalePositions: FretPosition[]): PositionRange[] {
  if (scalePositions.length === 0) return [];

  const totalDegrees = new Set(scalePositions.map(p => p.degree)).size;

  // Find scale notes on string 5 (low E), fallback to string 4 (A)
  let bassNotes = scalePositions.filter(p => p.string === 5);
  if (bassNotes.length === 0) {
    bassNotes = scalePositions.filter(p => p.string === 4);
  }
  if (bassNotes.length === 0) return [];

  // Use unique frets from bass string within first octave as anchors
  const anchorFrets = [...new Set(
    bassNotes.filter(p => p.fret <= 11).map(p => p.fret)
  )].sort((a, b) => a - b);

  const positions: PositionRange[] = [];

  for (const anchor of anchorFrets) {
    // Find best 4-5 fret window containing this anchor with all scale degrees
    let bestWindow: { start: number; end: number } | null = null;

    for (let start = Math.max(0, anchor); start >= Math.max(0, anchor - 4); start--) {
      for (const width of [4, 5]) {
        const end = start + width - 1;
        if (end > 22 || anchor > end) continue;

        const windowNotes = scalePositions.filter(
          p => p.fret >= start && p.fret <= end
        );
        const degrees = new Set(windowNotes.map(p => p.degree)).size;

        if (degrees >= totalDegrees && (!bestWindow || width < (bestWindow.end - bestWindow.start + 1))) {
          bestWindow = { start, end };
        }
      }
    }

    if (!bestWindow) continue;

    // Allow up to 2 frets of overlap between adjacent positions
    const tooMuchOverlap = positions.some(existing => {
      const overlapStart = Math.max(bestWindow!.start, existing.startFret);
      const overlapEnd = Math.min(bestWindow!.end, existing.endFret);
      return (overlapEnd - overlapStart) >= 2;
    });
    if (tooMuchOverlap) continue;

    positions.push({
      index: positions.length,
      label: `Position ${positions.length + 1}`,
      startFret: bestWindow.start,
      endFret: bestWindow.end,
    });
  }

  // Re-index after building
  positions.forEach((p, i) => {
    p.index = i;
    p.label = `Position ${i + 1}`;
  });

  return positions;
}

export function frequencyToNote(frequency: number): {
  note: NoteName;
  noteWithOctave: NoteWithOctave;
  midi: number;
  centOffset: number;
} {
  const midi = 12 * Math.log2(frequency / 440) + 69;
  const roundedMidi = Math.round(midi);
  const centOffset = Math.round((midi - roundedMidi) * 100);
  const note = normalizeToSharp(Note.fromMidi(roundedMidi));
  const octave = Math.floor((roundedMidi - 12) / 12);
  const noteWithOctave = `${note}${octave}` as NoteWithOctave;
  return { note, noteWithOctave, midi: roundedMidi, centOffset };
}
