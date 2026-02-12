import { Scale, Chord } from 'tonal';
import { useScaleStore } from '@/stores/scaleStore';
import { SCALE_BY_ID } from '@/data/scales';
import { CHORD_BY_ID } from '@/data/chords';
import { DEGREE_COLORS } from '@/lib/music';
import GenreTips from './GenreTips';

export default function ScaleInfo() {
  const { selectedRoot, selectedScaleId, selectedChordId, mode } = useScaleStore();
  const practiceOctaves = useScaleStore(s => s.practiceOctaves);

  if (mode === 'chords') {
    const chord = CHORD_BY_ID[selectedChordId];
    if (!chord) return null;

    const chordData = Chord.get(`${selectedRoot} ${chord.tonalName}`);
    const notes = chordData.notes || [];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-surface rounded-xl border border-gray-800 p-4">
            <h4 className="text-xs font-medium uppercase tracking-wider text-label mb-3">Formula</h4>
            <div className="flex flex-wrap gap-1.5">
              {chord.intervals.map((interval, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs rounded-full text-white font-medium"
                  style={{ backgroundColor: DEGREE_COLORS[i % DEGREE_COLORS.length] }}
                >
                  {interval}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-gray-800 p-4">
            <h4 className="text-xs font-medium uppercase tracking-wider text-label mb-3">Chord Tones</h4>
            <div className="flex flex-wrap gap-1.5">
              {notes.map((note, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs rounded-md font-medium text-white"
                  style={{ backgroundColor: DEGREE_COLORS[i % DEGREE_COLORS.length] }}
                >
                  {note}
                  <span className="ml-1 opacity-70">{chord.degrees[i]}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <GenreTips />
      </div>
    );
  }

  const scale = SCALE_BY_ID[selectedScaleId];
  if (!scale) return null;

  const scaleData = Scale.get(`${selectedRoot} ${scale.tonalName}`);
  const notes = scaleData.notes || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface rounded-xl border border-gray-800 p-4">
          <h4 className="text-xs font-medium uppercase tracking-wider text-label mb-3">Formula</h4>
          <div className="flex flex-wrap gap-1.5">
            {scale.intervals.map((interval, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-xs rounded-full text-white font-medium"
                style={{ backgroundColor: DEGREE_COLORS[i % DEGREE_COLORS.length] }}
              >
                {interval}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-gray-800 p-4">
          <h4 className="text-xs font-medium uppercase tracking-wider text-label mb-3">Notes</h4>
          {practiceOctaves > 1 ? (
            <div className="space-y-1.5">
              {Array.from({ length: practiceOctaves }, (_, oct) => (
                <div key={oct} className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-500 w-8 shrink-0">Oct {oct + 1}</span>
                  <div className="flex flex-wrap gap-1">
                    {notes.map((note, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[11px] rounded-md font-medium text-white"
                        style={{ backgroundColor: DEGREE_COLORS[i % DEGREE_COLORS.length] }}
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {notes.map((note, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs rounded-md font-medium text-white"
                  style={{ backgroundColor: DEGREE_COLORS[i % DEGREE_COLORS.length] }}
                >
                  {note}
                  <span className="ml-1 opacity-70">{scale.degrees[i]}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <GenreTips />
    </div>
  );
}
