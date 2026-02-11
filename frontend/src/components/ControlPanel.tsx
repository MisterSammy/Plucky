import RootNoteSelector from './RootNoteSelector';
import ScaleSelector from './ScaleSelector';
import TuningSelector from './TuningSelector';
import GenreFilter from './GenreFilter';
import DisplayOptions from './DisplayOptions';
import CustomTuningEditor from './CustomTuningEditor';
import PositionSelector from './PositionSelector';
import { useScaleStore } from '@/stores/scaleStore';

export default function ControlPanel() {
  const { selectedTuningId } = useScaleStore();

  return (
    <div className="space-y-4">
      <GenreFilter />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RootNoteSelector />
        <ScaleSelector />
        <TuningSelector />
        <DisplayOptions />
      </div>
      <PositionSelector />
      {selectedTuningId === 'custom' && <CustomTuningEditor />}
    </div>
  );
}
