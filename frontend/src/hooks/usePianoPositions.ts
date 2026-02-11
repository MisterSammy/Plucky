import { useMemo } from 'react';
import { useScaleStore } from '@/stores/scaleStore';
import { SCALE_BY_ID } from '@/data/scales';
import { CHORD_BY_ID } from '@/data/chords';
import { getPianoScalePositions, getPianoChordPositions, getAllPianoKeys } from '@/lib/piano';
import { filterByNoteRange } from '@/lib/noteRangeFilter';
import type { PianoKeyPosition, PositionRange } from '@/types';

export function usePianoPositions() {
    const { mode, selectedRoot, selectedScaleId, selectedChordId, pianoStartOctave, pianoEndOctave, selectedPosition, noteRangeMode } = useScaleStore();

    return useMemo(() => {
        const allKeys = getAllPianoKeys(pianoStartOctave, pianoEndOctave);

        if (mode === 'chords') {
            const chord = CHORD_BY_ID[selectedChordId];
            const positions = chord
                ? getPianoChordPositions(selectedRoot, chord.tonalName, pianoStartOctave, pianoEndOctave)
                : [];

            // Compute octave-based voicings
            const octaveGroups = new Map<number, PianoKeyPosition[]>();
            for (const pos of positions) {
                const group = octaveGroups.get(pos.octave) || [];
                group.push(pos);
                octaveGroups.set(pos.octave, group);
            }

            // Only include octaves that contain all unique chord degrees
            const totalDegrees = new Set(positions.map(p => p.degree)).size;
            const availableVoicings: PositionRange[] = [];

            const sortedOctaves = [...octaveGroups.keys()].sort((a, b) => a - b);
            for (const octave of sortedOctaves) {
                const group = octaveGroups.get(octave)!;
                const degrees = new Set(group.map(p => p.degree)).size;
                if (degrees >= totalDegrees) {
                    const idx = availableVoicings.length;
                    availableVoicings.push({
                        index: idx,
                        label: `Voicing ${idx + 1} (Oct ${octave})`,
                        startFret: octave, // Reuse fret fields for octave
                        endFret: octave,
                    });
                }
            }

            // Bounds-clamp selectedPosition
            const clampedPosition =
                selectedPosition != null && selectedPosition < availableVoicings.length
                    ? selectedPosition
                    : null;

            const filteredPositions = clampedPosition != null
                ? positions.filter(p => p.octave === sortedOctaves.filter(oct => {
                    const group = octaveGroups.get(oct)!;
                    return new Set(group.map(pp => pp.degree)).size >= totalDegrees;
                })[clampedPosition])
                : positions;

            return { positions, filteredPositions, allKeys, availableVoicings };
        }

        // Scale mode
        const scale = SCALE_BY_ID[selectedScaleId];
        const positions = scale
            ? getPianoScalePositions(selectedRoot, scale.tonalName, pianoStartOctave, pianoEndOctave)
            : [];

        const filteredPositions = filterByNoteRange(positions, noteRangeMode);

        return { positions, filteredPositions, allKeys, availableVoicings: [] as PositionRange[] };
    }, [mode, selectedRoot, selectedScaleId, selectedChordId, pianoStartOctave, pianoEndOctave, selectedPosition, noteRangeMode]);
}
