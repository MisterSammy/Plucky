import { useScaleStore } from '@/stores/scaleStore';
import GenreFilter from './GenreFilter';
import RootNoteSelector from './RootNoteSelector';
import ScaleSelector from './ScaleSelector';
import TuningSelector from './TuningSelector';
import DisplayOptions from './DisplayOptions';
import PositionSelector from './PositionSelector';
import CustomTuningEditor from './CustomTuningEditor';

export default function Sidebar() {
  const { selectedTuningId, sidebarOpen, setSidebarOpen } = useScaleStore();

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-[280px] bg-sidebar flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-1 px-5 py-4 shrink-0">
          <span className="text-xl font-bold text-white">Scale</span>
          <span className="text-xl font-bold text-accent">Pro</span>
        </div>

        {/* Scrollable controls */}
        <div className="flex-1 overflow-y-auto sidebar-scroll px-5 pb-6 space-y-5">
          <GenreFilter />
          <RootNoteSelector />
          <ScaleSelector />
          <TuningSelector />
          {selectedTuningId === 'custom' && <CustomTuningEditor />}
          <DisplayOptions />
          <PositionSelector />
        </div>
      </aside>
    </>
  );
}
