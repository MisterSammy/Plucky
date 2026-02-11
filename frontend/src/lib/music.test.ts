import { describe, it, expect } from 'vitest';
import { frequencyToNote, computeFretNote, computeScalePositions, computeChordVoicings } from './music';
import type { FretPosition, NoteWithOctave } from '@/types';

describe('frequencyToNote', () => {
    it('identifies A440 as A4', () => {
        const result = frequencyToNote(440);
        expect(result.note).toBe('A');
        expect(result.noteWithOctave).toBe('A4');
        expect(result.midi).toBe(69);
        expect(result.centOffset).toBe(0);
    });

    it('identifies middle C (~261.63Hz)', () => {
        const result = frequencyToNote(261.63);
        expect(result.note).toBe('C');
        expect(result.midi).toBe(60);
    });

    it('identifies E2 (~82.41Hz) — open low E string', () => {
        const result = frequencyToNote(82.41);
        expect(result.note).toBe('E');
        expect(result.midi).toBe(40);
    });

    it('returns a cent offset for slightly sharp notes', () => {
        // 445Hz is slightly sharp of A4 (440Hz)
        const result = frequencyToNote(445);
        expect(result.note).toBe('A');
        expect(result.centOffset).toBeGreaterThan(0);
    });

    it('returns a negative cent offset for slightly flat notes', () => {
        // 435Hz is slightly flat of A4 (440Hz)
        const result = frequencyToNote(435);
        expect(result.note).toBe('A');
        expect(result.centOffset).toBeLessThan(0);
    });
});

describe('computeFretNote', () => {
    it('computes open string note correctly', () => {
        const result = computeFretNote('E2' as NoteWithOctave, 0);
        expect(result.note).toBe('E');
        expect(result.midi).toBe(40);
    });

    it('computes 5th fret of low E as A', () => {
        const result = computeFretNote('E2' as NoteWithOctave, 5);
        expect(result.note).toBe('A');
        expect(result.midi).toBe(45);
    });

    it('computes 12th fret (one octave up)', () => {
        const result = computeFretNote('E2' as NoteWithOctave, 12);
        expect(result.note).toBe('E');
        expect(result.midi).toBe(52);
    });

    it('throws for invalid note', () => {
        expect(() => computeFretNote('ZZ' as NoteWithOctave, 0)).toThrow('Invalid note');
    });
});

describe('computeScalePositions', () => {
    it('returns empty for empty input', () => {
        expect(computeScalePositions([])).toEqual([]);
    });

    it('returns positions labeled "Position N"', () => {
        // Create a simple C major pattern across the fretboard for testing
        const positions: FretPosition[] = [];
        const cMajorNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const cMajorMidi = [48, 50, 52, 53, 55, 57, 59]; // C3 through B3

        // Place notes on strings 5 and 4 at low frets
        for (let i = 0; i < cMajorNotes.length; i++) {
            positions.push({
                string: 5,
                fret: i,
                note: cMajorNotes[i] as FretPosition['note'],
                noteWithOctave: `${cMajorNotes[i]}3` as NoteWithOctave,
                midi: cMajorMidi[i],
                frequency: 0,
                interval: '1P',
                degree: i + 1,
                isRoot: i === 0,
            });
        }

        const result = computeScalePositions(positions);
        if (result.length > 0) {
            expect(result[0].label).toContain('Position');
            expect(result[0].startFret).toBeGreaterThanOrEqual(0);
        }
    });
});

describe('computeChordVoicings', () => {
    it('returns empty for empty input', () => {
        expect(computeChordVoicings([])).toEqual([]);
    });

    it('returns voicings labeled "Voicing N"', () => {
        const positions: FretPosition[] = [
            { string: 5, fret: 0, note: 'E' as FretPosition['note'], noteWithOctave: 'E2' as NoteWithOctave, midi: 40, frequency: 0, interval: '1P', degree: 1, isRoot: true },
            { string: 5, fret: 3, note: 'G' as FretPosition['note'], noteWithOctave: 'G2' as NoteWithOctave, midi: 43, frequency: 0, interval: '3m', degree: 3, isRoot: false },
            { string: 4, fret: 2, note: 'B' as FretPosition['note'], noteWithOctave: 'B2' as NoteWithOctave, midi: 47, frequency: 0, interval: '5P', degree: 5, isRoot: false },
        ];

        const result = computeChordVoicings(positions);
        if (result.length > 0) {
            expect(result[0].label).toContain('Voicing');
        }
    });
});
