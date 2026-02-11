import { useEffect } from 'react';
import { usePitchStore } from '@/stores/pitchStore';

export function usePitchDetection() {
  const { isListening, startListening, stopListening, ...pitchData } = usePitchStore();

  useEffect(() => {
    return () => {
      if (usePitchStore.getState().isListening) {
        usePitchStore.getState().stopListening();
      }
    };
  }, []);

  return { isListening, startListening, stopListening, ...pitchData };
}
