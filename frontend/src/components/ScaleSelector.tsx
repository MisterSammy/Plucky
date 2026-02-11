import { useEffect } from 'react';
import { useScaleStore } from '@/stores/scaleStore';
import { SCALES, SCALE_BY_ID } from '@/data/scales';
import { GENRES } from '@/data/genres';
import type { ScaleCategory } from '@/types';

const CATEGORY_LABELS: Record<ScaleCategory, string> = {
  major: 'Major / Minor',
  minor: 'Major / Minor',
  pentatonic: 'Pentatonic & Blues',
  blues: 'Pentatonic & Blues',
  modal: 'Modes',
  'melodic-minor-mode': 'Melodic Minor Modes',
  'harmonic-minor-mode': 'Harmonic Minor Modes',
  exotic: 'Exotic',
  jazz: 'Jazz & Bebop',
};

const CATEGORY_ORDER: string[] = ['Major / Minor', 'Pentatonic & Blues', 'Modes', 'Melodic Minor Modes', 'Harmonic Minor Modes', 'Exotic', 'Jazz & Bebop'];

export default function ScaleSelector() {
  const { selectedScaleId, setScale, selectedGenreId } = useScaleStore();

  const genre = selectedGenreId ? GENRES.find((g) => g.id === selectedGenreId) : null;
  const filteredScales = genre
    ? SCALES.filter((s) => genre.scaleIds.includes(s.id))
    : SCALES;

  // Auto-select first scale in genre if current scale is not in the filtered list
  useEffect(() => {
    if (filteredScales.length > 0 && !filteredScales.some((s) => s.id === selectedScaleId)) {
      setScale(filteredScales[0].id);
    }
  }, [selectedGenreId, filteredScales, selectedScaleId, setScale]);

  const grouped = new Map<string, typeof filteredScales>();
  for (const scale of filteredScales) {
    const label = CATEGORY_LABELS[scale.category];
    if (!grouped.has(label)) grouped.set(label, []);
    grouped.get(label)!.push(scale);
  }

  const selectedScale = SCALE_BY_ID[selectedScaleId];

  return (
    <div>
      <label htmlFor="scale-select" className="block text-xs font-medium uppercase tracking-wider text-label mb-2">
        Scale
      </label>
      <div className="relative">
        <select
          id="scale-select"
          value={selectedScaleId}
          onChange={(e) => setScale(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-gray-700 bg-surface text-gray-100 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent pr-8"
        >
          {CATEGORY_ORDER.map((catLabel) => {
            const scales = grouped.get(catLabel);
            if (!scales || scales.length === 0) return null;
            return (
              <optgroup key={catLabel} label={catLabel}>
                {scales.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
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
      {selectedScale && (
        <p className="mt-1.5 text-xs text-label">{selectedScale.description}</p>
      )}
    </div>
  );
}
