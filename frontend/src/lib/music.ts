import { Note, Scale, Chord, Interval } from 'tonal';
import { normalizeToSharp } from '@/lib/noteUtils';
import type { NoteName, NoteWithOctave, FretPosition, TuningPreset, PositionRange } from '@/types';

const MAX_FRET = 22;
const POSITION_WIDTHS = [4, 5];
const MAX_SCALE_OVERLAP = 2;
const MAX_SCALE_ANCHOR_FRET = 11;
const MAX_CHORD_ANCHOR_FRET = 14;
const NUT_OFFSET = -20;

export const DEGREE_COLORS: string[] = [
  '#EF4444', // Root (red-500)
  '#F97316', // 2nd (orange-500)
  '#EAB308', // 3rd (yellow-500)
  '#22C55E', // 4th (green-500)
  '#06B6D4', // 5th (cyan-500)
  '#3B82F6', // 6th (blue-500)
  '#8B5CF6', // 7th (violet-500)
];

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

let cachedTuningKey: string | null = null;
let cachedFretboardNotes: Omit<FretPosition, 'interval' | 'degree' | 'isRoot'>[] = [];

export function getAllFretboardNotes(
  tuning: TuningPreset
): Omit<FretPosition, 'interval' | 'degree' | 'isRoot'>[] {
  const key = tuning.notes.join(',');
  if (key === cachedTuningKey) return cachedFretboardNotes;

  const positions: Omit<FretPosition, 'interval' | 'degree' | 'isRoot'>[] = [];
  for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
    const openNote = tuning.notes[stringIdx];
    for (let fret = 0; fret <= MAX_FRET; fret++) {
      const { note, noteWithOctave, midi, frequency } = computeFretNote(openNote, fret);
      positions.push({ string: stringIdx, fret, note, noteWithOctave, midi, frequency });
    }
  }

  cachedTuningKey = key;
  cachedFretboardNotes = positions;
  return positions;
}

function getNotePositions(
  root: NoteName,
  notes: string[],
  intervals: string[],
  tuning: TuningPreset,
  displayNames?: string[]
): FretPosition[] {
  const normalizedNotes = notes.map(normalizeToSharp);
  const allPositions = getAllFretboardNotes(tuning);
  const result: FretPosition[] = [];

  for (const pos of allPositions) {
    const noteIdx = normalizedNotes.indexOf(pos.note);
    if (noteIdx === -1) continue;

    const interval = Interval.distance(root, pos.note) || intervals[noteIdx] || '1P';
    const degree = noteIdx + 1;
    const isRoot = pos.note === root;
    const displayNote = displayNames?.[noteIdx];

    result.push({
      ...pos,
      interval,
      degree,
      isRoot,
      ...(displayNote && displayNote !== pos.note ? { displayNote } : {}),
    });
  }

  return result;
}

export function getScalePositions(
  root: NoteName,
  scaleTonalName: string,
  tuning: TuningPreset
): FretPosition[] {
  const scaleData = Scale.get(`${root} ${scaleTonalName}`);
  if (!scaleData.notes.length) return [];
  return getNotePositions(
    root,
    scaleData.notes,
    scaleData.intervals,
    tuning,
    scaleData.notes.map(n => Note.pitchClass(n))
  );
}

export function getChordPositions(
  root: NoteName,
  chordTonalName: string,
  tuning: TuningPreset
): FretPosition[] {
  const chordData = Chord.get(`${root} ${chordTonalName}`);
  if (!chordData.notes.length) return [];
  return getNotePositions(root, chordData.notes, chordData.intervals, tuning);
}

export function fretX(fret: number, nutX: number, scaleLength: number): number {
  return nutX + scaleLength * (1 - 1 / Math.pow(2, fret / 12));
}

export function fretMidX(fret: number, nutX: number, scaleLength: number): number {
  if (fret === 0) return nutX + NUT_OFFSET;
  const left = fretX(fret - 1, nutX, scaleLength);
  const right = fretX(fret, nutX, scaleLength);
  return (left + right) / 2;
}

export function stringY(stringIndex: number, topPadding: number, stringSpacing: number): number {
  return topPadding + stringIndex * stringSpacing;
}

interface PositionRangeOptions {
  anchorFilter: (p: FretPosition) => boolean;
  maxAnchorFret: number;
  maxOverlap: number;
  labelPrefix: string;
}

function computePositionRanges(
  fretPositions: FretPosition[],
  options: PositionRangeOptions
): PositionRange[] {
  if (fretPositions.length === 0) return [];

  const totalDegrees = new Set(fretPositions.map(p => p.degree)).size;

  let bassNotes = fretPositions.filter(p => p.string === 5).filter(options.anchorFilter);
  if (bassNotes.length === 0) {
    bassNotes = fretPositions.filter(p => p.string === 4).filter(options.anchorFilter);
  }
  if (bassNotes.length === 0) {
    // Fall back to any bass string notes
    bassNotes = fretPositions.filter(p => p.string === 5);
    if (bassNotes.length === 0) {
      bassNotes = fretPositions.filter(p => p.string === 4);
    }
  }
  if (bassNotes.length === 0) return [];

  const anchorFrets = [...new Set(
    bassNotes.filter(p => p.fret <= options.maxAnchorFret).map(p => p.fret)
  )].sort((a, b) => a - b);

  const positions: PositionRange[] = [];

  for (const anchor of anchorFrets) {
    let bestWindow: { start: number; end: number } | null = null;

    for (let start = Math.max(0, anchor); start >= Math.max(0, anchor - POSITION_WIDTHS[1]); start--) {
      for (const width of POSITION_WIDTHS) {
        const end = start + width - 1;
        if (end > MAX_FRET || anchor > end) continue;

        const windowNotes = fretPositions.filter(
          p => p.fret >= start && p.fret <= end
        );
        const degrees = new Set(windowNotes.map(p => p.degree)).size;

        if (degrees >= totalDegrees && (!bestWindow || width < (bestWindow.end - bestWindow.start + 1))) {
          bestWindow = { start, end };
        }
      }
    }

    if (!bestWindow) continue;

    const tooMuchOverlap = positions.some(existing => {
      const overlapStart = Math.max(bestWindow!.start, existing.startFret);
      const overlapEnd = Math.min(bestWindow!.end, existing.endFret);
      return (overlapEnd - overlapStart) >= options.maxOverlap;
    });
    if (tooMuchOverlap) continue;

    positions.push({
      index: positions.length,
      label: `${options.labelPrefix} ${positions.length + 1}`,
      startFret: bestWindow.start,
      endFret: bestWindow.end,
    });
  }

  positions.forEach((p, i) => {
    p.index = i;
    p.label = `${options.labelPrefix} ${i + 1}`;
  });

  return positions;
}

export function computeScalePositions(scalePositions: FretPosition[]): PositionRange[] {
  return computePositionRanges(scalePositions, {
    anchorFilter: () => true,
    maxAnchorFret: MAX_SCALE_ANCHOR_FRET,
    maxOverlap: MAX_SCALE_OVERLAP,
    labelPrefix: 'Position',
  });
}

export function computeChordVoicings(chordPositions: FretPosition[]): PositionRange[] {
  return computePositionRanges(chordPositions, {
    anchorFilter: (p) => p.isRoot,
    maxAnchorFret: MAX_CHORD_ANCHOR_FRET,
    maxOverlap: 0,
    labelPrefix: 'Voicing',
  });
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
