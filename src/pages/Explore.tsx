import { useState, useEffect, useMemo, useRef } from 'react';
import { Map, TileLayer } from 'react-openlayers';
import 'react-openlayers/dist/index.css';
import { OSM, Vector as VectorSource } from 'ol/source';
import { View, Feature } from 'ol';
import { X } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import { Vector as VectorLayer } from 'ol/layer';
import { latLngToCell, gridDisk } from "h3-js";
import PlaceCard from '../components/PlaceCard';
import { usePlaces } from '../context/PlacesContext';
import { useNavigate } from 'react-router-dom';


interface Position {
    lat?: number;
    lon?: number;
}

interface OverpassElement  extends Position{
    id: number;
    tags?: Record<string, string>;
}

interface OverpassResponse {
    elements: OverpassElement[];
}

const Explore: React.FC = () => {
    const { places } = usePlaces();
    const [position, setPosition] = useState<Position>({ lat: 0, lon: 0 });
    const [view] = useState<View>(
        new View({
            center: fromLonLat([-74.08175, 4.60971]),
            zoom: 5
        })
    );
    const [map, setMap] = useState<any>(null);
    const markerLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
    const watchIdRef = useRef<number | null>(null);

    const getPosition = ({ coords }: GeolocationPosition) => {
        setPosition({
            lat: coords.latitude,
            long: coords.longitude
        });
    }

    const getErrorCoords = () => {
        setPosition({ lat: 0, long: 0 });
        alert("No se pudo obtener tu ubicación actual");
    }

    const handleMapInit = (mapInstance: any) => setMap(mapInstance);

    // Inicializar capa de marcador cuando el mapa esté listo
    useEffect(() => {
        if (map && !markerLayerRef.current) {
            const vectorSource = new VectorSource();
            const vectorLayer = new VectorLayer({
                source: vectorSource
            });
            markerLayerRef.current = vectorLayer;
            map.addLayer(vectorLayer);
        }
    }, [map]);

    useEffect(() => {
        if (navigator.geolocation) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                getPosition,
                getErrorCoords,
                {
                    enableHighAccuracy: true,
                    maximumAge: 30000,
                    timeout: 27000
                }
            );
        }

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (position.lat !== 0 && position.long !== 0 && markerLayerRef.current) {
            const coords = fromLonLat([position.long, position.lat]);
            view.setCenter(coords);
            view.setZoom(15);

            const marker = new Feature({
                geometry: new Point(coords)
            });

            marker.setStyle(new Style({
                image: new Circle({
                    radius: 8,

                    fill: new Fill({ color: 'purple' }),
                    stroke: new Stroke({ color: 'white', width: 2 })
                })
            }));

            const source = markerLayerRef.current.getSource();
            if (source) {
                source.clear();
                source.addFeature(marker);
            }
        }
    }, [position, view]);

    const [modalOpen, setModalOpen] = useState(false);

    const [selectedOption, setSelectedOption] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const selectOptionByIA = (option: string) => setSelectedOption(option);

    const handleSubmitRequestIA = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(false);
        setIsModalPlaceOpen(true);
        setTimeout(() => {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);

            }, 5000);
        }, 2000);
        // TODO: Enviando a la base de datos la request del usario
    }

    const navigate = useNavigate();
    const handlePlaceClick = (placeId: string) => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            navigate(`/place/${placeId}`);
        }, 5000);
    }

    const [isModalPlaceOpen, setIsModalPlaceOpen] = useState(false);
    const showModalPlace = () => setIsModalPlaceOpen(!isModalPlaceOpen);

    const chatRquestLubAgain = () => {
        setIsModalPlaceOpen(false);
        setModalOpen(true);
    }

    const showModal = () => {
        if (isModalPlaceOpen) setIsModalPlaceOpen(!isModalPlaceOpen);
        setModalOpen(!modalOpen);
    }

    const H3_RES = 10;
    const H3_RADIUS = 10;

    const userCell = latLngToCell(position.lat!, position.lon!, H3_RES);
    const userNearbyCells = gridDisk(userCell, H3_RADIUS);

    const [data, setData] = useState<OverpassResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlaces = async () => {
            setLoading(true);
            setError(null);

            try {
                const overpassQuery = `
                [out:json][timeout:60];
                (
                  node(around:5000,${USER_LAT},${USER_LON})["amenity"~"cafe|bar|restaurant|pub"];
                  node(around:5000,${USER_LAT},${USER_LON})["tourism"~"museum|gallery|attraction"];
                );
                out center 50;
                `;

                const response = await fetch("https://overpass-api.de/api/interpreter", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({ data: overpassQuery })
                });

                if (!response.ok) throw new Error(`Error ${response.status}`);
                const json: OverpassResponse = await response.json();
                setData(json);
            } catch (err: any) {
                setError(err.message || "Failed to fetch");
            } finally {
                setLoading(false);
            }
        };

        fetchPlaces();
    }, []);

    // ---------------- FILTRO H3 ----------------
    const filteredPlaces = useMemo(() => {
        if (!data?.elements) return [];
        return data.elements
            .filter(el => el.lat && el.lon && el?.tags?.name)
            .filter(el => userNearbyCells.includes(latLngToCell(el.lat!, el.lon!, H3_RES)));
    }, [data, userNearbyCells]);

    const suggestions = [
        { name: 'Comida tradicional', category: 'Comida' },
        { name: 'Negocios en crecimiento', category: 'Negocios' },
        { name: 'Día de pasta', category: 'Día de la semana' },
        { name: 'Día de descanso', category: 'Día de la semana' }
    ];

    const DISTANCES_PLACES = [
        {
            name: 'cerca',
            value: 500
        },
        {
            name: '5 km',
            value: 5000
        }, {
            name: '10 km',
            value: 10000
        }, {
            name: '15 km',
            value: 15000
        }, {
            name: '20 km',
            value: 20000
        }, {
            name: '25 km',
            value: 25000
        }, {
            name: '30 km',
            value: 30000
        }] as const;

    return (
        <section className='relative'>
            <Map
                ref={handleMapInit}
                controls={[]}
                interactions={[]}
                style={{ width: "100%", height: "100dvh" }}
                view={view}
            >
                <TileLayer source={new OSM()} />
            </Map>

            <ul className='fixed top-[20%] left-4 bg-white p-2 rounded shadow-lg w-40'>
                {
                    DISTANCES_PLACES.map((d, i) => (
                        <li key={i} className="cursor-pointer p-3 flex items-center gap-4 text-gray-700 bg-white/20 backdrop-blur-xl shadow-sm hover:bg-white/20 hover:shadow-lg transition">
                            <input type="radio" name="distance" className="cursor-pointer w-4 h-4 accent-slate-500" value={d.value} id={`distance-${i}`} />
                            {d.name}
                        </li>
                    ))
                }
            </ul>
            {/* Boton para mostrar la modal */}
            {
                !isModalPlaceOpen && !modalOpen && (
                    <div className="fixed bottom-4 left-4 right-0">
                        <button className="w-14 h-14 bg-gradient-to-b from-primary-500 to-tomato rounded-full flex items-center justify-center cursor-pointer"
                            title="Chatear con Lubi"
                            aria-label="Chatear con Lubi"
                            onClick={showModal}
                        >
                            <span className="text-white text-3xl font-bold">
                                👀
                            </span>
                        </button>
                    </div>

                )
            }

            <Modal isShowingModal={modalOpen} setIsShowingModal={setModalOpen}>
                <form className="p-8 shadow-lg" onSubmit={handleSubmitRequestIA}>
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
                                <span>👀</span><br />
                                Hola, soy <span className="text-purple-700">Lubi</span>
                            </h4>
                            <h3 className="font-bold text-2xl text-center">
                                ¿Qué tienes planeado hoy?
                            </h3>
                        </header>
                        <ul className="flex flex-wrap gap-2 my-4 md:justify-center justify-start">
                            {
                                suggestions.map((suggestion, index) => (
                                    <li className="cursor-pointer p-3 text-sm lg:text-md rounded-xl 
               text-gray-700 bg-white/20 backdrop-blur-xl 
               shadow-sm hover:bg-white/30 hover:shadow-md transition border-purple-500 border" key={index}
                                        onClick={() => selectOptionByIA(suggestion.name)} role="button">
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
                                onChange={(e) => setSelectedOption(e.target.value)}
                                value={selectedOption}
                                required
                                maxLength={250}
                            />
                        </search>
                        <footer className="flex justify-center">
                            <button className={`w-full text-white ${isLoading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-600/90'} rounded-md px-4 py-2  text-md font-semibold`} aria-label="Confirmar" type="submit"
                                disabled={isLoading}>
                                {isLoading ? 'Buscando...' : 'Buscar lugares'}
                            </button>
                        </footer>
                    </section>
                </form>
            </Modal>

            <Modal isShowingModal={isModalPlaceOpen} setIsShowingModal={setIsModalPlaceOpen}>
                <form className="shadow-lg" onSubmit={handleSubmitRequestIA}>
                    <header className=" bg-gradient-to-r from-primary-500 to-tomato p-6 flex items-center justify-between">
                        <h2 className="text-white text-2xl font-bold">Lugares para {selectedOption}</h2>
                        <div className="flex justify-end items-center">
                            <button className="hover:bg-purple-100 rounded-full p-2" aria-label="cerrar preferencias"
                                onClick={showModalPlace}
                                type="button"
                            >
                                <X className='w-6 h-6 text-white' />
                            </button>
                        </div>
                    </header>
                    <section className="container p-6 relative">
                        <header className='absolute top-4 left-6 z-10'>
                            <button
                                className="w-14 h-14 bg-gradient-to-b from-primary-500 to-tomato rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                                title="Chatear con Lubi"
                                aria-label="Chatear con Lubi"
                                onClick={chatRquestLubAgain}
                            >
                                <span className="text-white text-3xl font-bold">
                                    👀
                                </span>
                            </button>
                        </header>

                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 auto-rows-fr'>
                            {
                                places.map((place) => (
                                    <PlaceCard
                                        key={place.id}
                                        place={place}
                                        onClick={() => handlePlaceClick(place.id)}
                                    />
                                ))
                            }
                        </div>
                    </section>

                </form>
            </Modal>


        </section >
    );
};

export default Explore;
