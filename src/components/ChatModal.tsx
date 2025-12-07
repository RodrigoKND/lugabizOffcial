import React, { useState } from 'react';
import { X } from 'lucide-react';
import Modal from './ui/Modal';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (query: string) => void;
    isLoading: boolean;
}

const SUGGESTIONS = [
    { name: 'Comida tradicional', category: 'Comida' },
    { name: 'Negocios en crecimiento', category: 'Negocios' },
    { name: 'Día de pasta', category: 'Día de la semana' },
    { name: 'Día de descanso', category: 'Día de la semana' }
];

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, onSearch, isLoading }) => {
    const [selectedOption, setSelectedOption] = useState<string>('');

    const handleSelectSuggestion = (name: string) => {
        setSelectedOption(name);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (selectedOption.trim()) {
            onSearch(selectedOption);
            setSelectedOption('');
        }
    };

    return (
        <Modal isShowingModal={isOpen} setIsShowingModal={onClose}>
            <form className="p-8 shadow-lg" onSubmit={handleSubmit}>
                <header className="mb-6">
                    <div className="flex justify-end items-center">
                        <button
                            className="hover:bg-purple-100 rounded-full p-2"
                            aria-label="cerrar preferencias"
                            onClick={onClose}
                            type="button"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <hr className="border border-gray-200 w-full mt-2" />
                </header>
                <section className="mb-4">
                    <header className="mb-4">
                        <h4 className="font-bold text-3xl mb-2 text-center">
                            <span>👀</span>
                            <br />
                            Hola, soy <span className="text-purple-700">Lubi</span>
                        </h4>
                        <h3 className="font-bold text-2xl text-center">
                            ¿Qué tienes planeado hoy?
                        </h3>
                    </header>
                    <ul className="flex flex-wrap gap-2 my-4 md:justify-center justify-start">
                        {SUGGESTIONS.map((suggestion, index) => (
                            <li
                                className="cursor-pointer p-3 text-sm lg:text-md rounded-xl 
                   text-gray-700 bg-white/20 backdrop-blur-xl 
                   shadow-sm hover:bg-white/30 hover:shadow-md transition border-purple-500 border"
                                key={index}
                                onClick={() => handleSelectSuggestion(suggestion.name)}
                                role="button"
                            >
                                {suggestion.name}
                            </li>
                        ))}
                    </ul>
                    <search>
                        <textarea
                            itemType="search"
                            placeholder="Quiero lugares para pasar el tiempo con amigos"
                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:border-purple-500 overflow-y-auto"
                            cols={5}
                            onChange={(e) => setSelectedOption(e.target.value)}
                            value={selectedOption}
                            required
                            maxLength={250}
                        />
                    </search>
                    <footer className="flex justify-center">
                        <button
                            className={`w-full text-white ${
                                isLoading
                                    ? 'bg-gray-400'
                                    : 'bg-purple-600 hover:bg-purple-600/90'
                            } rounded-md px-4 py-2 text-md font-semibold`}
                            aria-label="Confirmar"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Buscando...' : 'Buscar lugares'}
                        </button>
                    </footer>
                </section>
            </form>
        </Modal>
    );
};

export default ChatModal;
