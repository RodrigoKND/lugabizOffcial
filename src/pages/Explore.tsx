import { useState, useEffect, useMemo } from 'react';
import { OSM } from "ol/source";
import { Map, View, TileLayer } from 'react-openlayers';
import 'react-openlayers/dist/index.css';
import { X } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { latLngToCell, gridDisk } from "h3-js";

interface OverpassElement {
    id: number;
    lat?: number;
    lon?: number;
    tags?: Record<string, string>;
}

interface OverpassResponse {
    elements: OverpassElement[];
}

const Explore: React.FC = () => {
    const USER_LAT = -17.3932544;
    const USER_LON = -66.1061632;
    const H3_RES = 10;
    const H3_RADIUS = 10;

    const userCell = latLngToCell(USER_LAT, USER_LON, H3_RES);
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

    const [modalOpen, setModalOpen] = useState(false);
    const showModal = () => setModalOpen(!modalOpen);

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
            <Map controls={[]} interactions={[]} style={{ width: "100%", height: "100dvh" }}>
                <TileLayer source={new OSM()} />
                <View center={[USER_LON, USER_LAT]} zoom={15} />
            </Map>

            <ul className='fixed top-[20%] left-4 bg-white p-2 rounded shadow-lg w-40'>
                {
                    DISTANCES_PLACES.map((d, i) => (
                        <li key={i} className="cursor-pointer p-3
                                            flex items-center gap-4
                                               text-gray-700 bg-white/20 backdrop-blur-xl 
                                               shadow-sm hover:bg-white/20 hover:shadow-lg transition">
                            <input type="radio" name="distance" className="cursor-pointer w-4 h-4 accent-slate-500" value={d.value} id={`distance-${i}`} />
                            {d.name}
                        </li>
                    ))
                }
            </ul>

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
                                <span>👀</span><br />
                                Hola, soy <span className="text-purple-700">Lubi</span>
                            </h4>
                            <h3 className="font-bold text-2xl text-center">
                                ¿Qué tienes planeado hoy?
                            </h3>
                        </header>

                        <ul className="flex flex-wrap gap-2 my-4 md:justify-center justify-start">
                            {
                                suggestions.map((s, i) => (
                                    <li key={i}
                                        className="cursor-pointer p-3 rounded-xl 
                                               text-gray-700 bg-white/20 backdrop-blur-xl 
                                               shadow-sm hover:bg-white/30 hover:shadow-md transition border-purple-500 border">
                                        {s.name}
                                    </li>
                                ))
                            }
                        </ul>

                        <textarea
                            placeholder="Quiero lugares para pasar el tiempo con amigos"
                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:border-purple-500"
                            cols={5}
                        ></textarea>
                    </section>

                    <footer className="flex justify-center">
                        <button className="w-full text-white bg-purple-600 rounded-md px-4 py-2 hover:bg-purple-600/90 text-md font-semibold" aria-label="Confirmar" type="button">
                            Buscar
                        </button>
                    </footer>
                </form>
            </Modal>

        </section>
    );
};

export default Explore;
