import { useAudioStore } from '@/stores/audioStore';

const PRESETS = [
  { bpm: 60, label: 'Slow' },
  { bpm: 100, label: 'Med' },
  { bpm: 140, label: 'Fast' },
];

export default function SpeedControl() {
  const { playbackBpm, setPlaybackBpm } = useAudioStore();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-label">Tempo</span>
      <div className="flex gap-1">
        {PRESETS.map(({ bpm, label }) => (
          <button
            key={bpm}
            onClick={() => setPlaybackBpm(bpm)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              playbackBpm === bpm
                ? 'bg-accent text-white'
                : 'bg-surface text-gray-400 hover:text-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <input
        type="range"
        min={40}
        max={200}
        step={5}
        value={playbackBpm}
        onChange={(e) => setPlaybackBpm(Number(e.target.value))}
        className="w-16 h-1 accent-amber-500 cursor-pointer"
        aria-label="Playback speed"
      />
      <span className="text-xs tabular-nums text-label w-12">
        {playbackBpm} bpm
      </span>
    </div>
  );
}
