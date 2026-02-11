import { create } from 'zustand';
import { playNote as audioPlayNote, playScale as audioPlayScale, playChord as audioPlayChord, chordPlaybackDuration } from '@/lib/audio';

let playbackGeneration = 0;

interface AudioStore {
  isPlaying: boolean;
  currentNoteIndex: number | null;
  playbackBpm: number;
  error: string | null;

  playNote: (noteWithOctave: string) => Promise<void>;
  playScale: (notes: string[]) => Promise<void>;
  playChord: (notes: string[]) => Promise<void>;
  stop: () => void;
  setPlaybackBpm: (bpm: number) => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  isPlaying: false,
  currentNoteIndex: null,
  playbackBpm: 120,
  error: null,

  playNote: async (noteWithOctave) => {
    try {
      set({ error: null });
      await audioPlayNote(noteWithOctave);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Audio playback failed' });
    }
  },

  playScale: async (notes) => {
    const gen = ++playbackGeneration;
    set({ isPlaying: true, currentNoteIndex: 0, error: null });
    try {
      await audioPlayScale(
        notes,
        get().playbackBpm,
        (index) => {
          if (playbackGeneration === gen) {
            set({ currentNoteIndex: index });
          }
        },
        () => playbackGeneration !== gen
      );
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Scale playback failed' });
    } finally {
      if (playbackGeneration === gen) {
        set({ isPlaying: false, currentNoteIndex: null });
      }
    }
  },

  playChord: async (notes) => {
    const gen = ++playbackGeneration;
    set({ isPlaying: true, currentNoteIndex: null, error: null });
    try {
      await audioPlayChord(notes);
      // Auto-reset after playback completes
      setTimeout(() => {
        if (playbackGeneration === gen) {
          set({ isPlaying: false, currentNoteIndex: null });
        }
      }, chordPlaybackDuration(notes.length));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Chord playback failed' });
      set({ isPlaying: false, currentNoteIndex: null });
    }
  },

  stop: () => {
    playbackGeneration++;
    set({ isPlaying: false, currentNoteIndex: null });
  },

  setPlaybackBpm: (bpm) => {
    set({ playbackBpm: bpm });
  },
}));
