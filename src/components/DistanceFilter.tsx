import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DISTANCES_PLACES } from '@/static/data/metters';

interface DistanceFilterProps {
    selectedDistance: number;
    onDistanceChange: (distance: number) => void;
}


const DistanceFilter: React.FC<DistanceFilterProps> = ({ selectedDistance, onDistanceChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const selectedOption = DISTANCES_PLACES.find(d => d.value === selectedDistance) || DISTANCES_PLACES[0];
    const isSelected = (value: number): boolean => selectedDistance === value;

    const handleSelect = (value: number) => {
        onDistanceChange(value);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full sm:w-48">
            {/* Botón principal */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white/95 backdrop-blur-sm px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between group border-2 border-transparent hover:border-purple-200"
            >
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
                    <span className="font-semibold text-gray-800 text-sm sm:text-base">
                        {selectedOption.name}
                    </span>
                </div>
                <div className="text-gray-500 group-hover:text-purple-500 transition-colors">
                    {isOpen ? (
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                </div>
            </button>

            {/* Dropdown con animación */}
            <div
                className={`absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 origin-top ${
                    isOpen 
                        ? 'opacity-100 scale-y-100 translate-y-0' 
                        : 'opacity-0 scale-y-0 -translate-y-2 pointer-events-none'
                }`}
            >
                <ul className="py-2">
                    {DISTANCES_PLACES.map((d, i) => (
                        <li
                            key={i}
                            className={`cursor-pointer px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 sm:gap-3 transition-all duration-200 ${
                                isSelected(d.value)
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                    : 'text-gray-700 hover:bg-purple-50'
                            }`}
                            onClick={() => handleSelect(d.value)}
                            role="button"
                        >
                            <div
                                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    isSelected(d.value)
                                        ? 'border-white bg-white'
                                        : 'border-gray-300 bg-white'
                                }`}
                            >
                                {isSelected(d.value) && (
                                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                                )}
                            </div>
                            <span className={`text-sm sm:text-base ${isSelected(d.value) ? 'font-semibold' : 'font-medium'}`}>
                                {d.name}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Overlay para cerrar al hacer click fuera */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default DistanceFilter;