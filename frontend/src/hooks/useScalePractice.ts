import { useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { usePracticeStore } from '@/stores/practiceStore';
import { useScaleStore } from '@/stores/scaleStore';
import { useToastStore } from '@/stores/toastStore';
import { playSuccessChime } from '@/lib/audio';
import type { NoteName, PracticeDirection } from '@/types';

interface PositionWithDegreeAndNote {
    degree: number;
    note: NoteName;
    displayNote?: string;
}

function buildExpectedNotes(
    positions: PositionWithDegreeAndNote[],
    direction: PracticeDirection,
    octaveCount: number
): { notes: NoteName[]; displayNotes: string[]; degrees: number[] } {
    const notesByDegree = new Map<number, { note: NoteName; displayNote: string }>();
    for (const p of positions) {
        if (!notesByDegree.has(p.degree)) {
            notesByDegree.set(p.degree, {
                note: p.note,
                displayNote: p.displayNote ?? p.note,
            });
        }
    }
    const sorted = [...notesByDegree.entries()].sort(([a], [b]) => a - b);
    const rootEntry = sorted.length > 0 ? sorted[0][1] : undefined;

    // Build one octave (without closing root)
    const oneOctNotes = sorted.map(([, v]) => v.note);
    const oneOctDisplay = sorted.map(([, v]) => v.displayNote);
    const oneOctDegrees = sorted.map(([deg]) => deg);

    // Repeat for multi-octave: each octave repeats the full sequence
    let notes: NoteName[] = [];
    let displayNotes: string[] = [];
    let degrees: number[] = [];

    for (let oct = 0; oct < octaveCount; oct++) {
        notes = notes.concat(oneOctNotes);
        displayNotes = displayNotes.concat(oneOctDisplay);
        degrees = degrees.concat(oneOctDegrees);
    }

    if (direction === 'descending') {
        notes.reverse();
        displayNotes.reverse();
        degrees.reverse();
    }

    // Add root for a complete-sounding sequence:
    // ascending  → append at end   (D, Eb, F, G, A, Bb, C, D)
    // descending → prepend at start (D, C, Bb, A, G, F, Eb, D)
    if (rootEntry !== undefined) {
        if (direction === 'descending') {
            notes.unshift(rootEntry.note);
            displayNotes.unshift(rootEntry.displayNote);
            degrees.unshift(1);
        } else {
            notes.push(rootEntry.note);
            displayNotes.push(rootEntry.displayNote);
            degrees.push(1);
        }
    }

    return { notes, displayNotes, degrees };
}

export function useScalePractice(
    filteredPositions: PositionWithDegreeAndNote[],
    isListening: boolean,
    currentNote: NoteName | null
): Set<number> {
    const practiceDirection = useScaleStore(s => s.practiceDirection);
    const practiceOctaves = useScaleStore(s => s.practiceOctaves);

    // Initialize/reset practice when listening state or positions change
    useEffect(() => {
        if (!isListening || filteredPositions.length === 0) {
            usePracticeStore.getState().reset();
            return;
        }

        const { notes, displayNotes, degrees } = buildExpectedNotes(filteredPositions, practiceDirection, practiceOctaves);
        usePracticeStore.getState().startPractice(notes, degrees, displayNotes);
    }, [isListening, filteredPositions, practiceDirection, practiceOctaves]);

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
                const { selectedScaleId, selectedChordId, selectedRoot, selectedTuningId, instrument, mode, selectedGenreId, practiceOctaves: octaves } = useScaleStore.getState();

                router.post('/sessions', {
                    scale_id: mode === 'chords' ? selectedChordId : selectedScaleId,
                    root_note: selectedRoot,
                    tuning_id: selectedTuningId,
                    instrument: instrument ?? 'guitar',
                    completed: true,
                    duration_ms: durationMs,
                    total_notes: expectedNotes.length,
                    notes_hit: expectedNotes.length,
                    genre_id: selectedGenreId,
                    octaves,
                    ...(trackScaleId ? { track_scale_id: trackScaleId } : {}),
                }, {
                    preserveState: true,
                    preserveScroll: true,
                    onError: () => {
                        useToastStore.getState().addToast({
                            type: 'error',
                            title: 'Session not saved',
                            message: 'Your practice session could not be recorded.',
                            dismissAfterMs: 5000,
                        });
                    },
                });
            }
        }
    }, [isListening, currentNote]);

    const hitNotes = usePracticeStore(s => s.hitNotes);
    const expectedDegrees = usePracticeStore(s => s.expectedDegrees);
    const isActive = usePracticeStore(s => s.isActive);

    return useMemo(() => {
        if (!isActive) return new Set<number>();
        const degrees = new Set<number>();
        hitNotes.forEach((hit, i) => {
            if (hit && expectedDegrees[i] !== undefined) {
                degrees.add(expectedDegrees[i]);
            }
        });
        return degrees;
    }, [isActive, hitNotes, expectedDegrees]);
}
