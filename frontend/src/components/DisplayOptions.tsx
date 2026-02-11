import { useScaleStore } from '@/stores/scaleStore';
import type { NoteRangeMode } from '@/types';

export default function DisplayOptions() {
  const { showAllNotes, setShowAllNotes, highlightRoot, setHighlightRoot, showFingers, setShowFingers, noteRangeMode, setNoteRangeMode, mode, instrument } = useScaleStore();

  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wider text-label mb-2">Display</label>
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showAllNotes}
            onChange={(e) => setShowAllNotes(e.target.checked)}
            className="rounded bg-surface border-gray-600 text-green-500 focus:ring-accent"
          />
          <span className="text-sm text-gray-300">Show all notes</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={highlightRoot}
            onChange={(e) => setHighlightRoot(e.target.checked)}
            className="rounded bg-surface border-gray-600 text-green-500 focus:ring-accent"
          />
          <span className="text-sm text-gray-300">Highlight root</span>
        </label>
        {mode === 'scales' && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300 whitespace-nowrap">Note range</label>
            <select
              value={noteRangeMode}
              onChange={(e) => setNoteRangeMode(e.target.value as NoteRangeMode)}
              className="flex-1 text-sm bg-surface border border-gray-600 rounded px-2 py-1 text-gray-300 focus:ring-accent"
            >
              <option value="all">All notes</option>
              <option value="fromRoot">From root</option>
              <option value="rootToRoot">Root to root</option>
            </select>
          </div>
        )}
        {mode === 'chords' && instrument === 'guitar' && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showFingers}
              onChange={(e) => setShowFingers(e.target.checked)}
              className="rounded bg-surface border-gray-600 text-green-500 focus:ring-accent"
            />
            <span className="text-sm text-gray-300">Show fingers</span>
          </label>
        )}
      </div>
    </div>
  );
}
