import { useAudioStore } from '@/stores/audioStore';

export function useAudioPlayback() {
  const { isPlaying, currentNoteIndex, playNote, playScale, stop } = useAudioStore();
  return { isPlaying, currentNoteIndex, playNote, playScale, stop };
}
