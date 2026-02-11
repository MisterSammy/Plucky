import { create } from 'zustand';
import type { NoteName } from '@/types';

interface PracticeStore {
    expectedNotes: NoteName[];
    expectedDegrees: number[];
    displayNotes: string[];
    currentStep: number;
    hitNotes: boolean[];
    isActive: boolean;
    trackScaleId: number | null;
    startedAt: number | null;

    startPractice: (notes: NoteName[], degrees: number[], displayNotes: string[]) => void;
    checkNote: (note: NoteName) => boolean;
    reset: () => void;
    setTrackScaleId: (id: number | null) => void;
}

export const usePracticeStore = create<PracticeStore>((set, get) => ({
    expectedNotes: [],
    expectedDegrees: [],
    displayNotes: [],
    currentStep: 0,
    hitNotes: [],
    isActive: false,
    trackScaleId: null,
    startedAt: null,

    startPractice: (notes, degrees, displayNotes) => set({
        expectedNotes: notes,
        expectedDegrees: degrees,
        displayNotes,
        currentStep: 0,
        hitNotes: new Array(notes.length).fill(false),
        isActive: true,
        startedAt: Date.now(),
    }),

    checkNote: (note) => {
        const { expectedNotes, currentStep, hitNotes, isActive } = get();
        if (!isActive || expectedNotes.length === 0) return false;

        // After completion, restart when the first note is played again
        if (currentStep >= expectedNotes.length) {
            if (note === expectedNotes[0]) {
                set({
                    currentStep: 1,
                    hitNotes: expectedNotes.map((_, i) => i === 0),
                    startedAt: Date.now(),
                });
                return true;
            }
            return false;
        }

        // Normal advance — check if detected note matches expected next note
        if (note === expectedNotes[currentStep]) {
            const newHitNotes = [...hitNotes];
            newHitNotes[currentStep] = true;
            set({
                currentStep: currentStep + 1,
                hitNotes: newHitNotes,
            });
            return true;
        }

        // Mid-sequence restart — playing root resets to beginning
        if (currentStep > 0 && note === expectedNotes[0]) {
            set({
                currentStep: 1,
                hitNotes: expectedNotes.map((_, i) => i === 0),
                startedAt: Date.now(),
            });
            return true;
        }

        return false;
    },

    reset: () => set({
        expectedNotes: [],
        expectedDegrees: [],
        displayNotes: [],
        currentStep: 0,
        hitNotes: [],
        isActive: false,
        startedAt: null,
    }),

    setTrackScaleId: (id) => set({ trackScaleId: id }),
}));
