import { usePitchStore } from '@/stores/pitchStore';

export default function MonitorToggle() {
    const isListening = usePitchStore((s) => s.isListening);
    const isMonitorMuted = usePitchStore((s) => s.isMonitorMuted);
    const toggleMonitor = usePitchStore((s) => s.toggleMonitor);

    if (!isListening) return null;

    return (
        <button
            onClick={toggleMonitor}
            className={`p-1.5 rounded-md transition-colors ${
                isMonitorMuted
                    ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                    : 'text-accent bg-accent/10 hover:bg-accent/20'
            }`}
            title={isMonitorMuted ? 'Unmute input monitor' : 'Mute input monitor'}
            aria-label={isMonitorMuted ? 'Unmute input monitor' : 'Mute input monitor'}
        >
            {isMonitorMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                    <line x1="22" x2="16" y1="9" y2="15" />
                    <line x1="16" x2="22" y1="9" y2="15" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
            )}
        </button>
    );
}
