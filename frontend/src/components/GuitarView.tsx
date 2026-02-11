import { useCallback } from 'react';
import { useScaleStore } from '@/stores/scaleStore';
import { useAudioStore } from '@/stores/audioStore';
import { usePitchStore } from '@/stores/pitchStore';
import { useFretboardPositions } from '@/hooks/useFretboardPositions';
import { useScalePractice } from '@/hooks/useScalePractice';
import { SCALE_BY_ID } from '@/data/scales';
import FretboardContainer from '@/components/FretboardContainer';
import FretboardSVG from '@/components/FretboardSVG';
import FretboardLegend from '@/components/FretboardLegend';
import ScaleInfo from '@/components/ScaleInfo';
import type { FretPosition } from '@/types';

export default function GuitarView() {
    const { selectedRoot, selectedScaleId, showAllNotes, highlightRoot, showFingers } = useScaleStore();
    const { currentNoteIndex } = useAudioStore();
    const { isListening, currentNote, currentNoteWithOctave } = usePitchStore();
    const { filteredPositions, tuning, allPositions, activePositionRange, chordDiagram } = useFretboardPositions();
    const hitDegrees = useScalePractice(filteredPositions, isListening, currentNote);
    const scale = SCALE_BY_ID[selectedScaleId];

    const handleNoteClick = useCallback(async (position: FretPosition) => {
        const { playNote } = useAudioStore.getState();
        await playNote(position.noteWithOctave);
    }, []);

    return (
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
                    chordDiagram={chordDiagram}
                    showFingers={showFingers}
                />
                <FretboardLegend />
            </FretboardContainer>
            <ScaleInfo />
        </div>
    );
}
