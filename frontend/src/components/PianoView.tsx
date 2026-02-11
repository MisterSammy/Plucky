import { useCallback } from 'react';
import { useScaleStore } from '@/stores/scaleStore';
import { useAudioStore } from '@/stores/audioStore';
import { usePitchStore } from '@/stores/pitchStore';
import { usePianoPositions } from '@/hooks/usePianoPositions';
import { useScalePractice } from '@/hooks/useScalePractice';
import FretboardContainer from '@/components/FretboardContainer';
import PianoSVG from '@/components/PianoSVG';
import FretboardLegend from '@/components/FretboardLegend';
import ScaleInfo from '@/components/ScaleInfo';
import type { PianoKeyPosition } from '@/types';

export default function PianoView() {
    const { showAllNotes, highlightRoot, pianoStartOctave, pianoEndOctave } = useScaleStore();
    const { currentNoteIndex } = useAudioStore();
    const { isListening, currentNote, currentNoteWithOctave } = usePitchStore();
    const { filteredPositions, allKeys } = usePianoPositions();
    const hitDegrees = useScalePractice(filteredPositions, isListening, currentNote);

    const handleNoteClick = useCallback(async (position: PianoKeyPosition) => {
        const { playNote } = useAudioStore.getState();
        await playNote(position.noteWithOctave);
    }, []);

    return (
        <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
            <FretboardContainer>
                <PianoSVG
                    positions={filteredPositions}
                    allKeys={allKeys}
                    onNoteClick={handleNoteClick}
                    activeNoteIndex={currentNoteIndex}
                    highlightRoot={highlightRoot}
                    showAllNotes={showAllNotes}
                    detectedNoteWithOctave={currentNoteWithOctave}
                    hitDegrees={hitDegrees}
                    startOctave={pianoStartOctave}
                    endOctave={pianoEndOctave}
                />
                <FretboardLegend />
            </FretboardContainer>
            <ScaleInfo />
        </div>
    );
}
