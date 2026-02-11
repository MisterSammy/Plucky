import { describe, it, expect } from 'vitest';
import {
    buildNotesFromFretPositions,
    buildNotesFromPianoPositions,
    buildDefaultNotes,
    buildChordStrumNotes,
    buildChordPianoNotes,
    buildDefaultChordNotes,
} from './noteSequence';
import type { FretPosition, PianoKeyPosition } from '@/types';

function makeFretPosition(overrides: Partial<FretPosition> & { midi: number; noteWithOctave: string; note: string }): FretPosition {
    return {
        string: 0,
        fret: 0,
        frequency: 440,
        interval: '1P',
        degree: 1,
        isRoot: false,
        ...overrides,
    } as FretPosition;
}

function makePianoPosition(overrides: Partial<PianoKeyPosition> & { midi: number; noteWithOctave: string; note: string }): PianoKeyPosition {
    return {
        frequency: 440,
        interval: '1P',
        degree: 1,
        isRoot: false,
        isBlackKey: false,
        octave: 4,
        ...overrides,
    } as PianoKeyPosition;
}

describe('buildNotesFromFretPositions', () => {
    it('returns empty array for empty input', () => {
        expect(buildNotesFromFretPositions([])).toEqual([]);
    });

    it('deduplicates by MIDI and builds ascending then descending', () => {
        const positions: FretPosition[] = [
            makeFretPosition({ midi: 60, noteWithOctave: 'C4', note: 'C', isRoot: true, degree: 1 }),
            makeFretPosition({ midi: 62, noteWithOctave: 'D4', note: 'D', degree: 2 }),
            makeFretPosition({ midi: 64, noteWithOctave: 'E4', note: 'E', degree: 3 }),
            makeFretPosition({ midi: 60, noteWithOctave: 'C4', note: 'C', string: 1, isRoot: true, degree: 1 }), // duplicate MIDI
        ];
        const result = buildNotesFromFretPositions(positions);
        // Ascending from root, then descending (skips top note, includes root again)
        expect(result).toEqual(['C4', 'D4', 'E4', 'D4', 'C4']);
    });

    it('starts from root note', () => {
        const positions: FretPosition[] = [
            makeFretPosition({ midi: 57, noteWithOctave: 'A3', note: 'A', degree: 6 }),
            makeFretPosition({ midi: 60, noteWithOctave: 'C4', note: 'C', isRoot: true, degree: 1 }),
            makeFretPosition({ midi: 64, noteWithOctave: 'E4', note: 'E', degree: 3 }),
        ];
        const result = buildNotesFromFretPositions(positions);
        // Starts from root C4, ascending to E4, then descending
        expect(result[0]).toBe('C4');
    });
});

describe('buildNotesFromPianoPositions', () => {
    it('returns empty array for empty input', () => {
        expect(buildNotesFromPianoPositions([])).toEqual([]);
    });

    it('builds ascending then descending', () => {
        const positions: PianoKeyPosition[] = [
            makePianoPosition({ midi: 60, noteWithOctave: 'C4', note: 'C', isRoot: true }),
            makePianoPosition({ midi: 62, noteWithOctave: 'D4', note: 'D', degree: 2 }),
            makePianoPosition({ midi: 64, noteWithOctave: 'E4', note: 'E', degree: 3 }),
        ];
        const result = buildNotesFromPianoPositions(positions);
        // Ascending from root, then descending (skips top note, includes root again)
        expect(result).toEqual(['C4', 'D4', 'E4', 'D4', 'C4']);
    });
});

describe('buildDefaultNotes', () => {
    it('builds C major scale with ascending and descending', () => {
        const result = buildDefaultNotes('C', 'major');
        expect(result.length).toBeGreaterThan(0);
        // Should end with root an octave down
        expect(result[0]).toBe('C3');
        // Should contain the octave-up root
        expect(result).toContain('C4');
    });

    it('returns empty for invalid scale', () => {
        expect(buildDefaultNotes('C', 'nonexistent_scale_xyz')).toEqual([]);
    });
});

describe('buildChordStrumNotes', () => {
    it('picks one note per string, lowest fret, sorted low to high pitch', () => {
        const positions: FretPosition[] = [
            makeFretPosition({ string: 5, fret: 3, midi: 43, noteWithOctave: 'G2', note: 'G' }),
            makeFretPosition({ string: 5, fret: 5, midi: 45, noteWithOctave: 'A2', note: 'A' }),
            makeFretPosition({ string: 4, fret: 2, midi: 47, noteWithOctave: 'B2', note: 'B' }),
            makeFretPosition({ string: 3, fret: 0, midi: 55, noteWithOctave: 'G3', note: 'G' }),
        ];
        const result = buildChordStrumNotes(positions);
        // Should pick lowest fret per string, sorted high string number first (low pitch)
        expect(result).toHaveLength(3); // 3 unique strings
        expect(result[0]).toBe('G2');  // string 5, fret 3
        expect(result[1]).toBe('B2');  // string 4
        expect(result[2]).toBe('G3');  // string 3
    });
});

describe('buildChordPianoNotes', () => {
    it('returns one octave of chord tones starting from root', () => {
        const positions: PianoKeyPosition[] = [
            makePianoPosition({ midi: 48, noteWithOctave: 'C3', note: 'C', degree: 1, isRoot: true }),
            makePianoPosition({ midi: 52, noteWithOctave: 'E3', note: 'E', degree: 3 }),
            makePianoPosition({ midi: 55, noteWithOctave: 'G3', note: 'G', degree: 5 }),
            makePianoPosition({ midi: 60, noteWithOctave: 'C4', note: 'C', degree: 1, isRoot: true }),
            makePianoPosition({ midi: 64, noteWithOctave: 'E4', note: 'E', degree: 3 }),
        ];
        const result = buildChordPianoNotes(positions);
        expect(result).toEqual(['C3', 'E3', 'G3']);
    });
});

describe('buildDefaultChordNotes', () => {
    it('builds C major chord notes', () => {
        const result = buildDefaultChordNotes('C', 'major');
        expect(result.length).toBeGreaterThan(0);
        expect(result[0]).toBe('C3');
    });

    it('returns empty for invalid chord', () => {
        expect(buildDefaultChordNotes('C', 'nonexistent_chord_xyz')).toEqual([]);
    });
});
