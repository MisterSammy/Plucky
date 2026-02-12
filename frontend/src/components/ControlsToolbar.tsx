import PlayScaleButton from './PlayScaleButton';
import SpeedControl from './SpeedControl';
import OctaveSelector from './OctaveSelector';
import MicToggle from './MicToggle';
import PitchDisplay from './PitchDisplay';
import PracticeProgress from './PracticeProgress';

export default function ControlsToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-3 px-6 py-2.5 bg-surface/50 border-b border-gray-800">
      <PlayScaleButton />
      <div className="w-px h-6 bg-gray-700" />
      <SpeedControl />
      <div className="w-px h-6 bg-gray-700" />
      <OctaveSelector />
      <div className="w-px h-6 bg-gray-700" />
      <MicToggle />
      <PitchDisplay />
      <PracticeProgress />
    </div>
  );
}
