import { usePitchStore } from '@/stores/pitchStore';

export default function PitchDisplay() {
  const { isListening, currentNote, currentNoteWithOctave, centOffset, clarity } = usePitchStore();

  if (!isListening) return null;

  return (
    <div className="flex items-center gap-4 w-[260px]">
      <div className="text-center min-w-[60px]">
        <div className="text-2xl font-bold text-gray-100">
          {currentNoteWithOctave || '\u2014'}
        </div>
        <div className={`text-xs text-label ${currentNote ? 'visible' : 'invisible'}`}>
          {centOffset > 0 ? '+' : ''}{centOffset}{'\u00A2'}
        </div>
      </div>

      <div className={`flex items-center gap-1 ${currentNote ? 'visible' : 'invisible'}`}>
        {/* Cent offset bar */}
        <div className="w-32 h-2 bg-gray-700 rounded-full relative overflow-hidden">
          <div
            className="absolute top-0 h-full bg-green-500 rounded-full transition-all duration-75"
            style={{
              left: '50%',
              width: `${Math.abs(centOffset)}%`,
              transform: centOffset < 0 ? `translateX(-${Math.abs(centOffset)}%)` : 'none',
            }}
          />
          <div className="absolute left-1/2 top-0 w-0.5 h-full bg-gray-500" />
        </div>
        <span className="text-xs text-gray-500 w-8">
          {Math.round(clarity * 100)}%
        </span>
      </div>
    </div>
  );
}
