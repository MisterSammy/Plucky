import { create } from 'zustand';
import { PitchDetectorEngine } from '@/lib/pitch';
import { useScaleStore } from '@/stores/scaleStore';
import { useToastStore } from '@/stores/toastStore';
import type { NoteName, NoteWithOctave, PitchData } from '@/types';

interface PitchStore {
  isListening: boolean;
  isMonitorMuted: boolean;
  currentFrequency: number | null;
  currentNote: NoteName | null;
  currentNoteWithOctave: NoteWithOctave | null;
  clarity: number;
  centOffset: number;
  currentMidi: number | null;
  error: string | null;

  startListening: () => Promise<void>;
  stopListening: () => void;
  retryListening: () => Promise<void>;
  toggleMonitor: () => void;
  updatePitch: (data: PitchData) => void;
  clearPitch: () => void;
}

let engine: PitchDetectorEngine | null = null;
let audioInputUnsub: (() => void) | null = null;

export const usePitchStore = create<PitchStore>((set, get) => ({
  isListening: false,
  isMonitorMuted: true,
  currentFrequency: null,
  currentNote: null,
  currentNoteWithOctave: null,
  clarity: 0,
  centOffset: 0,
  currentMidi: null,
  error: null,

  startListening: async () => {
    try {
      // Stop and clean up old engine before creating new one (prevents double-engine leak)
      if (engine) {
        engine.stop();
        engine = null;
      }
      if (audioInputUnsub) {
        audioInputUnsub();
        audioInputUnsub = null;
      }

      engine = new PitchDetectorEngine();
      const store = usePitchStore.getState();
      const audioInput = useScaleStore.getState().audioInput;
      await engine.start(store.updatePitch, audioInput);

      // Notify user if we fell back to default device
      if (engine.fellBackToDefault) {
        useToastStore.getState().addToast({
          type: 'error',
          title: 'Device not found',
          message: 'Selected audio device unavailable. Using default input instead.',
          dismissAfterMs: 5000,
        });
      }

      // Apply current monitor state
      engine.setMonitorMuted(store.isMonitorMuted);
      set({ isListening: true, error: null });

      // Subscribe to live audioInput changes for clarity/smoothing adjustment
      let prevClarity = audioInput.minClarity;
      let prevSmoothing = audioInput.smoothing;
      audioInputUnsub = useScaleStore.subscribe((state) => {
        if (!engine) return;
        if (state.audioInput.minClarity !== prevClarity) {
          prevClarity = state.audioInput.minClarity;
          engine.setMinClarity(prevClarity);
        }
        if (state.audioInput.smoothing !== prevSmoothing) {
          prevSmoothing = state.audioInput.smoothing;
          engine.setSmoothing(prevSmoothing);
        }
      });
    } catch (err) {
      const message = err instanceof OverconstrainedError
        ? 'Selected audio device not found. Check Settings.'
        : err instanceof Error
          ? err.message
          : 'Microphone access denied';
      set({ error: message });
    }
  },

  stopListening: () => {
    if (audioInputUnsub) {
      audioInputUnsub();
      audioInputUnsub = null;
    }
    if (engine) {
      try {
        engine.stop();
      } catch {
        // AudioContext.close can throw if already closed
      }
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

  retryListening: async () => {
    set({ error: null });
    await usePitchStore.getState().startListening();
  },

  toggleMonitor: () => {
    const muted = !get().isMonitorMuted;
    set({ isMonitorMuted: muted });
    engine?.setMonitorMuted(muted);
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
