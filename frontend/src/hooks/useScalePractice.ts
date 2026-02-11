import { useEffect, useRef, useMemo } from 'react';
import { usePracticeStore } from '@/stores/practiceStore';
import { playSuccessChime } from '@/lib/audio';
import type { FretPosition, NoteName } from '@/types';

function buildExpectedNotes(positions: FretPosition[]): NoteName[] {
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
  filteredPositions: FretPosition[],
  isListening: boolean,
  currentNote: NoteName | null
): Set<number> {
  const lastNoteRef = useRef<NoteName | null>(null);

  // Initialize/reset practice when listening state or positions change
  useEffect(() => {
    if (!isListening || filteredPositions.length === 0) {
      usePracticeStore.getState().reset();
      lastNoteRef.current = null;
      return;
    }

    const notes = buildExpectedNotes(filteredPositions);
    usePracticeStore.getState().startPractice(notes);
    lastNoteRef.current = null;
  }, [isListening, filteredPositions]);

  // Check detected notes against expected sequence
  useEffect(() => {
    if (!isListening || !currentNote) {
      lastNoteRef.current = null;
      return;
    }

    // Only check when the note changes (avoid re-triggering on sustained notes)
    if (currentNote === lastNoteRef.current) return;
    lastNoteRef.current = currentNote;

    const isCorrect = usePracticeStore.getState().checkNote(currentNote);
    if (isCorrect) {
      const { currentStep, expectedNotes } = usePracticeStore.getState();
      if (currentStep >= expectedNotes.length) {
        playSuccessChime();
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
