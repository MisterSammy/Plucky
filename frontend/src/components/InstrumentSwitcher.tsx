import { useScaleStore } from '@/stores/scaleStore';

export default function InstrumentSwitcher() {
    const { instrument, setInstrument } = useScaleStore();

    return (
        <div className="flex bg-surface rounded-lg p-0.5">
            <button
                onClick={() => setInstrument('guitar')}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    instrument === 'guitar'
                        ? 'bg-accent text-white'
                        : 'text-gray-400 hover:text-gray-200'
                }`}
            >
                Guitar
            </button>
            <button
                onClick={() => setInstrument('piano')}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    instrument === 'piano'
                        ? 'bg-accent text-white'
                        : 'text-gray-400 hover:text-gray-200'
                }`}
            >
                Piano
            </button>
        </div>
    );
}
