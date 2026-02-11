export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export type NoteWithOctave = `${NoteName}${number}`;

export type Instrument = 'guitar' | 'piano';

export interface PianoKeyPosition {
  midi: number;
  note: NoteName;
  noteWithOctave: NoteWithOctave;
  frequency: number;
  interval: string;
  degree: number;
  isRoot: boolean;
  isBlackKey: boolean;
  octave: number;
}

export interface FretPosition {
  string: number;
  fret: number;
  note: NoteName;
  noteWithOctave: NoteWithOctave;
  midi: number;
  frequency: number;
  interval: string;
  degree: number;
  isRoot: boolean;
}

export type ScaleCategory =
  | 'major'
  | 'minor'
  | 'pentatonic'
  | 'blues'
  | 'modal'
  | 'melodic-minor-mode'
  | 'harmonic-minor-mode'
  | 'exotic'
  | 'jazz';

export interface ScaleDefinition {
  id: string;
  name: string;
  intervals: string[];
  degrees: string[];
  category: ScaleCategory;
  description: string;
  tonalName: string;
}

export interface GenreCollection {
  id: string;
  name: string;
  description: string;
  scaleIds: string[];
  suggestedTunings: string[];
  tips: string[];
  color: string;
}

export interface TuningPreset {
  id: string;
  name: string;
  notes: [NoteWithOctave, NoteWithOctave, NoteWithOctave, NoteWithOctave, NoteWithOctave, NoteWithOctave];
  description: string;
  isCustom: boolean;
}

export interface PitchDetectionState {
  isListening: boolean;
  currentFrequency: number | null;
  currentNote: NoteName | null;
  currentNoteWithOctave: NoteWithOctave | null;
  clarity: number;
  currentMidi: number | null;
  centOffset: number;
}

export interface PositionRange {
  index: number;       // 0-based ordinal
  label: string;       // "Position 1", etc.
  startFret: number;   // inclusive
  endFret: number;     // inclusive
}

export interface AudioPlaybackState {
  isPlaying: boolean;
  currentNoteIndex: number | null;
  synth: unknown;
}
