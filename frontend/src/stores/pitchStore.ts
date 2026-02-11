import { create } from 'zustand';
import { PitchDetectorEngine } from '@/lib/pitch';
import type { NoteName, NoteWithOctave } from '@/types';

interface PitchData {
  frequency: number;
  clarity: number;
  note: NoteName;
  noteWithOctave: NoteWithOctave;
  midi: number;
  centOffset: number;
}

interface PitchStore {
  isListening: boolean;
  currentFrequency: number | null;
  currentNote: NoteName | null;
  currentNoteWithOctave: NoteWithOctave | null;
  clarity: number;
  centOffset: number;
  currentMidi: number | null;
  error: string | null;

  startListening: () => Promise<void>;
  stopListening: () => void;
  updatePitch: (data: PitchData) => void;
  clearPitch: () => void;
}

let engine: PitchDetectorEngine | null = null;

export const usePitchStore = create<PitchStore>((set) => ({
  isListening: false,
  currentFrequency: null,
  currentNote: null,
  currentNoteWithOctave: null,
  clarity: 0,
  centOffset: 0,
  currentMidi: null,
  error: null,

  startListening: async () => {
    try {
      engine = new PitchDetectorEngine();
      const store = usePitchStore.getState();
      await engine.start(store.updatePitch);
      set({ isListening: true, error: null });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Microphone access denied' });
    }
  },

  stopListening: () => {
    if (engine) {
      engine.stop();
      engine = null;
    }
    set({
      isListening: false,
      currentFrequency: null,
      currentNote: null,
      currentNoteWithOctave: null,
      clarity: 0,
      centOffset: 0,
      currentMidi: null,
    });
  },

  updatePitch: (data) =>
    set({
      currentFrequency: data.frequency,
      currentNote: data.note,
      currentNoteWithOctave: data.noteWithOctave,
      clarity: data.clarity,
      centOffset: data.centOffset,
      currentMidi: data.midi,
    }),

  clearPitch: () =>
    set({
      currentFrequency: null,
      currentNote: null,
      currentNoteWithOctave: null,
      clarity: 0,
      centOffset: 0,
      currentMidi: null,
    }),
}));
