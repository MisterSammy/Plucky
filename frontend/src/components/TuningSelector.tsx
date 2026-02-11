import { useScaleStore } from '@/stores/scaleStore';
import { TUNINGS } from '@/data/tunings';
import { GENRES } from '@/data/genres';

export default function TuningSelector() {
  const { selectedTuningId, setTuning, selectedGenreId } = useScaleStore();

  const genre = selectedGenreId ? GENRES.find((g) => g.id === selectedGenreId) : null;
  const suggestedIds = genre ? genre.suggestedTunings : [];

  const suggested = TUNINGS.filter((t) => suggestedIds.includes(t.id));
  const others = TUNINGS.filter((t) => !suggestedIds.includes(t.id));

  return (
    <div>
      <label htmlFor="tuning-select" className="block text-xs font-medium uppercase tracking-wider text-label mb-2">
        Tuning
      </label>
      <div className="relative">
        <select
          id="tuning-select"
          value={selectedTuningId}
          onChange={(e) => setTuning(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-gray-700 bg-surface text-gray-100 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent pr-8"
        >
          {suggested.length > 0 && (
            <optgroup label="Suggested">
              {suggested.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.notes.map((n) => n.replace(/\d+$/, '')).join(' ')}
                </option>
              ))}
            </optgroup>
          )}
          {suggested.length > 0 && others.length > 0 ? (
            <optgroup label="Other Tunings">
              {others.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.notes.map((n) => n.replace(/\d+$/, '')).join(' ')}
                </option>
              ))}
            </optgroup>
          ) : (
            TUNINGS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.notes.map((n) => n.replace(/\d+$/, '')).join(' ')}
              </option>
            ))
          )}
          <option value="custom">Custom...</option>
        </select>
        <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
