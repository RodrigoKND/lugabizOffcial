import React from 'react';
import { X } from 'lucide-react';

interface ProximityToastProps {
  nearbyPlace: {
    name: string;
    distance: number;
    emoji: string;
  };
  onClose: () => void;
}

const ProximityToast: React.FC<ProximityToastProps> = ({ nearbyPlace, onClose }) => {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-in slide-in-from-top-5">
      <div className="bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 border-2 border-purple-200">
        <div className="text-4xl flex-shrink-0">{nearbyPlace.emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{nearbyPlace.name}</p>
          <p className="text-sm text-gray-600">
            Estás a {nearbyPlace.distance}m 🚶‍♂️
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default ProximityToast;