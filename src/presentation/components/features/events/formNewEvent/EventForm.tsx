import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Image, Send, Calendar, Clock, Users, Ticket, ChevronDown, Sparkles, Plus, Minus } from 'lucide-react';
import { usePlaces } from '@presentation/context';

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EventFormData {
  title: string;
  description: string;
  location: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  imageUrl: string;
  capacity?: number;
  price?: number;
  isFree: boolean;
  eventLink?: string;
  organizer?: string;
}

const EventForm: React.FC<EventFormProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    location: '',
    category: 'Gastronomía',
    date: '',
    startTime: '',
    endTime: '',
    imageUrl: '',
    capacity: undefined,
    price: undefined,
    isFree: true,
    eventLink: '',
    organizer: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUrlChange = (url: string) => {
    handleChange('imageUrl', url);
    if (url.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)/i)) {
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Event created:', formData);
    onClose();
  };

  const isFormValid = formData.title && formData.description && formData.location && formData.date && formData.startTime;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-gradient-to-br from-white via-white to-gray-50 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader onClose={onClose} />

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <BasicEventInfo formData={formData} onChange={handleChange} />

              <EventLocationAndMap formData={formData} onChange={handleChange} />

              <EventDateTime formData={formData} onChange={handleChange} />

              <EventImageSection
                formData={formData}
                imagePreview={imagePreview}
                onImageChange={handleImageUrlChange}
                onClear={() => setImagePreview(null)}
              />

              <EventDetails formData={formData} onChange={handleChange} />

              <SubmitButton isFormValid={Boolean(isFormValid)} />
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ModalHeader = ({ onClose }: { onClose: () => void }) => (
  <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-[#9C3FE4] to-[#F1746B] rounded-xl flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <h2 className="text-xl font-black text-gray-900 tracking-tight">Crear Evento</h2>
    </div>
    <button
      onClick={onClose}
      className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
    >
      <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
    </button>
  </div>
);

interface BasicEventInfoProps {
  formData: EventFormData;
  onChange: (field: keyof EventFormData, value: any) => void;
}

const BasicEventInfo: React.FC<BasicEventInfoProps> = ({ formData, onChange }) => {
  const { categories } = usePlaces();
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Título del evento</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          className="w-full px-5 py-4 bg-gray-50/80 border-2 border-transparent rounded-2xl focus:border-[#9C3FE4] focus:bg-white focus:ring-0 transition-all duration-300 text-gray-900 placeholder:text-gray-400 font-medium text-lg"
          placeholder="Ej. Noche de Jazz en el Parque"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descripción</label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          className="w-full px-5 py-4 bg-gray-50/80 border-2 border-transparent rounded-2xl focus:border-[#9C3FE4] focus:bg-white focus:ring-0 transition-all duration-300 text-gray-900 placeholder:text-gray-400 font-medium resize-none"
          placeholder="¿De qué se trata el evento? Cuéntanos más detalles..."
          rows={4}
          required
        />
      </div>

      <div className="relative">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categoría</label>
        <select
          value={formData.category}
          onChange={(e) => onChange('category', e.target.value)}
          className="w-full px-5 py-4 bg-gray-50/80 border-2 border-transparent rounded-2xl focus:border-[#9C3FE4] focus:bg-white focus:ring-0 transition-all duration-300 text-gray-900 font-medium appearance-none cursor-pointer"
        >
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-5 bottom-4 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

const EventLocationAndMap: React.FC<BasicEventInfoProps> = ({ formData, onChange }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ubicación</label>
      <div className="relative">
        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C3FE4]" />
        <input
          type="text"
          value={formData.location}
          onChange={(e) => onChange('location', e.target.value)}
          className="w-full pl-14 pr-5 py-4 bg-gray-50/80 border-2 border-transparent rounded-2xl focus:border-[#9C3FE4] focus:bg-white focus:ring-0 transition-all duration-300 text-gray-900 placeholder:text-gray-400 font-medium"
          placeholder="Dirección completa del evento"
          required
        />
      </div>
    </div>

    <div className="aspect-[21/9] bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl border-2 border-dashed border-gray-200 relative overflow-hidden flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-400 font-medium">Área del Mapa</p>
        <p className="text-gray-300 text-sm">Arrastra para seleccionar ubicación</p>
      </div>
      <div className="absolute right-4 bottom-4 flex flex-col gap-2">
        <button type="button" className="bg-white p-2 rounded-xl shadow-md border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors">
          <Plus className='w-5 h-5' />
        </button>
        <button type="button" className="bg-white p-2 rounded-xl shadow-md border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors">
          <Minus className='w-5 h-5' />
        </button>
      </div>
    </div>
  </div>
);

const EventDateTime: React.FC<BasicEventInfoProps> = ({ formData, onChange }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          <Calendar className="w-4 h-4 inline mr-1" /> Fecha
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => onChange('date', e.target.value)}
          className="w-full px-5 py-4 bg-gray-50/80 border-2 border-transparent rounded-2xl focus:border-[#9C3FE4] focus:bg-white focus:ring-0 transition-all duration-300 text-gray-900 font-medium"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          <Clock className="w-4 h-4 inline mr-1" /> Hora inicio
        </label>
        <input
          type="time"
          value={formData.startTime}
          onChange={(e) => onChange('startTime', e.target.value)}
          className="w-full px-5 py-4 bg-gray-50/80 border-2 border-transparent rounded-2xl focus:border-[#9C3FE4] focus:bg-white focus:ring-0 transition-all duration-300 text-gray-900 font-medium"
          required
        />
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Hora de fin (opcional)</label>
        <input
          type="time"
          value={formData.endTime}
          onChange={(e) => onChange('endTime', e.target.value)}
          className="w-full px-5 py-4 bg-gray-50/80 border-2 border-transparent rounded-2xl focus:border-[#9C3FE4] focus:bg-white focus:ring-0 transition-all duration-300 text-gray-900 font-medium"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Capacidad (opcional)</label>
        <div className="relative">
          <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="number"
            min={1}
            value={formData.capacity || ''}
            onChange={(e) => onChange('capacity', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full pl-14 pr-5 py-4 bg-gray-50/80 border-2 border-transparent rounded-2xl focus:border-[#9C3FE4] focus:bg-white focus:ring-0 transition-all duration-300 text-gray-900 font-medium"
            placeholder="Límite de asistentes"
          />
        </div>
      </div>
    </div>
  </div>
);

interface EventImageSectionProps {
  formData: EventFormData;
  imagePreview: string | null;
  onImageChange: (url: string) => void;
  onClear: () => void;
}

const EventImageSection: React.FC<EventImageSectionProps> = ({ formData, imagePreview, onImageChange, onClear }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Imagen del evento</label>
    <div className="relative">
      <Image className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="url"
        value={formData.imageUrl}
        onChange={(e) => onImageChange(e.target.value)}
        className="w-full pl-14 pr-5 py-4 bg-gray-50/80 border-2 border-transparent rounded-2xl focus:border-[#9C3FE4] focus:bg-white focus:ring-0 transition-all duration-300 text-gray-900 placeholder:text-gray-400 font-medium"
        placeholder="https://ejemplo.com/imagen.jpg"
      />
    </div>
    {imagePreview && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="mt-3 rounded-2xl overflow-hidden relative aspect-video"
      >
        <img
          src={imagePreview}
          alt="Preview"
          className="w-full h-full object-cover"
          onError={onClear}
        />
      </motion.div>
    )}
  </div>
);

const EventDetails: React.FC<BasicEventInfoProps> = ({ formData, onChange }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 p-4 bg-gray-50/80 rounded-2xl">
      <input
        type="checkbox"
        id="isFree"
        checked={formData.isFree}
        onChange={(e) => onChange('isFree', e.target.checked)}
        className="w-5 h-5 rounded border-gray-300 text-[#9C3FE4] focus:ring-[#9C3FE4]"
      />
      <label htmlFor="isFree" className="font-semibold text-gray-700">Evento gratuito</label>
    </div>

    {!formData.isFree && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4"
      >
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Precio ($)</label>
          <div className="relative">
            <Ticket className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min={0}
              step={0.01}
              value={formData.price || ''}
              onChange={(e) => onChange('price', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full pl-14 pr-5 py-4 bg-gray-50/80 border-2 border-transparent rounded-2xl focus:border-[#9C3FE4] focus:bg-white focus:ring-0 transition-all duration-300 text-gray-900 font-medium"
              placeholder="0.00"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Link de compra</label>
          <input
            type="url"
            value={formData.eventLink || ''}
            onChange={(e) => onChange('eventLink', e.target.value)}
            className="w-full px-5 py-4 bg-gray-50/80 border-2 border-transparent rounded-2xl focus:border-[#9C3FE4] focus:bg-white focus:ring-0 transition-all duration-300 text-gray-900 placeholder:text-gray-400 font-medium"
            placeholder="https://..."
          />
        </div>
      </motion.div>
    )}

    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Organizador (opcional)</label>
      <input
        type="text"
        value={formData.organizer || ''}
        onChange={(e) => onChange('organizer', e.target.value)}
        className="w-full px-5 py-4 bg-gray-50/80 border-2 border-transparent rounded-2xl focus:border-[#9C3FE4] focus:bg-white focus:ring-0 transition-all duration-300 text-gray-900 placeholder:text-gray-400 font-medium"
        placeholder="Nombre del organizador o empresa"
      />
    </div>
  </div>
);

const SubmitButton = ({ isFormValid }: { isFormValid: boolean }) => (
  <motion.button
    type="submit"
    whileHover={{ scale: isFormValid ? 1.02 : 1 }}
    whileTap={{ scale: isFormValid ? 0.98 : 1 }}
    className={`w-full py-5 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${isFormValid
      ? 'bg-gradient-to-r from-[#9C3FE4] to-[#F1746B] hover:shadow-xl'
      : 'bg-gray-300 cursor-not-allowed opacity-70'
      }`}
  >
    <Send className="w-5 h-5" />
    Publicar Evento
  </motion.button>
);

export default EventForm;