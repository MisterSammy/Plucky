import { usePracticeStore } from '@/stores/practiceStore';
import { useScaleStore } from '@/stores/scaleStore';

export default function PracticeProgress() {
  const { isActive, expectedNotes, displayNotes, hitNotes, currentStep } = usePracticeStore();
  const practiceDirection = useScaleStore(s => s.practiceDirection);
  const setPracticeDirection = useScaleStore(s => s.setPracticeDirection);

  if (!isActive || expectedNotes.length === 0) return null;

  const isComplete = currentStep >= expectedNotes.length;
  const isDescending = practiceDirection === 'descending';

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
      <div className="flex gap-1">
        {expectedNotes.map((note, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              hitNotes[i]
                ? 'bg-green-500 text-white'
                : i === currentStep
                  ? 'bg-amber-900/50 text-amber-400 ring-2 ring-amber-400'
                  : 'bg-surface text-gray-400'
            }`}
          >
            {hitNotes[i] ? '\u2713' : (displayNotes[i] ?? note)}
          </div>
        ))}
      </div>
      {isComplete && (
        <span className="text-xs font-medium text-green-400">Complete!</span>
      )}
    </div>
  );
}
