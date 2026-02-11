import { Scale, Chord, Note } from 'tonal';
import type { FretPosition, PianoKeyPosition } from '@/types';

export function buildNotesFromFretPositions(positions: FretPosition[]): string[] {
    // Deduplicate by MIDI value (same pitch on different strings)
    const seen = new Set<number>();
    const unique: FretPosition[] = [];
    for (const p of positions) {
        if (!seen.has(p.midi)) {
            seen.add(p.midi);
            unique.push(p);
        }
    }

    unique.sort((a, b) => a.midi - b.midi);
    if (unique.length === 0) return [];

    // Start from the first root note, play up to the highest note, then back down
    const rootIdx = unique.findIndex(p => p.isRoot);
    const startIdx = rootIdx >= 0 ? rootIdx : 0;

    const ascending = unique.slice(startIdx);
    const descending = [...ascending].reverse().slice(1);

    return [...ascending, ...descending].map(p => p.noteWithOctave);
}

export function buildNotesFromPianoPositions(positions: PianoKeyPosition[]): string[] {
    const sorted = [...positions].sort((a, b) => a.midi - b.midi);
    if (sorted.length === 0) return [];

    const rootIdx = sorted.findIndex(p => p.isRoot);
    const startIdx = rootIdx >= 0 ? rootIdx : 0;

    const ascending = sorted.slice(startIdx);
    const descending = [...ascending].reverse().slice(1);

    return [...ascending, ...descending].map(p => p.noteWithOctave);
}

export function buildDefaultNotes(selectedRoot: string, scaleTonalName: string): string[] {
    const scaleData = Scale.get(`${selectedRoot} ${scaleTonalName}`);
    if (!scaleData.notes.length) return [];

    const ascending = scaleData.notes.map((n) => {
        const midi = Note.midi(`${n}3`);
        const rootMidi = Note.midi(`${selectedRoot}3`);
        if (midi !== null && rootMidi !== null && midi < rootMidi) {
            return `${n}4`;
        }
        return `${n}3`;
    });
    // Add the root an octave up
    ascending.push(`${selectedRoot}4`);

    const descending = [...ascending].reverse().slice(1);
    return [...ascending, ...descending];
}

export function buildChordStrumNotes(positions: FretPosition[]): string[] {
    // Pick one note per string for a natural guitar strum
    const byString = new Map<number, FretPosition>();
    for (const p of positions) {
        if (!byString.has(p.string) || p.fret < byString.get(p.string)!.fret) {
            byString.set(p.string, p);
        }
    }
    return [...byString.entries()]
        .sort(([a], [b]) => b - a) // high string number = low pitch, strum low to high
        .map(([, p]) => p.noteWithOctave);
}

export function buildChordPianoNotes(positions: PianoKeyPosition[]): string[] {
    // One octave of chord tones
    const sorted = [...positions].sort((a, b) => a.midi - b.midi);
    const rootIdx = sorted.findIndex(p => p.isRoot);
    const start = rootIdx >= 0 ? rootIdx : 0;
    const uniqueDegrees = new Set(sorted.map(p => p.degree)).size;
    const notes: string[] = [];
    const seenDegrees = new Set<number>();
    for (let i = start; i < sorted.length && notes.length < uniqueDegrees; i++) {
        if (!seenDegrees.has(sorted[i].degree)) {
            seenDegrees.add(sorted[i].degree);
            notes.push(sorted[i].noteWithOctave);
        }
    }
    return notes;
}

export function buildDefaultChordNotes(selectedRoot: string, chordTonalName: string): string[] {
    const chordData = Chord.get(`${selectedRoot} ${chordTonalName}`);
    if (!chordData.notes.length) return [];
    return chordData.notes.map((n) => {
        const midi = Note.midi(`${n}3`);
        const rootMidi = Note.midi(`${selectedRoot}3`);
        if (midi !== null && rootMidi !== null && midi < rootMidi) {
            return `${n}4`;
        }
        return `${n}3`;
    });
}
