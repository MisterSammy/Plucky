import { create } from 'zustand';
import type { NoteName } from '@/types';

interface PracticeStore {
    expectedNotes: NoteName[];
    currentStep: number;
    hitNotes: boolean[];
    isActive: boolean;
    trackScaleId: number | null;
    startedAt: number | null;

    startPractice: (notes: NoteName[]) => void;
    checkNote: (note: NoteName) => boolean;
    reset: () => void;
    setTrackScaleId: (id: number | null) => void;
}

export const usePracticeStore = create<PracticeStore>((set, get) => ({
    expectedNotes: [],
    currentStep: 0,
    hitNotes: [],
    isActive: false,
    trackScaleId: null,
    startedAt: null,

    startPractice: (notes) => set({
        expectedNotes: notes,
        currentStep: 0,
        hitNotes: new Array(notes.length).fill(false),
        isActive: true,
        startedAt: Date.now(),
    }),

    checkNote: (note) => {
        const { expectedNotes, currentStep, hitNotes, isActive } = get();
        if (!isActive || expectedNotes.length === 0) return false;

        // Restart: playing root when past step 0 (including after completion)
        if (currentStep > 0 && note === expectedNotes[0]) {
            set({
                currentStep: 1,
                hitNotes: expectedNotes.map((_, i) => i === 0),
                startedAt: Date.now(),
            });
            return true;
        }

        // Practice complete, only restart via root above
        if (currentStep >= expectedNotes.length) return false;

        // Check if detected note matches expected next note
        if (note === expectedNotes[currentStep]) {
            const newHitNotes = [...hitNotes];
            newHitNotes[currentStep] = true;
            set({
                currentStep: currentStep + 1,
                hitNotes: newHitNotes,
            });
            return true;
        }

        return false;
    },

    reset: () => set({
        expectedNotes: [],
        currentStep: 0,
        hitNotes: [],
        isActive: false,
        startedAt: null,
    }),

    setTrackScaleId: (id) => set({ trackScaleId: id }),
}));
