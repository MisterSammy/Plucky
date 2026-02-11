import { useMemo } from 'react';
import { useScaleStore } from '@/stores/scaleStore';
import { SCALE_BY_ID } from '@/data/scales';
import { getPianoScalePositions, getAllPianoKeys } from '@/lib/piano';

export function usePianoPositions() {
    const { selectedRoot, selectedScaleId, pianoStartOctave, pianoEndOctave } = useScaleStore();

    return useMemo(() => {
        const scale = SCALE_BY_ID[selectedScaleId];
        const positions = scale
            ? getPianoScalePositions(selectedRoot, scale.tonalName, pianoStartOctave, pianoEndOctave)
            : [];
        const allKeys = getAllPianoKeys(pianoStartOctave, pianoEndOctave);
        return { positions, allKeys };
    }, [selectedRoot, selectedScaleId, pianoStartOctave, pianoEndOctave]);
}
