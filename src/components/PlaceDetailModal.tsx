import React, { useEffect, useState } from 'react';
import supabase from '../lib/supabase';

interface OverpassElement {
    id: number;
    lat?: number;
    lon?: number;
    tags?: Record<string, string> | null;
}

interface PlaceDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    place: OverpassElement | null;
}

// Mapeo de amenities/tourism a emojis
const getEmojiForType = (tags?: Record<string, string> | null): string => {
    if (!tags) return '📍';
    
    const amenity = tags.amenity?.toLowerCase() || '';
    const tourism = tags.tourism?.toLowerCase() || '';
    const cuisine = tags.cuisine?.toLowerCase() || '';

    if (amenity.includes('restaurant')) return '🍽️';
    if (amenity.includes('cafe') || amenity.includes('coffee')) return '☕';
    if (amenity.includes('bar') || amenity.includes('pub')) return '🍺';
    if (amenity.includes('fast_food')) return '🍔';
    if (amenity.includes('pizza')) return '🍕';
    if (tourism.includes('museum')) return '🏛️';
    if (tourism.includes('gallery')) return '🎨';
    if (tourism.includes('attraction')) return '✨';
    if (amenity.includes('hotel') || amenity.includes('guest_house')) return '🏨';
    if (amenity.includes('pharmacy')) return '💊';
    if (amenity.includes('hospital')) return '🏥';
    if (amenity.includes('bank')) return '🏦';
    if (amenity.includes('library')) return '📚';
    if (cuisine.includes('pizza')) return '🍕';
    if (cuisine.includes('burger')) return '🍔';
    if (cuisine.includes('sushi') || cuisine.includes('japanese')) return '🍱';
    if (cuisine.includes('chinese')) return '🥡';
    if (cuisine.includes('mexican')) return '🌮';

    return '📍';
};

// Traducir tipos de amenity/tourism
const translateType = (tags?: Record<string, string> | null): string => {
    if (!tags) return 'Lugar';

    const amenity = tags.amenity || '';
    const tourism = tags.tourism || '';

    const translations: Record<string, string> = {
        restaurant: 'Restaurante',
        cafe: 'Café',
        coffee_shop: 'Cafetería',
        bar: 'Bar',
        pub: 'Pub',
        fast_food: 'Comida Rápida',
        pizza: 'Pizzería',
        museum: 'Museo',
        gallery: 'Galería',
        attraction: 'Atracción Turística',
        hotel: 'Hotel',
        guest_house: 'Hospedaje',
        pharmacy: 'Farmacia',
        hospital: 'Hospital',
        bank: 'Banco',
        library: 'Biblioteca',
    };

    return translations[amenity] || translations[tourism] || 'Lugar';
};

const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({ isOpen, onClose, place }) => {
    const [loading, setLoading] = useState(false);
    const [supabaseData, setSupabaseData] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    // useEffect(() => {
    //     const fetchSupabase = async () => {
    //         setSupabaseData(null);
    //         setError(null);
    //         if (!place) return;

    //         try {
    //             setLoading(true);
    //             const { data, error } = await supabase
    //                 .from('places')
    //                 .select('*')
    //                 .eq('osm_id', String(place.id))
    //                 .maybeSingle();

    //             if (error) {
    //                 setError(error.message);
    //             } else {
    //                 setSupabaseData(data || null);
    //             }
    //         } catch (err: any) {
    //             setError(err?.message || 'Error al obtener detalles');
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchSupabase();
    // }, [place]);

    if (!isOpen || !place) return null;

    const name = place.tags?.name || supabaseData?.name || 'Lugar sin nombre';
    const type = translateType(place.tags);
    const emoji = getEmojiForType(place.tags);
    
    const address =
        place.tags?.['addr:full'] ||
        place.tags?.['addr:street'] ||
        supabaseData?.address ||
        '';

    const phone = place.tags?.phone || supabaseData?.phone || '';
    const website = place.tags?.website || place.tags?.url || supabaseData?.website || '';
    const hours = place.tags?.['opening_hours'] || '';
    const rating = supabaseData?.rating || place.tags?.rating || '';

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Encabezado con fondo gradiente */}
                <div className="h-48 bg-gradient-to-br from-primary-500 via-primary-600 to-tomato relative flex items-end p-6">
                    <div className="flex items-end gap-4">
                        <div className="text-6xl">{emoji}</div>
                        <div className="flex-1">
                            <p className="text-white/80 text-sm font-medium">{type}</p>
                            <h2 className="text-white text-2xl font-bold line-clamp-2">{name}</h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6 max-h-96 overflow-y-auto space-y-4">
                    {/* Dirección */}
                    {address && (
                        <div className="flex gap-3">
                            <span className="text-xl flex-shrink-0">📍</span>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Dirección</p>
                                <p className="text-gray-800">{address}</p>
                            </div>
                        </div>
                    )}

                    {/* Teléfono */}
                    {phone && (
                        <div className="flex gap-3">
                            <span className="text-xl flex-shrink-0">📱</span>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Teléfono</p>
                                <a href={`tel:${phone}`} className="text-primary-600 hover:underline">
                                    {phone}
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Horario */}
                    {hours && (
                        <div className="flex gap-3">
                            <span className="text-xl flex-shrink-0">🕐</span>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Horario</p>
                                <p className="text-gray-800 text-sm">{hours}</p>
                            </div>
                        </div>
                    )}

                    {/* Sitio Web */}
                    {website && (
                        <div className="flex gap-3">
                            <span className="text-xl flex-shrink-0">🌐</span>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Sitio Web</p>
                                <a
                                    href={website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary-600 hover:underline text-sm break-all"
                                >
                                    {website}
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Calificación */}
                    {rating && (
                        <div className="flex gap-3">
                            <span className="text-xl flex-shrink-0">⭐</span>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Calificación</p>
                                <p className="text-gray-800 font-semibold">{rating}/5</p>
                            </div>
                        </div>
                    )}

                    {/* Detalles adicionales (si hay) */}
                    {loading && (
                        <div className="flex items-center justify-center py-4">
                            <div className="animate-spin w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full" />
                        </div>
                    )}

                    {error && (
                        <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded">
                            ℹ️ No se pudieron obtener detalles adicionales
                        </p>
                    )}

                    {!loading && !address && !phone && !website && !hours && !rating && (
                        <p className="text-center text-gray-500 text-sm py-4">
                            Sin información adicional disponible
                        </p>
                    )}
                </div>

                {/* Botones de acción */}
                <div className="border-t bg-gray-50 px-6 py-4 flex gap-3">
                    {website && (
                        <a
                            href={website}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition text-center text-sm"
                        >
                            Visitar
                        </a>
                    )}
                    {phone && (
                        <a
                            href={`tel:${phone}`}
                            className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-2 px-4 rounded-lg transition text-center text-sm"
                        >
                            Llamar
                        </a>
                    )}
                    <button
                        onClick={onClose}
                        className={`${website || phone ? 'flex-1' : 'w-full'} bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-2 px-4 rounded-lg transition text-center text-sm`}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlaceDetailModal;
