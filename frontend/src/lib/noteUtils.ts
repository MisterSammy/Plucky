import { Note } from 'tonal';
import type { NoteName } from '@/types';

export const CHROMATIC_SHARPS: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function normalizeToSharp(noteName: string): NoteName {
    const simplified = Note.simplify(noteName);
    const enharmonic = Note.enharmonic(simplified);
    const pc = Note.pitchClass(simplified);
    if (CHROMATIC_SHARPS.includes(pc as NoteName)) {
        return pc as NoteName;
    }
    const enPc = Note.pitchClass(enharmonic);
    if (CHROMATIC_SHARPS.includes(enPc as NoteName)) {
        return enPc as NoteName;
    }
    const midi = Note.midi(noteName);
    if (midi !== null) {
        const idx = midi % 12;
        return CHROMATIC_SHARPS[idx];
    }
    return pc as NoteName;
}
