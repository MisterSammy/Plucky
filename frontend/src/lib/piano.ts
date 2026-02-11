import { Note, Scale, Interval } from 'tonal';
import type { NoteName, NoteWithOctave, PianoKeyPosition } from '@/types';

const CHROMATIC_SHARPS: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const BLACK_KEY_NOTES = new Set<NoteName>(['C#', 'D#', 'F#', 'G#', 'A#']);

export const WHITE_KEY_WIDTH = 36;
export const BLACK_KEY_WIDTH = 22;
export const WHITE_KEY_HEIGHT = 140;
export const BLACK_KEY_HEIGHT = 90;
export const PIANO_TOP_PADDING = 20;

export function isBlackKey(note: NoteName): boolean {
    return BLACK_KEY_NOTES.has(note);
}

function normalizeToSharp(noteName: string): NoteName {
    const simplified = Note.simplify(noteName);
    const enharmonic = Note.enharmonic(simplified);
    const pc = Note.pitchClass(simplified);
    if (CHROMATIC_SHARPS.includes(pc as NoteName)) return pc as NoteName;
    const enPc = Note.pitchClass(enharmonic);
    if (CHROMATIC_SHARPS.includes(enPc as NoteName)) return enPc as NoteName;
    const midi = Note.midi(noteName);
    if (midi !== null) return CHROMATIC_SHARPS[midi % 12];
    return pc as NoteName;
}

export function getAllPianoKeys(startOctave: number, endOctave: number): {
    midi: number;
    note: NoteName;
    noteWithOctave: NoteWithOctave;
    frequency: number;
    isBlackKey: boolean;
    octave: number;
}[] {
    const keys: {
        midi: number;
        note: NoteName;
        noteWithOctave: NoteWithOctave;
        frequency: number;
        isBlackKey: boolean;
        octave: number;
    }[] = [];

    for (let octave = startOctave; octave <= endOctave; octave++) {
        for (const noteName of CHROMATIC_SHARPS) {
            const noteWithOctave = `${noteName}${octave}` as NoteWithOctave;
            const midi = Note.midi(noteWithOctave);
            const frequency = Note.freq(noteWithOctave);
            if (midi === null || frequency === null) continue;
            keys.push({
                midi,
                note: noteName,
                noteWithOctave,
                frequency,
                isBlackKey: isBlackKey(noteName),
                octave,
            });
        }
    }

    return keys;
}

export function getPianoScalePositions(
    root: NoteName,
    scaleTonalName: string,
    startOctave: number,
    endOctave: number
): PianoKeyPosition[] {
    const scaleData = Scale.get(`${root} ${scaleTonalName}`);
    if (!scaleData.notes.length) return [];

    const scaleNotes = scaleData.notes.map(normalizeToSharp);
    const allKeys = getAllPianoKeys(startOctave, endOctave);
    const result: PianoKeyPosition[] = [];

    for (const key of allKeys) {
        const noteIdx = scaleNotes.indexOf(key.note);
        if (noteIdx === -1) continue;

        const interval = Interval.distance(root, key.note) || scaleData.intervals[noteIdx] || '1P';
        const degree = noteIdx + 1;

        result.push({
            midi: key.midi,
            note: key.note,
            noteWithOctave: key.noteWithOctave,
            frequency: key.frequency,
            interval,
            degree,
            isRoot: key.note === root,
            isBlackKey: key.isBlackKey,
            octave: key.octave,
        });
    }

    return result;
}

export function whiteKeyIndex(midi: number, startMidi: number): number {
    // Count white keys from startMidi to this midi
    let count = 0;
    for (let m = startMidi; m < midi; m++) {
        const note = CHROMATIC_SHARPS[m % 12];
        if (!isBlackKey(note)) count++;
    }
    return count;
}

export function pianoKeyX(midi: number, startMidi: number): number {
    const note = CHROMATIC_SHARPS[midi % 12];
    if (!isBlackKey(note)) {
        return whiteKeyIndex(midi, startMidi) * WHITE_KEY_WIDTH;
    }
    // Black key: center between adjacent white keys
    const leftWhiteIdx = whiteKeyIndex(midi - 1, startMidi);
    return (leftWhiteIdx + 1) * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2;
}

export function countWhiteKeys(startOctave: number, endOctave: number): number {
    let count = 0;
    for (let octave = startOctave; octave <= endOctave; octave++) {
        for (const note of CHROMATIC_SHARPS) {
            if (!isBlackKey(note)) count++;
        }
    }
    return count;
}
