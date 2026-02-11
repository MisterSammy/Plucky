import { DEGREE_COLORS } from '@/lib/music';

const DEGREE_LABELS = ['Root', '2nd', '3rd', '4th', '5th', '6th', '7th'];

export default function FretboardLegend() {
  return (
    <div className="flex flex-wrap gap-3 justify-center py-2">
      {DEGREE_LABELS.map((label, i) => (
        <div key={label} className="flex items-center gap-1.5">
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
