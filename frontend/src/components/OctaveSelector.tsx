import { useScaleStore } from '@/stores/scaleStore';

const OCTAVE_OPTIONS = [1, 2, 3, 4];

export default function OctaveSelector() {
    const practiceOctaves = useScaleStore(s => s.practiceOctaves);
    const setPracticeOctaves = useScaleStore(s => s.setPracticeOctaves);

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-label">Octaves</span>
            <div className="flex gap-1">
                {OCTAVE_OPTIONS.map((n) => (
                    <button
                        key={n}
                        onClick={() => setPracticeOctaves(n)}
                        className={`w-6 h-6 text-xs rounded transition-colors ${
                            practiceOctaves === n
                                ? 'bg-accent text-white'
                                : 'bg-surface text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        {n}
                    </button>
                ))}
            </div>
        </div>
    );
}
