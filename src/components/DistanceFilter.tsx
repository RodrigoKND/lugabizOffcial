import React from 'react';

interface DistanceFilterProps {
    selectedDistance: number;
    onDistanceChange: (distance: number) => void;
}

const DISTANCES_PLACES = [
    { name: 'cerca', value: 500, h3Radius: 1 },
    { name: '5 km', value: 5000, h3Radius: 3 },
    { name: '10 km', value: 10000, h3Radius: 5 },
    { name: '15 km', value: 15000, h3Radius: 7 },
    { name: '20 km', value: 20000, h3Radius: 8 },
    { name: '25 km', value: 25000, h3Radius: 9 },
    { name: '30 km', value: 30000, h3Radius: 10 }
] as const;

const DistanceFilter: React.FC<DistanceFilterProps> = ({ selectedDistance, onDistanceChange }) => {
    const isSelected = (value: number): boolean => selectedDistance === value;

    return (
        <ul className='bg-white p-2 rounded shadow-lg w-full max-w-xs z-10'>
            {DISTANCES_PLACES.map((d, i) => (
                <li
                    key={i}
                    className={`cursor-pointer p-2 sm:p-3 flex items-center gap-2 sm:gap-4 transition text-sm sm:text-base ${
                        isSelected(d.value)
                            ? 'bg-green-400 text-white shadow-lg'
                            : 'text-gray-700 bg-white/20 backdrop-blur-xl shadow-sm hover:bg-white/30 hover:shadow-md'
                    }`}
                    onClick={() => onDistanceChange(d.value)}
                    role="button"
                >
                    <input
                        type="radio"
                        name="distance"
                        className="cursor-pointer w-3 h-3 sm:w-4 sm:h-4 accent-green-500"
                        value={d.value}
                        id={`distance-${i}`}
                        checked={isSelected(d.value)}
                        onChange={() => onDistanceChange(d.value)}
                    />
                    <span className={isSelected(d.value) ? 'font-semibold' : ''}>{d.name}</span>
                </li>
            ))}
        </ul>
    );
};

export default DistanceFilter;
