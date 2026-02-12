export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export type NoteWithOctave = `${NoteName}${number}`;

export type Instrument = 'guitar' | 'piano';

export type Mode = 'scales' | 'chords';

export type NoteRangeMode = 'all' | 'fromRoot' | 'rootToRoot';

export type PracticeDirection = 'ascending' | 'descending';

export type ChordCategory =
  | 'major' | 'minor' | 'dominant' | 'suspended'
  | 'diminished' | 'augmented' | 'altered';

export interface ChordDefinition {
  id: string;
  name: string;
  symbol: string;
  intervals: string[];
  degrees: string[];
  category: ChordCategory;
  description: string;
  tonalName: string;
}

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
  finger?: number;
  displayNote?: string;
}

export interface ChordDiagram {
  mutedStrings: number[];
  openStrings: number[];
  barres: { fret: number; fromString: number; toString: number }[];
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
  chordIds: string[];
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

export interface PitchData {
  frequency: number;
  clarity: number;
  note: NoteName;
  noteWithOctave: NoteWithOctave;
  midi: number;
  centOffset: number;
}

export interface Preferences {
    mode: Mode;
    selectedRoot: NoteName;
    selectedScaleId: string;
    selectedChordId: string;
    selectedTuningId: string;
    selectedGenreId: string | null;
    showAllNotes: boolean;
    highlightRoot: boolean;
    showFingers: boolean;
    noteRangeMode: NoteRangeMode;
    practiceDirection: PracticeDirection;
    selectedPosition: number | null;
    instrument: Instrument | null;
    theme: 'light' | 'dark' | 'system';
    pianoStartOctave: number;
    pianoEndOctave: number;
    practiceOctaves: number;
    audioInput: AudioInputConfig;
}

export interface AudioInputConfig {
    selectedDeviceId: string | null;
    echoCancellation: boolean;
    noiseSuppression: boolean;
    autoGainControl: boolean;
    minClarity: number;
    smoothing: number;
}
