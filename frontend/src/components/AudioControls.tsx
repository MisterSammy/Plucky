import PlayScaleButton from './PlayScaleButton';
import SpeedControl from './SpeedControl';
import MicToggle from './MicToggle';
import PitchDisplay from './PitchDisplay';
import PracticeProgress from './PracticeProgress';

export default function AudioControls() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <PlayScaleButton />
      <SpeedControl />
      <MicToggle />
      <PitchDisplay />
      <PracticeProgress />
    </div>
  );
}
