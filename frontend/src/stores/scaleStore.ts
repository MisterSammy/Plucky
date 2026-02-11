import { create } from 'zustand';
import type { Instrument, NoteName, TuningPreset } from '@/types';

interface ScaleStore {
  selectedRoot: NoteName;
  selectedScaleId: string;
  selectedTuningId: string;
  selectedGenreId: string | null;
  customTuning: TuningPreset | null;
  showAllNotes: boolean;
  highlightRoot: boolean;
  theme: 'light' | 'dark' | 'system';
  selectedPosition: number | null;
  sidebarOpen: boolean;
  instrument: Instrument | null;
  pianoStartOctave: number;
  pianoEndOctave: number;

  setRoot: (root: NoteName) => void;
  setScale: (scaleId: string) => void;
  setTuning: (tuningId: string) => void;
  setGenre: (genreId: string | null) => void;
  setCustomTuning: (tuning: TuningPreset | null) => void;
  setShowAllNotes: (show: boolean) => void;
  setHighlightRoot: (highlight: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setPosition: (index: number | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setInstrument: (instrument: Instrument) => void;
  setPianoOctaveRange: (start: number, end: number) => void;
}

export const useScaleStore = create<ScaleStore>((set) => ({
  selectedRoot: 'C',
  selectedScaleId: 'major',
  selectedTuningId: 'standard',
  selectedGenreId: null,
  customTuning: null,
  showAllNotes: false,
  highlightRoot: true,
  theme: (localStorage.getItem('plucky-theme') as 'light' | 'dark' | 'system') || 'dark',
  selectedPosition: null,
  sidebarOpen: false,
  instrument: (localStorage.getItem('plucky-instrument') as Instrument | null),
  pianoStartOctave: 3,
  pianoEndOctave: 6,

  setRoot: (root) => set({ selectedRoot: root, selectedPosition: null }),
  setScale: (scaleId) => set({ selectedScaleId: scaleId, selectedPosition: null }),
  setTuning: (tuningId) => set({ selectedTuningId: tuningId, selectedPosition: null }),
  setGenre: (genreId) => set({ selectedGenreId: genreId }),
  setCustomTuning: (tuning) => set({ customTuning: tuning, selectedPosition: null }),
  setShowAllNotes: (show) => set({ showAllNotes: show }),
  setHighlightRoot: (highlight) => set({ highlightRoot: highlight }),
  setTheme: (theme) => {
    localStorage.setItem('plucky-theme', theme);
    set({ theme });
  },
  setPosition: (index) => set({ selectedPosition: index }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setInstrument: (instrument) => {
    localStorage.setItem('plucky-instrument', instrument);
    set({ instrument });
  },
  setPianoOctaveRange: (start, end) => set({ pianoStartOctave: start, pianoEndOctave: end }),
}));
