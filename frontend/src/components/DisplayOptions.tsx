import { useScaleStore } from '@/stores/scaleStore';

export default function DisplayOptions() {
  const { showAllNotes, setShowAllNotes, highlightRoot, setHighlightRoot } = useScaleStore();

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
      </div>
    </div>
  );
}
