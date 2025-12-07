import React from 'react';
import { X } from 'lucide-react';
import Modal from './ui/Modal';
import PlaceCard from './PlaceCard';
import { Place } from '../types';

interface PlacesResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    query: string;
    places: Place[];
    isLoading: boolean;
    onPlaceClick: (placeId: string) => void;
    onChatAgain: () => void;
}

const PlacesResultsModal: React.FC<PlacesResultsModalProps> = ({
    isOpen,
    onClose,
    query,
    places,
    isLoading,
    onPlaceClick,
    onChatAgain
}) => {
    return (
        <Modal isShowingModal={isOpen} setIsShowingModal={onClose}>
            <form className="shadow-lg">
                <header className="bg-gradient-to-r from-primary-500 to-tomato p-6 flex items-center justify-between">
                    <h2 className="text-white text-2xl font-bold">Lugares para {query}</h2>
                    <div className="flex justify-end items-center">
                        <button
                            className="hover:bg-purple-100 rounded-full p-2"
                            aria-label="cerrar preferencias"
                            onClick={onClose}
                            type="button"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </header>
                <section className="container p-6 relative">
                    <header className="absolute top-4 left-6 z-10">
                        <button
                            className="w-14 h-14 bg-gradient-to-b from-primary-500 to-tomato rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                            title="Chatear con Lubi"
                            aria-label="Chatear con Lubi"
                            onClick={onChatAgain}
                            type="button"
                        >
                            <span className="text-white text-3xl font-bold">
                                👀
                            </span>
                        </button>
                    </header>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="inline-block animate-spin">
                                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
                                </div>
                                <p className="mt-4 text-gray-600">Buscando lugares...</p>
                            </div>
                        </div>
                    ) : places.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 auto-rows-fr">
                            {places.map((place) => (
                                <PlaceCard
                                    key={place.id}
                                    place={place}
                                    onClick={() => onPlaceClick(place.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">
                                No se encontraron lugares para "{query}"
                            </p>
                        </div>
                    )}
                </section>
            </form>
        </Modal>
    );
};

export default PlacesResultsModal;
