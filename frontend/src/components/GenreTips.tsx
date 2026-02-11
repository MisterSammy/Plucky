import { useScaleStore } from '@/stores/scaleStore';
import { GENRES } from '@/data/genres';

export default function GenreTips() {
  const { selectedGenreId } = useScaleStore();
  if (!selectedGenreId) return null;

  const genre = GENRES.find((g) => g.id === selectedGenreId);
  if (!genre) return null;

  return (
    <div className="bg-surface rounded-xl border border-gray-800 p-4">
      <h3 className="font-semibold text-sm text-gray-100 mb-1">{genre.name} Tips</h3>
      <p className="text-xs text-label mb-2">{genre.description}</p>
      <ul className="space-y-1">
        {genre.tips.map((tip, i) => (
          <li key={i} className="text-xs text-gray-300 flex gap-2">
            <span className="text-gray-500 select-none">&bull;</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
