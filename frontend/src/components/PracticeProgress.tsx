import { usePracticeStore } from '@/stores/practiceStore';

export default function PracticeProgress() {
  const { isActive, expectedNotes, hitNotes, currentStep } = usePracticeStore();

  if (!isActive || expectedNotes.length === 0) return null;

  const isComplete = currentStep >= expectedNotes.length;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-label">Practice</span>
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
            {hitNotes[i] ? '\u2713' : note}
          </div>
        ))}
      </div>
      {isComplete && (
        <span className="text-xs font-medium text-green-400">Complete!</span>
      )}
    </div>
  );
}
