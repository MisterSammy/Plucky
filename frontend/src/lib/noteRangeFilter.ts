import type { NoteRangeMode } from '@/types';

export function filterByNoteRange<T extends { midi: number; isRoot: boolean }>(
    positions: T[],
    mode: NoteRangeMode
): T[] {
    if (mode === 'all') return positions;

    const roots = positions.filter(p => p.isRoot);
    if (roots.length < 2) return positions;

    const minRootMidi = Math.min(...roots.map(r => r.midi));
    const maxRootMidi = Math.max(...roots.map(r => r.midi));

    if (mode === 'fromRoot') {
        return positions.filter(p => p.midi >= minRootMidi);
    }

    // rootToRoot
    return positions.filter(p => p.midi >= minRootMidi && p.midi <= maxRootMidi);
}
