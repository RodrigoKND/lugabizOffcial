import React from 'react';

interface PlaceSearchFilterProps {
    onSearchChange: (query: string) => void;
    searchQuery: string;
}

const PlaceSearchFilter: React.FC<PlaceSearchFilterProps> = ({ onSearchChange, searchQuery }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value);
    };

    const handleClear = () => {
        onSearchChange('');
    };

    return (
        <div className="md:max-w-md w-full">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Buscar lugar o servicio..."
                    value={searchQuery}
                    onChange={handleChange}
                    className="w-full text-black px-4 py-2 pr-10 bg-white border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                />
                {searchQuery && (
                    <button
                        onClick={handleClear}
                        aria-label="Limpiar búsqueda"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};

export default PlaceSearchFilter;
