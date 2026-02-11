import { useEffect, useCallback } from 'react';
import { useScaleStore } from '@/stores/scaleStore';
import { useAudioStore } from '@/stores/audioStore';
import { usePitchStore } from '@/stores/pitchStore';
import { useFretboardPositions } from '@/hooks/useFretboardPositions';
import { useScalePractice } from '@/hooks/useScalePractice';
import { SCALE_BY_ID } from '@/data/scales';
import { encodeStateToHash, decodeHashToState } from '@/lib/url';
import Sidebar from '@/components/Sidebar';
import ContentTitleBar from '@/components/ContentTitleBar';
import ControlsToolbar from '@/components/ControlsToolbar';
import FretboardContainer from '@/components/FretboardContainer';
import FretboardSVG from '@/components/FretboardSVG';
import FretboardLegend from '@/components/FretboardLegend';
import ScaleInfo from '@/components/ScaleInfo';
import type { FretPosition } from '@/types';

function useThemeEffect() {
  const { theme } = useScaleStore();

  useEffect(() => {
    const apply = (resolved: 'light' | 'dark') => {
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    };

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches ? 'dark' : 'light');
      const handler = (e: MediaQueryListEvent) => apply(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      apply(theme);
    }
  }, [theme]);
}

function useUrlHashSync() {
  const { selectedRoot, selectedScaleId, selectedTuningId, selectedGenreId, selectedPosition, setRoot, setScale, setTuning, setGenre, setPosition } = useScaleStore();

  // Read hash on mount
  useEffect(() => {
    const state = decodeHashToState(window.location.hash);
    if (state.root) setRoot(state.root);
    if (state.scaleId) setScale(state.scaleId);
    if (state.tuningId) setTuning(state.tuningId);
    if (state.genreId) setGenre(state.genreId);
    if (state.pos != null) setPosition(state.pos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Write hash on change
  useEffect(() => {
    const hash = encodeStateToHash({ root: selectedRoot, scaleId: selectedScaleId, tuningId: selectedTuningId, genreId: selectedGenreId, pos: selectedPosition });
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash);
    }
  }, [selectedRoot, selectedScaleId, selectedTuningId, selectedGenreId, selectedPosition]);

  // Listen for hashchange (back/forward)
  useEffect(() => {
    const handler = () => {
      const state = decodeHashToState(window.location.hash);
      if (state.root) setRoot(state.root);
      if (state.scaleId) setScale(state.scaleId);
      if (state.tuningId) setTuning(state.tuningId);
      if (state.genreId !== undefined) setGenre(state.genreId ?? null);
      setPosition(state.pos ?? null);
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default function App() {
  useThemeEffect();
  useUrlHashSync();

  const { selectedRoot, selectedScaleId, showAllNotes, highlightRoot } = useScaleStore();
  const { currentNoteIndex } = useAudioStore();
  const { isListening, currentNote, currentNoteWithOctave } = usePitchStore();
  const { filteredPositions, tuning, allPositions, activePositionRange } = useFretboardPositions();
  const hitDegrees = useScalePractice(filteredPositions, isListening, currentNote);
  const scale = SCALE_BY_ID[selectedScaleId];

  const handleNoteClick = useCallback(async (position: FretPosition) => {
    const { playNote } = useAudioStore.getState();
    await playNote(position.noteWithOctave);
  }, []);

  return (
    <div className="flex min-h-screen bg-content text-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <ContentTitleBar />
        <ControlsToolbar />
        <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
          <FretboardContainer>
            <FretboardSVG
              positions={filteredPositions}
              tuningNotes={tuning.notes}
              onNoteClick={handleNoteClick}
              activeNoteIndex={currentNoteIndex}
              highlightRoot={highlightRoot}
              showAllNotes={showAllNotes}
              allPositions={allPositions}
              detectedNoteWithOctave={currentNoteWithOctave}
              scaleName={scale?.name}
              rootName={selectedRoot}
              activePositionRange={activePositionRange}
              hitDegrees={hitDegrees}
            />
            <FretboardLegend />
          </FretboardContainer>
          <ScaleInfo />
        </div>
      </main>
    </div>
  );
}
