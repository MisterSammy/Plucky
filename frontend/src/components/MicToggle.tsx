import { usePitchDetection } from '@/hooks/usePitchDetection';

export default function MicToggle() {
  const { isListening, startListening, stopListening, error } = usePitchDetection();

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
          isListening
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-surface text-gray-300 border border-gray-700 hover:text-white'
        }`}
        aria-label={isListening ? 'Stop listening' : 'Enable microphone'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
        {isListening ? 'Listening...' : 'Enable Mic'}
        {isListening && (
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        )}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
