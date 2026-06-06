import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';

interface EventSectionControlsProps {
  canSlideLeft: boolean;
  canSlideRight: boolean;
  onSlideLeft: () => void;
  onSlideRight: () => void;
  onShowAll: () => void;
}

const EventSectionControls = ({
  canSlideLeft,
  canSlideRight,
  onSlideLeft,
  onSlideRight,
  onShowAll,
}: EventSectionControlsProps) => (
  <div className="hidden lg:flex items-center gap-2">
    <button
      onClick={onSlideLeft}
      disabled={!canSlideLeft}
      className={`p-2 rounded-full shadow-lg transition-all ${
        canSlideLeft
          ? 'hover:bg-gray-200 text-gray-900'
          : 'opacity-40 cursor-not-allowed text-gray-400'
      }`}
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
    <button
      onClick={onSlideRight}
      disabled={!canSlideRight}
      className={`p-2 rounded-full shadow-lg transition-all ${
        canSlideRight
          ? 'hover:bg-gray-200 text-gray-900'
          : 'opacity-40 cursor-not-allowed text-gray-400'
      }`}
    >
      <ArrowRight className="w-5 h-5" />
    </button>
    <button
      onClick={onShowAll}
      className="p-2 rounded-full bg-linear-to-r from-primary-500 to-tomato text-white shadow-lg transition-all hover:scale-105"
    >
      <Plus className="w-5 h-5" />
    </button>
  </div>
);

export default EventSectionControls;
