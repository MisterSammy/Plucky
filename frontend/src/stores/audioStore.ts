import { create } from 'zustand';
import { playNote as audioPlayNote, playScale as audioPlayScale } from '@/lib/audio';

let playbackGeneration = 0;

interface AudioStore {
  isPlaying: boolean;
  currentNoteIndex: number | null;
  playbackBpm: number;

  playNote: (noteWithOctave: string) => Promise<void>;
  playScale: (notes: string[]) => Promise<void>;
  stop: () => void;
  setPlaybackBpm: (bpm: number) => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  isPlaying: false,
  currentNoteIndex: null,
  playbackBpm: 120,

  playNote: async (noteWithOctave) => {
    await audioPlayNote(noteWithOctave);
  },

  playScale: async (notes) => {
    const gen = ++playbackGeneration;
    const { playbackBpm } = get();
    set({ isPlaying: true, currentNoteIndex: 0 });
    try {
      await audioPlayScale(
        notes,
        playbackBpm,
        (index) => {
          if (playbackGeneration === gen) {
            set({ currentNoteIndex: index });
          }
        },
        () => playbackGeneration !== gen
      );
    } finally {
      if (playbackGeneration === gen) {
        set({ isPlaying: false, currentNoteIndex: null });
      }
    }
  },

  stop: () => {
    playbackGeneration++;
    set({ isPlaying: false, currentNoteIndex: null });
  },

  setPlaybackBpm: (bpm) => set({ playbackBpm: bpm }),
}));
