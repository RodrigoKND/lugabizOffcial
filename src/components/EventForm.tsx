"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image, Sparkles } from "lucide-react";
import {
  Map,
  MapMarker,
  MarkerContent,
  MapControls,
  useMap,
} from "@/components/ui/map";

interface EventFormData {
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  price: string;
  capacity: string;
  coverImage: string | null;
  tags: string[];
  location: {
    latitude: number;
    longitude: number;
  } | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  "Gastronomía",
  "Música",
  "Cine",
  "Teatro",
  "Deportes",
  "Arte",
  "Tecnología",
  "Educación",
  "Otro",
];

function MapClickHandler({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;

    const handler = (e: any) => {
      onSelect(e.lngLat.lat, e.lngLat.lng);
    };

    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [map, onSelect]);

  return null;
}

export default function EventForm({ isOpen, onClose }: Props) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [tagInput, setTagInput] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    category: "",
    date: "",
    time: "",
    price: "",
    capacity: "",
    coverImage: null,
    tags: [],
    location: null,
  });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((p) => ({ ...p, coverImage: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const clean = tagInput.trim().toLowerCase();
      if (!clean || formData.tags.includes(clean)) return;

      setFormData((p) => ({ ...p, tags: [...p.tags, clean] }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((p) => ({
      ...p,
      tags: p.tags.filter((t) => t !== tag),
    }));
  };

  const generateAISuggestions = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      setAiSuggestions({
        title: "Noche de Jazz en Vivo – Experiencia Íntima",
        description:
          "Música en vivo con artistas locales, ambiente acogedor, bebidas y comida.",
        price: "Bs. 50 – incluye bebida",
      });
      setIsGeneratingAI(false);
    }, 1500);
  };

  const applySuggestion = (field: string, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
    setAiSuggestions((p) => {
      const copy = { ...p };
      delete copy[field];
      return copy;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Crear evento</h2>
              <div className="flex gap-2">
                <button
                  onClick={generateAISuggestions}
                  disabled={isGeneratingAI}
                  className="flex items-center gap-1 px-3 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 disabled:opacity-50"
                >
                  <Sparkles size={16} />
                  {isGeneratingAI ? "Generando..." : "IA"}
                </button>
                <button onClick={onClose} className="hover:bg-gray-100 p-2 rounded-lg">
                  <X />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* IMAGE */}
              <div>
                <label className="block text-sm font-medium mb-2">Imagen de portada</label>
                {formData.coverImage ? (
                  <div className="relative">
                    <img
                      src={formData.coverImage}
                      alt="Cover"
                      className="h-48 w-full object-cover rounded-xl"
                    />
                    <button
                      onClick={() => setFormData(p => ({ ...p, coverImage: null }))}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    className="h-48 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center hover:border-purple-500 hover:bg-purple-50 transition"
                  >
                    <Image size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Clic para subir imagen</span>
                  </button>
                )}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </div>

              {/* TITLE */}
              <div>
                <label className="block text-sm font-medium mb-2">Nombre del evento *</label>
                <input
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ej: Concierto de Rock en vivo"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                {aiSuggestions.title && (
                  <button
                    onClick={() => applySuggestion("title", aiSuggestions.title)}
                    className="text-sm text-purple-600 hover:text-purple-800 mt-1 flex items-center gap-1"
                  >
                    <Sparkles size={12} />
                    Aplicar sugerencia IA: "{aiSuggestions.title}"
                  </button>
                )}
              </div>

              {/* CATEGORY */}
              <div>
                <label className="block text-sm font-medium mb-2">Categoría *</label>
                <select
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Seleccionar categoría</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* DATE & TIME */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Fecha *</label>
                  <input
                    type="date"
                    className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hora *</label>
                  <input
                    type="time"
                    className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              {/* PRICE & CAPACITY */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Precio</label>
                  <input
                    type="text"
                    className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ej: Bs. 50 o Gratis"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Capacidad</label>
                  <input
                    type="number"
                    className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ej: 100"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-sm font-medium mb-2">Descripción *</label>
                <textarea
                  rows={4}
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe tu evento..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                {aiSuggestions.description && (
                  <button
                    onClick={() => applySuggestion("description", aiSuggestions.description)}
                    className="text-sm text-purple-600 hover:text-purple-800 mt-1 flex items-center gap-1"
                  >
                    <Sparkles size={12} />
                    Aplicar sugerencia IA
                  </button>
                )}
              </div>

              {/* MAP */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ubicación * {formData.location && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({formData.location.latitude.toFixed(4)}, {formData.location.longitude.toFixed(4)})
                    </span>
                  )}
                </label>
                <p className="text-xs text-gray-500 mb-2">Haz clic en el mapa para seleccionar la ubicación</p>
                <div className="h-[300px] rounded-xl overflow-hidden border">
                  <Map center={[-66.1568, -17.3895]} zoom={13}>
                    <MapControls showZoom showLocate showFullscreen />
                    <MapClickHandler
                      onSelect={(lat, lng) =>
                        setFormData((p) => ({
                          ...p,
                          location: { latitude: lat, longitude: lng },
                        }))
                      }
                    />
                    {formData.location && (
                      <MapMarker
                        latitude={formData.location.latitude}
                        longitude={formData.location.longitude}
                        draggable
                        onDragEnd={(e: any) =>
                          setFormData((p) => ({
                            ...p,
                            location: {
                              latitude: e.lat,
                              longitude: e.lng,
                            },
                          }))
                        }
                      >
                        <MarkerContent>
                          <div className="relative h-8 w-8 rounded-full border-4 border-white bg-purple-500 shadow-lg flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-white"></div>
                          </div>
                        </MarkerContent>
                      </MapMarker>
                    )}
                  </Map>
                </div>
              </div>

              {/* TAGS */}
              <div>
                <label className="block text-sm font-medium mb-2">Etiquetas</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      onClick={() => removeTag(tag)}
                      className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm cursor-pointer hover:bg-purple-600 flex items-center gap-1"
                    >
                      #{tag}
                      <X size={14} />
                    </span>
                  ))}
                </div>
                <input
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Escribe una etiqueta y presiona Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
              </div>
            </div>

            <div className="p-6 border-t">
              <button 
                className="w-full py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium transition"
                onClick={() => {
                  console.log("Evento creado:", formData);
                  onClose();
                }}
              >
                Publicar evento
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}