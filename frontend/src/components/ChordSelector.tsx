import { useEffect } from 'react';
import { useScaleStore } from '@/stores/scaleStore';
import { CHORDS, CHORD_BY_ID } from '@/data/chords';
import { GENRES } from '@/data/genres';
import type { ChordCategory } from '@/types';

const CATEGORY_LABELS: Record<ChordCategory, string> = {
    major: 'Major',
    minor: 'Minor',
    dominant: 'Dominant',
    suspended: 'Suspended',
    diminished: 'Diminished',
    augmented: 'Augmented',
    altered: 'Altered',
};

const CATEGORY_ORDER: string[] = ['Major', 'Minor', 'Dominant', 'Suspended', 'Diminished', 'Augmented', 'Altered'];

export default function ChordSelector() {
    const { selectedChordId, setChord, selectedGenreId } = useScaleStore();

    const genre = selectedGenreId ? GENRES.find((g) => g.id === selectedGenreId) : null;
    const filteredChords = genre
        ? CHORDS.filter((c) => genre.chordIds.includes(c.id))
        : CHORDS;

    useEffect(() => {
        if (filteredChords.length > 0 && !filteredChords.some((c) => c.id === selectedChordId)) {
            setChord(filteredChords[0].id);
        }
    }, [selectedGenreId, filteredChords, selectedChordId, setChord]);

    const grouped = new Map<string, typeof filteredChords>();
    for (const chord of filteredChords) {
        const label = CATEGORY_LABELS[chord.category];
        if (!grouped.has(label)) grouped.set(label, []);
        grouped.get(label)!.push(chord);
    }

    const selectedChord = CHORD_BY_ID[selectedChordId];

    return (
        <div>
            <label htmlFor="chord-select" className="block text-xs font-medium uppercase tracking-wider text-label mb-2">
                Chord
            </label>
            <div className="relative">
                <select
                    id="chord-select"
                    value={selectedChordId}
                    onChange={(e) => setChord(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-700 bg-surface text-gray-100 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent pr-8"
                >
                    {CATEGORY_ORDER.map((catLabel) => {
                        const chords = grouped.get(catLabel);
                        if (!chords || chords.length === 0) return null;
                        return (
                            <optgroup key={catLabel} label={catLabel}>
                                {chords.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </optgroup>
                        );
                    })}
                </select>
                <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </div>
            {selectedChord && (
                <p className="mt-1.5 text-xs text-label">{selectedChord.description}</p>
            )}
        </div>
    );
}
