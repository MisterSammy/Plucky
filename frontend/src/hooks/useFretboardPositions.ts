import { useMemo } from 'react';
import { Chord } from 'tonal';
import { useScaleStore } from '@/stores/scaleStore';
import { SCALE_BY_ID } from '@/data/scales';
import { CHORD_BY_ID } from '@/data/chords';
import { TUNING_BY_ID } from '@/data/tunings';
import { getScalePositions, getChordPositions, getAllFretboardNotes, computeScalePositions, computeChordVoicings } from '@/lib/music';
import { lookupChordVoicings } from '@/lib/chordVoicings';
import { filterByNoteRange } from '@/lib/noteRangeFilter';
import { normalizeToSharp } from '@/lib/noteUtils';
import type { FretPosition, TuningPreset, PositionRange, ChordDiagram } from '@/types';

export function useFretboardPositions(): {
    positions: FretPosition[];
    filteredPositions: FretPosition[];
    tuning: TuningPreset;
    allPositions: Omit<FretPosition, 'interval' | 'degree' | 'isRoot'>[];
    availablePositions: PositionRange[];
    activePositionRange: PositionRange | null;
    chordDiagram: ChordDiagram | null;
} {
    const { mode, selectedRoot, selectedScaleId, selectedChordId, selectedTuningId, customTuning, selectedPosition, noteRangeMode } = useScaleStore();

    // Stage 1: Resolve tuning and compute all fretboard positions (only recomputes when tuning changes)
    const { tuning, allPositions } = useMemo(() => {
        const tuning =
            selectedTuningId === 'custom' && customTuning
                ? customTuning
                : TUNING_BY_ID[selectedTuningId] || TUNING_BY_ID['standard'];
        const allPositions = getAllFretboardNotes(tuning);
        return { tuning, allPositions };
    }, [selectedTuningId, customTuning]);

    // Stage 2: Filter to scale/chord positions (recomputes on root/scale/chord/mode/position changes)
    return useMemo(() => {
        if (mode === 'chords') {
            const chord = CHORD_BY_ID[selectedChordId];
            if (!chord) {
                return { positions: [], filteredPositions: [], tuning, allPositions, availablePositions: [], activePositionRange: null, chordDiagram: null };
            }

            // Get chord note names for DB lookup
            const chordData = Chord.get(`${selectedRoot} ${chord.tonalName}`);
            const chordNotes = chordData.notes.map(normalizeToSharp);

            // Try chords-db lookup first
            const dbResult = lookupChordVoicings(selectedRoot, selectedChordId, chordNotes, chordData.intervals, tuning);

            if (dbResult) {
                const { positions, availableVoicings, voicingPositions, chordDiagrams } = dbResult;

                const clampedPosition =
                    selectedPosition != null && selectedPosition < availableVoicings.length
                        ? selectedPosition
                        : null;

                const activePositionRange = clampedPosition != null ? availableVoicings[clampedPosition] : null;

                const filteredPositions = clampedPosition != null
                    ? voicingPositions[clampedPosition]
                    : positions;

                const chordDiagram = clampedPosition != null
                    ? chordDiagrams[clampedPosition]
                    : null;

                return { positions, filteredPositions, tuning, allPositions, availablePositions: availableVoicings, activePositionRange, chordDiagram };
            }

            // Fallback: computed positions
            const computedPositions = getChordPositions(selectedRoot, chord.tonalName, tuning);
            const availablePositions = computeChordVoicings(computedPositions);

            const clampedPosition =
                selectedPosition != null && selectedPosition < availablePositions.length
                    ? selectedPosition
                    : null;

            const activePositionRange = clampedPosition != null ? availablePositions[clampedPosition] : null;

            const filteredPositions = activePositionRange
                ? computedPositions.filter(
                    p => p.fret >= activePositionRange.startFret && p.fret <= activePositionRange.endFret
                )
                : computedPositions;

            return { positions: computedPositions, filteredPositions, tuning, allPositions, availablePositions, activePositionRange, chordDiagram: null };
        }

        // Scale mode
        const scale = SCALE_BY_ID[selectedScaleId];
        const positions = scale ? getScalePositions(selectedRoot, scale.tonalName, tuning) : [];
        const availablePositions = computeScalePositions(positions);

        const clampedPosition =
            selectedPosition != null && selectedPosition < availablePositions.length
                ? selectedPosition
                : null;

        const activePositionRange = clampedPosition != null ? availablePositions[clampedPosition] : null;

        let positionFiltered = activePositionRange
            ? positions.filter(
                p => p.fret >= activePositionRange.startFret && p.fret <= activePositionRange.endFret
            )
            : positions;

        let filteredPositions = filterByNoteRange(positionFiltered, noteRangeMode);

        // Expand position window if any degree is missing from inner strings (1-4).
        if (activePositionRange) {
            const allDegrees = new Set(positions.map(p => p.degree));
            let expandedStart = activePositionRange.startFret;
            let expandedEnd = activePositionRange.endFret;

            for (let i = 0; i < 2; i++) {
                const innerDegrees = new Set(
                    filteredPositions
                        .filter(p => p.string >= 1 && p.string <= 4)
                        .map(p => p.degree)
                );
                const hasMissing = [...allDegrees].some(d => !innerDegrees.has(d));
                if (!hasMissing) break;

                expandedStart = Math.max(0, expandedStart - 1);
                expandedEnd = Math.min(22, expandedEnd + 1);
                positionFiltered = positions.filter(
                    p => p.fret >= expandedStart && p.fret <= expandedEnd
                );
                filteredPositions = filterByNoteRange(positionFiltered, noteRangeMode);
            }
        }

        return { positions, filteredPositions, tuning, allPositions, availablePositions, activePositionRange, chordDiagram: null };
    }, [mode, selectedRoot, selectedScaleId, selectedChordId, selectedPosition, noteRangeMode, tuning, allPositions]);
}
