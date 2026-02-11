import { useScaleStore } from '@/stores/scaleStore';
import { GENRES } from '@/data/genres';

export default function GenreFilter() {
  const { selectedGenreId, setGenre } = useScaleStore();

  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wider text-label mb-2">Genre</label>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setGenre(null)}
          className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
            selectedGenreId === null
              ? 'bg-accent text-white'
              : 'bg-surface text-gray-400 hover:text-gray-200'
          }`}
          aria-pressed={selectedGenreId === null}
        >
          All Scales
        </button>
        {GENRES.map((genre) => {
          const isActive = selectedGenreId === genre.id;
          return (
            <button
              key={genre.id}
              onClick={() => setGenre(isActive ? null : genre.id)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                isActive ? 'bg-accent text-white' : 'bg-surface text-gray-400 hover:text-gray-200'
              }`}
              aria-pressed={isActive}
            >
              {genre.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
