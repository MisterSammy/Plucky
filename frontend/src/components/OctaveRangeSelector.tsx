import { useScaleStore } from '@/stores/scaleStore';

const OCTAVE_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

export default function OctaveRangeSelector() {
    const { pianoStartOctave, pianoEndOctave, setPianoOctaveRange } = useScaleStore();

    return (
        <div>
            <h3 className="text-xs font-semibold text-label uppercase tracking-wider mb-2">
                Octave Range
            </h3>
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1 block">From</label>
                    <select
                        value={pianoStartOctave}
                        onChange={(e) => {
                            const start = Number(e.target.value);
                            const end = Math.max(start + 1, pianoEndOctave);
                            setPianoOctaveRange(start, Math.min(end, 7));
                        }}
                        className="w-full bg-surface border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-200"
                    >
                        {OCTAVE_OPTIONS.filter(o => o < pianoEndOctave).map(o => (
                            <option key={o} value={o}>C{o}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1 block">To</label>
                    <select
                        value={pianoEndOctave}
                        onChange={(e) => {
                            const end = Number(e.target.value);
                            const start = Math.min(pianoStartOctave, end - 1);
                            setPianoOctaveRange(Math.max(start, 1), end);
                        }}
                        className="w-full bg-surface border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-200"
                    >
                        {OCTAVE_OPTIONS.filter(o => o > pianoStartOctave).map(o => (
                            <option key={o} value={o}>C{o}</option>
                        ))}
                    </select>
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
                {pianoEndOctave - pianoStartOctave + 1} octaves
            </p>
        </div>
    );
}
