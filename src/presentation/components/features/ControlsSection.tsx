import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import PlaceSearchFilter from '@/components/PlaceSearchFilter';
import DistanceFilter from '@/components/DistanceFilter';

interface ControlsSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDistance: number;
  onDistanceChange: (distance: number) => void;
}

const ControlsSection: React.FC<ControlsSectionProps> = ({
  searchQuery,
  onSearchChange,
  selectedDistance,
  onDistanceChange,
}) => {
  return (
    <div className="fixed top-4 left-4 right-4 z-40 flex flex-col gap-3 max-w-lg mx-auto">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 p-3 flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <Home className="w-5 h-5" />
        </Link>
        
        <div className="flex-1">
          <PlaceSearchFilter searchQuery={searchQuery} onSearchChange={onSearchChange} />
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50 p-3">
        <DistanceFilter
          selectedDistance={selectedDistance}
          onDistanceChange={onDistanceChange}
        />
      </div>
    </div>
  );
};

export default ControlsSection;