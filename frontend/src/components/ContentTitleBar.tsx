import { useScaleStore } from '@/stores/scaleStore';
import { useFretboardPositions } from '@/hooks/useFretboardPositions';
import { SCALE_BY_ID } from '@/data/scales';

export default function ContentTitleBar() {
  const { selectedRoot, selectedScaleId, selectedPosition, setSidebarOpen, instrument } = useScaleStore();
  const { availablePositions } = useFretboardPositions();
  const scale = SCALE_BY_ID[selectedScaleId];

  let posLabel: string;
  if (instrument === 'piano') {
    posLabel = 'Piano';
  } else if (selectedPosition != null && availablePositions[selectedPosition]) {
    posLabel = `Position ${availablePositions[selectedPosition].label} (Frets ${availablePositions[selectedPosition].startFret}–${availablePositions[selectedPosition].endFret})`;
  } else {
    posLabel = 'All positions';
  }

  return (
    <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-800">
      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden p-1.5 rounded-md hover:bg-surface text-gray-400"
        aria-label="Open sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>

      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent shrink-0">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>

      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-gray-100 truncate">
          {selectedRoot} {scale?.name ?? 'Scale'}
        </h1>
        <p className="text-xs text-label">{posLabel}</p>
      </div>
    </div>
  );
}
