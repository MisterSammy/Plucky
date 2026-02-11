import { describe, it, expect } from 'vitest';
import { normalizeToSharp, CHROMATIC_SHARPS } from './noteUtils';

describe('normalizeToSharp', () => {
    it('returns natural notes unchanged', () => {
        expect(normalizeToSharp('C')).toBe('C');
        expect(normalizeToSharp('D')).toBe('D');
        expect(normalizeToSharp('E')).toBe('E');
        expect(normalizeToSharp('F')).toBe('F');
        expect(normalizeToSharp('G')).toBe('G');
        expect(normalizeToSharp('A')).toBe('A');
        expect(normalizeToSharp('B')).toBe('B');
    });

    it('returns sharp notes unchanged', () => {
        expect(normalizeToSharp('C#')).toBe('C#');
        expect(normalizeToSharp('F#')).toBe('F#');
        expect(normalizeToSharp('G#')).toBe('G#');
    });

    it('converts flats to sharps', () => {
        expect(normalizeToSharp('Db')).toBe('C#');
        expect(normalizeToSharp('Eb')).toBe('D#');
        expect(normalizeToSharp('Gb')).toBe('F#');
        expect(normalizeToSharp('Ab')).toBe('G#');
        expect(normalizeToSharp('Bb')).toBe('A#');
    });

    it('handles notes with octave numbers', () => {
        expect(normalizeToSharp('Bb4')).toBe('A#');
        expect(normalizeToSharp('C#3')).toBe('C#');
        expect(normalizeToSharp('Eb5')).toBe('D#');
    });

    it('handles enharmonic edge cases', () => {
        expect(normalizeToSharp('Cb')).toBe('B');
        expect(normalizeToSharp('Fb')).toBe('E');
    });
});

describe('CHROMATIC_SHARPS', () => {
    it('has 12 notes', () => {
        expect(CHROMATIC_SHARPS).toHaveLength(12);
    });

    it('starts with C and ends with B', () => {
        expect(CHROMATIC_SHARPS[0]).toBe('C');
        expect(CHROMATIC_SHARPS[11]).toBe('B');
    });

    it('contains no flats', () => {
        for (const note of CHROMATIC_SHARPS) {
            expect(note).not.toContain('b');
        }
    });
});
