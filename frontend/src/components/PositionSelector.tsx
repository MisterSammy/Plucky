import { useScaleStore } from '@/stores/scaleStore';
import { useFretboardPositions } from '@/hooks/useFretboardPositions';

export default function PositionSelector() {
  const { selectedPosition, setPosition } = useScaleStore();
  const { availablePositions } = useFretboardPositions();

  if (availablePositions.length === 0) return null;

  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wider text-label mb-2">
        Position
        {selectedPosition != null && availablePositions[selectedPosition] && (
          <span className="ml-2 text-xs font-normal text-gray-500">
            Frets {availablePositions[selectedPosition].startFret}–{availablePositions[selectedPosition].endFret}
          </span>
        )}
      </label>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setPosition(null)}
          className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
            selectedPosition === null
              ? 'bg-accent text-white'
              : 'bg-surface text-gray-400 hover:text-gray-200'
          }`}
          aria-label="Show all positions"
          aria-pressed={selectedPosition === null}
        >
          All
        </button>
        {availablePositions.map((pos) => (
          <button
            key={pos.index}
            onClick={() => setPosition(pos.index)}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
              selectedPosition === pos.index
                ? 'bg-accent text-white'
                : 'bg-surface text-gray-400 hover:text-gray-200'
            }`}
            aria-label={`${pos.label}, frets ${pos.startFret} to ${pos.endFret}`}
            aria-pressed={selectedPosition === pos.index}
          >
            {pos.label}
          </button>
        ))}
      </div>
    </div>
  );
}
