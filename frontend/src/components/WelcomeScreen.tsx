import { useScaleStore } from '@/stores/scaleStore';
import type { Instrument } from '@/types';

export default function WelcomeScreen() {
    const { setInstrument } = useScaleStore();

    const handleSelect = (instrument: Instrument) => {
        setInstrument(instrument);
    };

    return (
        <div className="min-h-screen bg-content flex items-center justify-center p-6">
            <div className="max-w-lg w-full text-center space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Scale<span className="text-accent">Pro</span>
                    </h1>
                    <p className="text-gray-400">Choose your instrument to get started</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleSelect('guitar')}
                        className="group flex flex-col items-center gap-4 p-6 rounded-xl bg-surface border border-gray-700 hover:border-accent transition-all hover:bg-surface/80"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-accent transition-colors">
                            <path d="M11.9 12.1a4.3 4.3 0 0 0-1.2-6.1 4.3 4.3 0 0 0-6.1 1.2L1 12.8a4.3 4.3 0 0 0 1.2 6.1 4.3 4.3 0 0 0 6.1-1.2" />
                            <path d="m15.6 8.4 1-1" />
                            <path d="M12 12 8.4 15.6" />
                            <path d="m18 3-1.4 1.4" />
                            <path d="m20 7.5-.7.7" />
                            <path d="m21 3-5.6 5.6" />
                        </svg>
                        <span className="text-lg font-semibold text-gray-200 group-hover:text-white transition-colors">Guitar</span>
                    </button>

                    <button
                        onClick={() => handleSelect('piano')}
                        className="group flex flex-col items-center gap-4 p-6 rounded-xl bg-surface border border-gray-700 hover:border-accent transition-all hover:bg-surface/80"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-accent transition-colors">
                            <path d="M18.5 8c-1.4 0-2.6-.8-3.2-2A6.87 6.87 0 0 0 2 9v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8.5C22 9.6 20.4 8 18.5 8" />
                            <path d="M2 14h20" />
                            <path d="M6 14v8" />
                            <path d="M10 14v8" />
                            <path d="M14 14v8" />
                            <path d="M18 14v8" />
                        </svg>
                        <span className="text-lg font-semibold text-gray-200 group-hover:text-white transition-colors">Piano</span>
                    </button>
                </div>

                <p className="text-xs text-gray-500">
                    You can switch instruments anytime from the sidebar
                </p>
            </div>
        </div>
    );
}
