import { useScaleStore } from '@/stores/scaleStore';
import type { NoteName } from '@/types';

const CHROMATIC_NOTES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function RootNoteSelector() {
  const { selectedRoot, setRoot } = useScaleStore();

  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wider text-label mb-2">Root Note</label>
      <div className="grid grid-cols-6 gap-1.5">
        {CHROMATIC_NOTES.map((note) => (
          <button
            key={note}
            onClick={() => setRoot(note)}
            className={`aspect-square flex items-center justify-center text-xs rounded-full font-medium transition-colors ${
              selectedRoot === note
                ? 'bg-accent text-white'
                : 'bg-surface text-gray-300 hover:text-white'
            }`}
            aria-label={`Root note ${note}`}
            aria-pressed={selectedRoot === note}
          >
            {note}
          </button>
        ))}
      </div>
    </div>
  );
}
