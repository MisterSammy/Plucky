import { useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { usePracticeStore } from '@/stores/practiceStore';
import { useScaleStore } from '@/stores/scaleStore';
import { playSuccessChime } from '@/lib/audio';
import type { NoteName } from '@/types';

interface PositionWithDegreeAndNote {
    degree: number;
    note: NoteName;
}

function buildExpectedNotes(positions: PositionWithDegreeAndNote[]): NoteName[] {
    const notesByDegree = new Map<number, NoteName>();
    for (const p of positions) {
        if (!notesByDegree.has(p.degree)) {
            notesByDegree.set(p.degree, p.note);
        }
    }
    return [...notesByDegree.entries()]
        .sort(([a], [b]) => a - b)
        .map(([, note]) => note);
}

export function useScalePractice(
    filteredPositions: PositionWithDegreeAndNote[],
    isListening: boolean,
    currentNote: NoteName | null
): Set<number> {
    // Initialize/reset practice when listening state or positions change
    useEffect(() => {
        if (!isListening || filteredPositions.length === 0) {
            usePracticeStore.getState().reset();
            return;
        }

        const notes = buildExpectedNotes(filteredPositions);
        usePracticeStore.getState().startPractice(notes);
    }, [isListening, filteredPositions]);

    // Check detected notes against expected sequence
    useEffect(() => {
        if (!isListening || !currentNote) {
            return;
        }

        const isCorrect = usePracticeStore.getState().checkNote(currentNote);
        if (isCorrect) {
            const { currentStep, expectedNotes, startedAt, trackScaleId } = usePracticeStore.getState();
            if (currentStep >= expectedNotes.length) {
                playSuccessChime();

                // Save session to backend
                const durationMs = startedAt ? Date.now() - startedAt : null;
                const { selectedScaleId, selectedRoot, selectedTuningId, instrument } = useScaleStore.getState();

                router.post('/sessions', {
                    scale_id: selectedScaleId,
                    root_note: selectedRoot,
                    tuning_id: selectedTuningId,
                    instrument: instrument ?? 'guitar',
                    completed: true,
                    duration_ms: durationMs,
                    total_notes: expectedNotes.length,
                    notes_hit: expectedNotes.length,
                    ...(trackScaleId ? { track_scale_id: trackScaleId } : {}),
                }, {
                    preserveState: true,
                    preserveScroll: true,
                });
            }
        }
    }, [isListening, currentNote]);

    const hitNotes = usePracticeStore(s => s.hitNotes);
    const isActive = usePracticeStore(s => s.isActive);

    return useMemo(() => {
        if (!isActive) return new Set<number>();
        const degrees = new Set<number>();
        hitNotes.forEach((hit, i) => {
            if (hit) degrees.add(i + 1); // degrees are 1-based
        });
        return degrees;
    }, [isActive, hitNotes]);
}
