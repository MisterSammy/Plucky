import guitarDb from '@tombatossals/chords-db/lib/guitar.json';
import { computeFretNote } from '@/lib/music';
import type { NoteName, NoteWithOctave, FretPosition, TuningPreset, PositionRange, ChordDiagram } from '@/types';

// Map our sharp-based NoteName to chords-db object keys
const ROOT_TO_DB_KEY: Record<NoteName, string> = {
    'C': 'C',
    'C#': 'Csharp',
    'D': 'D',
    'D#': 'Eb',
    'E': 'E',
    'F': 'F',
    'F#': 'Fsharp',
    'G': 'G',
    'G#': 'Ab',
    'A': 'A',
    'A#': 'Bb',
    'B': 'B',
};

// Map our chord IDs to chords-db suffixes
const CHORD_DB_SUFFIX: Record<string, string> = {
    'major': 'major',
    'maj7': 'maj7',
    'maj9': 'maj9',
    'maj13': 'maj13',
    'add9': 'add9',
    '6': '6',
    '6/9': '69',
    'minor': 'minor',
    'm7': 'm7',
    'mMaj7': 'mmaj7',
    'm9': 'm9',
    'm11': 'm11',
    'm6': 'm6',
    '7': '7',
    '9': '9',
    '11': '11',
    '13': '13',
    '7b9': '7b9',
    '7sharp9': '7#9',
    'sus4': 'sus4',
    'sus2': 'sus2',
    '7sus4': '7sus4',
    'dim': 'dim',
    'dim7': 'dim7',
    'm7b5': 'm7b5',
    'aug': 'aug',
    'maj7sharp5': 'maj7#5',
    '7sharp5': 'aug7',
    'alt': 'alt',
    '7b5': '7b5',
};

const STANDARD_TUNING_NOTES: NoteWithOctave[] = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

interface DbVoicing {
    frets: number[];
    fingers: number[];
    baseFret: number;
    barres: number[];
    capo?: boolean;
}

interface DbChord {
    key: string;
    suffix: string;
    positions: DbVoicing[];
}

export interface ChordVoicingResult {
    positions: FretPosition[];
    availableVoicings: PositionRange[];
    voicingPositions: FretPosition[][];
    chordDiagrams: (ChordDiagram | null)[];
    isFromDb: boolean;
}

function isStandardTuning(tuning: TuningPreset): boolean {
    return tuning.notes.every((n, i) => n === STANDARD_TUNING_NOTES[5 - i]);
}

function convertDbVoicing(
    voicing: DbVoicing,
    root: NoteName,
    chordNotes: NoteName[],
    intervals: string[]
): { positions: FretPosition[]; diagram: ChordDiagram } {
    const result: FretPosition[] = [];
    const mutedStrings: number[] = [];
    const openStrings: number[] = [];

    // chords-db frets[0] = low E (our string 5), frets[5] = high E (our string 0)
    for (let i = 0; i < 6; i++) {
        const stringIdx = 5 - i; // Convert: DB index 0 → our string 5
        const dbFret = voicing.frets[i];

        if (dbFret === -1) {
            mutedStrings.push(stringIdx);
            continue;
        }

        if (dbFret === 0) {
            openStrings.push(stringIdx);
        }

        const actualFret = dbFret === 0 ? 0 : voicing.baseFret + dbFret - 1;
        const { note, noteWithOctave, midi, frequency } = computeFretNote(
            STANDARD_TUNING_NOTES[5 - stringIdx] as NoteWithOctave,
            actualFret
        );

        const noteIdx = chordNotes.indexOf(note);
        const degree = noteIdx !== -1 ? noteIdx + 1 : 1;
        const interval = noteIdx !== -1 ? intervals[noteIdx] : '1P';
        const finger = voicing.fingers[i];

        result.push({
            string: stringIdx,
            fret: actualFret,
            note,
            noteWithOctave,
            midi,
            frequency,
            interval,
            degree,
            isRoot: note === root,
            finger: finger > 0 ? finger : undefined,
        });
    }

    // Build barre data from the DB barres array
    const barres: ChordDiagram['barres'] = [];
    for (const barreFret of voicing.barres) {
        const actualBarreFret = voicing.baseFret + barreFret - 1;
        // Find strings that are part of this barre (finger matches and fret matches)
        const barreStrings: number[] = [];
        for (let i = 0; i < 6; i++) {
            const dbFret = voicing.frets[i];
            if (dbFret === barreFret) {
                barreStrings.push(5 - i);
            }
        }
        if (barreStrings.length >= 2) {
            barres.push({
                fret: actualBarreFret,
                fromString: Math.min(...barreStrings),
                toString: Math.max(...barreStrings),
            });
        }
    }

    return {
        positions: result,
        diagram: { mutedStrings, openStrings, barres },
    };
}

export function lookupChordVoicings(
    root: NoteName,
    chordId: string,
    chordNotes: NoteName[],
    intervals: string[],
    tuning: TuningPreset
): ChordVoicingResult | null {
    if (!isStandardTuning(tuning)) return null;

    const dbKey = ROOT_TO_DB_KEY[root];
    const dbSuffix = CHORD_DB_SUFFIX[chordId];
    if (!dbKey || !dbSuffix) return null;

    const chords = (guitarDb.chords as Record<string, DbChord[]>)[dbKey];
    if (!chords) return null;

    const chord = chords.find((c) => c.suffix === dbSuffix);
    if (!chord || chord.positions.length === 0) return null;

    const voicingPositions: FretPosition[][] = [];
    const chordDiagrams: (ChordDiagram | null)[] = [];
    const availableVoicings: PositionRange[] = [];

    for (const voicing of chord.positions) {
        const { positions, diagram } = convertDbVoicing(voicing, root, chordNotes, intervals);
        if (positions.length === 0) continue;

        const frets = positions.map((p) => p.fret).filter((f) => f > 0);
        const minFret = frets.length > 0 ? Math.min(...frets) : 0;
        const maxFret = frets.length > 0 ? Math.max(...frets) : 0;

        const idx = voicingPositions.length;
        voicingPositions.push(positions);
        chordDiagrams.push(diagram);
        availableVoicings.push({
            index: idx,
            label: `Voicing ${idx + 1}`,
            startFret: minFret,
            endFret: maxFret,
        });
    }

    if (voicingPositions.length === 0) return null;

    // "All" shows union of all voicing notes
    const allPositions = voicingPositions.flat();
    // Deduplicate by string+fret
    const seen = new Set<string>();
    const positions = allPositions.filter((p) => {
        const key = `${p.string}-${p.fret}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    return {
        positions,
        availableVoicings,
        voicingPositions,
        chordDiagrams,
        isFromDb: true,
    };
}
