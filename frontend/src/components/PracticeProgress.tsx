import { usePracticeStore } from '@/stores/practiceStore';
import { useScaleStore } from '@/stores/scaleStore';

export default function PracticeProgress() {
  const { isActive, expectedNotes, displayNotes, hitNotes, currentStep } = usePracticeStore();
  const practiceDirection = useScaleStore(s => s.practiceDirection);
  const setPracticeDirection = useScaleStore(s => s.setPracticeDirection);
  const practiceOctaves = useScaleStore(s => s.practiceOctaves);

  if (!isActive || expectedNotes.length === 0) return null;

  const isComplete = currentStep >= expectedNotes.length;
  const isDescending = practiceDirection === 'descending';
  const isCompact = expectedNotes.length > 12;

  // For multi-octave, compute octave boundaries (notes per octave = (total - 1) / octaveCount)
  const notesPerOctave = practiceOctaves > 1 ? (expectedNotes.length - 1) / practiceOctaves : 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-label">Practice</span>
      <button
        onClick={() => setPracticeDirection(isDescending ? 'ascending' : 'descending')}
        className="w-6 h-6 rounded flex items-center justify-center text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        title={isDescending ? 'Descending (click for ascending)' : 'Ascending (click for descending)'}
        aria-label={`Practice direction: ${practiceDirection}`}
      >
        {isDescending ? '\u2193' : '\u2191'}
      </button>
      <div className={`flex gap-0.5 ${isCompact ? 'max-w-[320px] overflow-x-auto scrollbar-none' : ''}`}>
        {expectedNotes.map((note, i) => {
          // Show octave separator for multi-octave mode
          const showSep = practiceOctaves > 1
            && notesPerOctave > 0
            && i > 0
            && i < expectedNotes.length - 1
            && i % notesPerOctave === 0;

          return (
            <div key={i} className="flex items-center gap-0.5">
              {showSep && <div className="w-px h-4 bg-gray-600 mx-0.5" />}
              <div
                className={`${isCompact ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-xs'} rounded-full flex items-center justify-center font-medium transition-colors shrink-0 ${
                  hitNotes[i]
                    ? 'bg-green-500 text-white'
                    : i === currentStep
                      ? 'bg-amber-900/50 text-amber-400 ring-2 ring-amber-400'
                      : 'bg-surface text-gray-400'
                }`}
              >
                {hitNotes[i] ? '\u2713' : (displayNotes[i] ?? note)}
              </div>
            </div>
          );
        })}
      </div>
      {isComplete && (
        <span className="text-xs font-medium text-green-400">Complete!</span>
      )}
    </div>
  );
}
