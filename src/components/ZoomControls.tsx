import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface ZoomControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ onZoomIn, onZoomOut }) => {
    return (
        <div className="flex flex-col gap-2">
            <button
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-100 transition flex items-center justify-center cursor-pointer border border-gray-200"
                title="Zoom In"
                aria-label="Zoom In"
                onClick={onZoomIn}
            >
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </button>
            <button
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-100 transition flex items-center justify-center cursor-pointer border border-gray-200"
                title="Zoom Out"
                aria-label="Zoom Out"
                onClick={onZoomOut}
            >
                <Minus className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </button>
        </div>
    );
};

export default ZoomControls;
