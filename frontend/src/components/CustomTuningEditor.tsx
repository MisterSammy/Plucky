import { useState, useEffect } from 'react';
import { useScaleStore } from '@/stores/scaleStore';
import type { NoteName, NoteWithOctave, TuningPreset } from '@/types';

const NOTES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = [1, 2, 3, 4, 5, 6];
const STRING_LABELS = ['1st (High E)', '2nd (B)', '3rd (G)', '4th (D)', '5th (A)', '6th (Low E)'];
const DEFAULT_NOTES: [NoteName, number][] = [
  ['E', 4], ['B', 3], ['G', 3], ['D', 3], ['A', 2], ['E', 2],
];

export default function CustomTuningEditor() {
  const { setCustomTuning } = useScaleStore();
  const [strings, setStrings] = useState<[NoteName, number][]>(DEFAULT_NOTES);

  useEffect(() => {
    const notes = strings.map(([n, o]) => `${n}${o}` as NoteWithOctave) as TuningPreset['notes'];
    setCustomTuning({
      id: 'custom',
      name: 'Custom',
      notes,
      description: 'User-defined tuning',
      isCustom: true,
    });
  }, [strings, setCustomTuning]);

  const updateString = (idx: number, note?: NoteName, octave?: number) => {
    setStrings((prev) => {
      const next = [...prev] as [NoteName, number][];
      if (note !== undefined) next[idx] = [note, prev[idx][1]];
      if (octave !== undefined) next[idx] = [prev[idx][0], octave];
      return next;
    });
  };

  return (
    <div className="bg-surface rounded-lg border border-gray-800 p-4">
      <h3 className="text-sm font-semibold text-gray-100 mb-3">Custom Tuning</h3>
      <div className="space-y-2">
        {STRING_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-28">{label}</span>
            <select
              value={strings[i][0]}
              onChange={(e) => updateString(i, e.target.value as NoteName)}
              className="px-2 py-1 text-sm rounded border border-gray-700 bg-surface text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label={`${label} note`}
            >
              {NOTES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <select
              value={strings[i][1]}
              onChange={(e) => updateString(i, undefined, parseInt(e.target.value))}
              className="px-2 py-1 text-sm rounded border border-gray-700 bg-surface text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label={`${label} octave`}
            >
              {OCTAVES.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
