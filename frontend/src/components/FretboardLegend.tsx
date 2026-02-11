import { useScaleStore } from '@/stores/scaleStore';
import { CHORD_BY_ID } from '@/data/chords';
import { DEGREE_COLORS } from '@/lib/music';

const SCALE_DEGREE_LABELS = ['Root', '2nd', '3rd', '4th', '5th', '6th', '7th'];

export default function FretboardLegend() {
  const { mode, selectedChordId } = useScaleStore();

  const chord = mode === 'chords' ? CHORD_BY_ID[selectedChordId] : null;
  const labels = chord ? chord.degrees : SCALE_DEGREE_LABELS;

  return (
    <div className="flex flex-wrap gap-3 justify-center py-2">
      {labels.map((label, i) => (
        <div key={`${label}-${i}`} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: DEGREE_COLORS[i] }}
          />
          <span className="text-xs text-gray-400">{label}</span>
        </div>
      ))}
    </div>
  );
}
