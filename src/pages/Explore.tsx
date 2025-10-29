import { useEffect, useRef, useState } from 'react';
import { OSM } from "ol/source";
import { Map, View, TileLayer } from 'react-openlayers';
import 'react-openlayers/dist/index.css'; // for css


const Explore: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<Map | null>(null);

    const [location, setLocation] = useState<GeolocationPosition | null>(null);

    // Obtener ubicación del usuario
    useEffect(() => {
        if (!navigator.geolocation) return;

        const id = navigator.geolocation.watchPosition(
            (pos) => setLocation(pos),
            () => toast.error("GPS no disponible")
        );

        return () => navigator.geolocation.clearWatch(id);
    }, []);

    // Crear mapa solo una vez
    useEffect(() => {
        //DESCOMENTAR PARA SUBIR A PRODUCCIÓN

        // if (mapInstance.current || !mapRef.current) return;

        mapInstance.current = new Map({
            target: mapRef.current,
            layers: [new TileLayer({ source: new OSM() })],
            view: new View({
                center: fromLonLat([-64.7, -21.5]),
                zoom: 5,
            }),
        });
        return () => {
            mapInstance.current?.setTarget(undefined);
        };
    }, []);

    // // Actualizar vista al cambiar ubicación
    useEffect(() => {
        if (!location || !mapInstance.current) return;

        const { latitude, longitude } = location.coords;

        const marker = new Feature({
            geometry: new Point(fromLonLat([longitude, latitude])),
        })

        mapInstance.current.getView().animate({
            center: fromLonLat([longitude, latitude]),
            zoom: 16,
            duration: 1000,
        });
        mapInstance.current.addFeature(marker);

    }, [location]);

    // sugerencias IA
    const suggestions = [
        { name: 'Comida tradicional', category: 'Comida' },
        { name: 'Negocios en crecimiento', category: 'Negocios' },
        { name: 'Día de pasta', category: 'Día de la semana' },
        { name: 'Día de descanso', category: 'Día de la semana' }
    ];

    // Modal para chatear con Lubi
    const [modalOpen, setModalOpen] = useState(false);
    const showModal = () => setModalOpen(!modalOpen);

    return (
        <section className='relative'>
            {/* Render del mapa */}
            <Map controls={[]} interactions={[]}>
                <TileLayer source={new OSM()} />
                <View center={[-64.7, -21.5]} zoom={5} />
            </Map>

            {/* Boton para mostrar el modal */}
            <div className="fixed bottom-4 left-4 right-0">
                <button className="w-14 h-14 bg-gradient-to-b from-primary-500 to-tomato rounded-full flex items-center justify-center cursor-pointer"
                    title="Chatear con Lubi"
                    aria-label="Chatear con Lubi"
                    onClick={showModal}
                >
                    <span className="text-white text-3xl font-bold">
                        L
                    </span>
                </button>
            </div>

            {/* Modal para chatear con Lubi */}
            <Modal isShowingModal={modalOpen} setIsShowingModal={setModalOpen}>
                <form className="p-8 shadow-lg">
                    <header className="mb-6">
                        <div className="flex justify-end items-center">
                            <button className="hover:bg-purple-100 rounded-full p-2" aria-label="cerrar preferencias"
                                onClick={showModal}
                                type="button"
                            >
                                <X className='w-6 h-6' />
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
                            <h3 className="font-bold text-2xl text-center">¿Que tienes planeado hoy?</h3>
                        </header>
                        <ul className="flex flex-wrap gap-2 my-4 md:justify-center justify-start">
                            {
                                suggestions.map((suggestion, index) => (
                                    <li className="cursor-pointer p-3 text-sm lg:text-md rounded-xl 
               text-gray-700 bg-white/20 backdrop-blur-xl 
               shadow-sm hover:bg-white/30 hover:shadow-md transition border-purple-500 border" key={index}>
                                        {suggestion.name}
                                    </li>
                                ))
                            }
                        </ul>
                        <search>
                            <textarea
                                itemType="search"
                                placeholder="Quiero lugares para pasar el tiempo con amigos" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:border-purple-500 overflow-y-auto"
                                cols={5}
                            ></textarea>
                        </search>
                    </section>
                    <footer className="flex justify-center">
                        <button className="w-full text-white bg-purple-600 rounded-md px-4 py-2 hover:bg-purple-600/90 rounded-xl text-md font-semibold" aria-label="Confirmar" type="button">A disfrutar</button>
                    </footer>
                </form>
            </Modal>

        </section >
    );
};

export default Explore;