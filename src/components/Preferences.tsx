import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useForm } from '@/hooks/useForm';
import SocialGroupSelector from '@/components/SocialGroupSelector';
import { usePlaces } from '@/context/PlacesContext';
import { useAuth } from '@/context/AuthContext';

interface PreferencesProps {
    openPreferences?: boolean;
    setClosePreferences?: (value: boolean) => void;
}

const Preferences: React.FC< PreferencesProps> = ({ openPreferences = false, setClosePreferences }) => {
    const { socialGroups, categories } = usePlaces();
    const { isNewUser, setWelcomeShown } = useAuth();
    // start closed and open only when AuthContext signals a new user
    const [isShowingPreferences, setIsShowingPreferences] = useState(false);

    useEffect(() => {
        if (isNewUser || openPreferences) {
            setIsShowingPreferences(true);
            setClosePreferences?.(!openPreferences);
        }
    }, [isNewUser, openPreferences]);

    const { formData, setFormData } = useForm<{ socialGroups: string[], category: string[] }>({
        category: [],
        socialGroups: [],
    });

    const handleChange = (key: 'socialGroups' | 'category', data: string[]) => {
        setFormData(prev => ({
            ...prev,
            [key]: data
        }));
    };

    const onClose = () => {
        setIsShowingPreferences(false);
        setClosePreferences?.(false);
        // mark welcome shown so the modal won't re-open for this user
        setWelcomeShown?.();
    };

    const handleSubmitPreferences = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(JSON.stringify(formData));
    }
    if (!isShowingPreferences) return null;

    return (
        <dialog
            open={isShowingPreferences}
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-40 h-screen w-screen"
        >
            <div
                className="absolute inset-0"
                onClick={onClose}
            ></div>
            <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-100 w-full max-w-2xl overflow-y-auto rounded-xl shadow-lg z-50 max-h-[70vh] relative"
            >
                <form onSubmit={handleSubmitPreferences} method="POST">
                    <header className="sticky top-0 px-8 pt-4 lg:pt-6 mb-6 z-50 bg-white/90 backdrop-blur-sm ">
                        <div className="flex justify-between items-center">
                            <h2 className="font-bold flex gap-x-1 items-center mb-2 text-purple-800">
                                <span>
                                    <img src='/L.ico' alt='Lugabiz' className='w-6 h-auto' />
                                </span>
                                <span className='text-2xl text-purple-800'>
                                    Lugabiz
                                </span>
                            </h2>
                            <button
                                className="hover:bg-purple-100 rounded-full p-2"
                                type='button'
                                aria-label="cerrar preferencias"
                                onClick={onClose}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <hr className="border border-gray-200 w-full mt-2" />
                    </header>

                    <section className="mb-6 px-8 text-center">
                        <header className="mb-2">
                            <h4 className="font-bold text-2xl mb-2">
                                Elige lo que más te guste
                            </h4>
                            <p className="text-gray-800 text-md">
                                Lugabiz se actualizará
                                en función a tu selección
                            </p>
                        </header>
                    </section>

                    <section className="mb-8 px-8">
                        <header className="mb-4">
                            <h4 className="font-bold text-xl mb-2">Grupos Sociales</h4>
                            <p className="text-gray-800 text-md">
                                Elige tus intereses (puedes cambiarlos luego en tu perfil).
                            </p>
                        </header>
                        <SocialGroupSelector
                            socialGroups={socialGroups}
                            selectedGroups={formData.socialGroups}
                            onChange={(groups) => handleChange('socialGroups', groups)}
                        />
                    </section>

                    <section className="mb-8 px-8">
                        <header className="mb-4">
                            <h4 className="font-bold text-xl mb-2">Categorías</h4>
                            <p className="text-gray-800 text-md">
                                Selecciona tus categorías favoritas para disfrutar y vivir una
                                experiencia personalizada
                            </p>
                        </header>

                        <SocialGroupSelector
                            socialGroups={categories}
                            selectedGroups={formData.category}
                            onChange={(categories) => handleChange('category', categories)}
                        />
                    </section>

                    <footer className="flex justify-center px-8 mb-8">
                        <button
                            className="w-full text-white bg-purple-600 rounded-md px-4 py-2 hover:bg-purple-600/90 text-md font-semibold"
                            aria-label="Confirmar"
                            type="submit"
                        >
                            Confirmar Preferencias
                        </button>
                    </footer>
                </form>
            </motion.div>
        </dialog>

    )
}

export default Preferences;