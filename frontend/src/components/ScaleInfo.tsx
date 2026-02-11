import { Scale } from 'tonal';
import { useScaleStore } from '@/stores/scaleStore';
import { SCALE_BY_ID } from '@/data/scales';
import { DEGREE_COLORS } from '@/lib/music';
import GenreTips from './GenreTips';

export default function ScaleInfo() {
  const { selectedRoot, selectedScaleId } = useScaleStore();
  const scale = SCALE_BY_ID[selectedScaleId];
  if (!scale) return null;

  const scaleData = Scale.get(`${selectedRoot} ${scale.tonalName}`);
  const notes = scaleData.notes || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Formula card */}
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

        {/* Notes card */}
        <div className="bg-surface rounded-xl border border-gray-800 p-4">
          <h4 className="text-xs font-medium uppercase tracking-wider text-label mb-3">Notes</h4>
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
        </div>
      </div>

      <GenreTips />
    </div>
  );
}
