import { useScaleStore } from '@/stores/scaleStore';
import { useFretboardPositions } from '@/hooks/useFretboardPositions';
import { usePianoPositions } from '@/hooks/usePianoPositions';

export default function PositionSelector() {
  const { selectedPosition, setPosition, mode, instrument } = useScaleStore();
  const fretboard = useFretboardPositions();
  const piano = usePianoPositions();

  const isPiano = instrument === 'piano';
  const availablePositions = isPiano && mode === 'chords'
    ? piano.availableVoicings
    : fretboard.availablePositions;

  if (availablePositions.length === 0) return null;

  const posLabel = mode === 'chords' ? 'Voicing' : 'Position';

  // Bounds-clamp for display
  const activePosition = selectedPosition != null && selectedPosition < availablePositions.length
    ? selectedPosition
    : null;

  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wider text-label mb-2">
        {posLabel}
        {activePosition != null && availablePositions[activePosition] && (
          <span className="ml-2 text-xs font-normal text-gray-500">
            {isPiano && mode === 'chords'
              ? `Oct ${availablePositions[activePosition].startFret}`
              : `Frets ${availablePositions[activePosition].startFret}–${availablePositions[activePosition].endFret}`
            }
          </span>
        )}
      </label>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setPosition(null)}
          className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
            activePosition === null
              ? 'bg-accent text-white'
              : 'bg-surface text-gray-400 hover:text-gray-200'
          }`}
          aria-label={`Show all ${mode === 'chords' ? 'voicings' : 'positions'}`}
          aria-pressed={activePosition === null}
        >
          All
        </button>
        {availablePositions.map((pos) => (
          <button
            key={pos.index}
            onClick={() => setPosition(pos.index)}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
              activePosition === pos.index
                ? 'bg-accent text-white'
                : 'bg-surface text-gray-400 hover:text-gray-200'
            }`}
            aria-label={pos.label}
            aria-pressed={activePosition === pos.index}
          >
            {pos.label}
          </button>
        ))}
      </div>
    </div>
  );
}
