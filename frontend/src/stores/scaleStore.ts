import { create } from 'zustand';
import { setHydrating } from '@/stores/preferenceBridge';
import type { Instrument, Mode, NoteRangeMode, PracticeDirection, NoteName, TuningPreset } from '@/types';

interface Preferences {
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
}

const DEFAULTS: Preferences = {
    mode: 'scales',
    selectedRoot: 'C',
    selectedScaleId: 'major',
    selectedChordId: 'major',
    selectedTuningId: 'standard',
    selectedGenreId: null,
    showAllNotes: false,
    highlightRoot: true,
    showFingers: false,
    noteRangeMode: 'all',
    practiceDirection: 'ascending',
    selectedPosition: null,
    instrument: null,
    theme: 'dark',
    pianoStartOctave: 3,
    pianoEndOctave: 6,
    practiceOctaves: 1,
};

interface ScaleStore extends Preferences {
    customTuning: TuningPreset | null;
    sidebarOpen: boolean;

    setMode: (mode: Mode) => void;
    setRoot: (root: NoteName) => void;
    setScale: (scaleId: string) => void;
    setChord: (chordId: string) => void;
    setTuning: (tuningId: string) => void;
    setGenre: (genreId: string | null) => void;
    setCustomTuning: (tuning: TuningPreset | null) => void;
    setShowAllNotes: (show: boolean) => void;
    setHighlightRoot: (highlight: boolean) => void;
    setShowFingers: (show: boolean) => void;
    setNoteRangeMode: (mode: NoteRangeMode) => void;
    setPracticeDirection: (direction: PracticeDirection) => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    setPosition: (index: number | null) => void;
    setSidebarOpen: (open: boolean) => void;
    setInstrument: (instrument: Instrument) => void;
    setPianoOctaveRange: (start: number, end: number) => void;
    setPracticeOctaves: (n: number) => void;
    hydrateFromServer: (prefs: Partial<Preferences>) => void;
    resetAll: () => void;
}

export const useScaleStore = create<ScaleStore>((set) => ({
    ...DEFAULTS,
    customTuning: null,
    sidebarOpen: false,

    setMode: (mode) => set({ mode, selectedPosition: null }),
    setRoot: (root) => set({ selectedRoot: root }),
    setScale: (scaleId) => set({ selectedScaleId: scaleId }),
    setChord: (chordId) => set({ selectedChordId: chordId }),
    setTuning: (tuningId) => set({ selectedTuningId: tuningId }),
    setGenre: (genreId) => set({ selectedGenreId: genreId }),
    setCustomTuning: (tuning) => set({ customTuning: tuning }),
    setShowAllNotes: (show) => set({ showAllNotes: show }),
    setHighlightRoot: (highlight) => set({ highlightRoot: highlight }),
    setShowFingers: (show) => set({ showFingers: show }),
    setNoteRangeMode: (noteRangeMode) => set({ noteRangeMode }),
    setPracticeDirection: (practiceDirection) => set({ practiceDirection }),
    setTheme: (theme) => set({ theme }),
    setPosition: (index) => set({ selectedPosition: index }),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setInstrument: (instrument) => set({ instrument }),
    setPianoOctaveRange: (start, end) => set({ pianoStartOctave: start, pianoEndOctave: end }),
    setPracticeOctaves: (n) => set({ practiceOctaves: n }),

    hydrateFromServer: (prefs) => {
        setHydrating(true);
        const updates: Partial<Preferences> = {};
        for (const key of Object.keys(DEFAULTS) as (keyof Preferences)[]) {
            if (key in prefs && prefs[key] !== undefined) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (updates as any)[key] = prefs[key];
            }
        }
        set(updates);
        setHydrating(false);
    },

    resetAll: () => set({ ...DEFAULTS }),
}));
