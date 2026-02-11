import { useMemo } from 'react';
import { useScaleStore } from '@/stores/scaleStore';
import { SCALE_BY_ID } from '@/data/scales';
import { TUNING_BY_ID } from '@/data/tunings';
import { getScalePositions, getAllFretboardNotes, computeScalePositions } from '@/lib/music';
import type { FretPosition, TuningPreset, PositionRange } from '@/types';

export function useFretboardPositions(): {
  positions: FretPosition[];
  filteredPositions: FretPosition[];
  tuning: TuningPreset;
  allPositions: Omit<FretPosition, 'interval' | 'degree' | 'isRoot'>[];
  availablePositions: PositionRange[];
  activePositionRange: PositionRange | null;
} {
  const { selectedRoot, selectedScaleId, selectedTuningId, customTuning, selectedPosition } = useScaleStore();

  return useMemo(() => {
    const scale = SCALE_BY_ID[selectedScaleId];
    const tuning =
      selectedTuningId === 'custom' && customTuning
        ? customTuning
        : TUNING_BY_ID[selectedTuningId] || TUNING_BY_ID['standard'];
    const positions = scale
      ? getScalePositions(selectedRoot, scale.tonalName, tuning)
      : [];
    const allPositions = getAllFretboardNotes(tuning);
    const availablePositions = computeScalePositions(positions);

    const activePositionRange =
      selectedPosition != null && availablePositions[selectedPosition]
        ? availablePositions[selectedPosition]
        : null;

    const filteredPositions = activePositionRange
      ? positions.filter(
          p => p.fret >= activePositionRange.startFret && p.fret <= activePositionRange.endFret
        )
      : positions;

    return { positions, filteredPositions, tuning, allPositions, availablePositions, activePositionRange };
  }, [selectedRoot, selectedScaleId, selectedTuningId, customTuning, selectedPosition]);
}
