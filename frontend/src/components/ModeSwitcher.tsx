import { useScaleStore } from '@/stores/scaleStore';

export default function ModeSwitcher() {
    const { mode, setMode } = useScaleStore();

    return (
        <div className="flex bg-surface rounded-lg p-0.5">
            <button
                onClick={() => setMode('scales')}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    mode === 'scales'
                        ? 'bg-accent text-white'
                        : 'text-gray-400 hover:text-gray-200'
                }`}
            >
                Scales
            </button>
            <button
                onClick={() => setMode('chords')}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    mode === 'chords'
                        ? 'bg-accent text-white'
                        : 'text-gray-400 hover:text-gray-200'
                }`}
            >
                Chords
            </button>
        </div>
    );
}
