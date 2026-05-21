import React, { useState, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  X, MapPin, Image, Send, Calendar, Clock, Users,
  ChevronDown, Sparkles, Tag, Locate, Loader2, AlertCircle
} from 'lucide-react';
import { usePlaces, useAuth } from '@presentation/context';
import { storageService } from '@lib/supabase';

const MapPicker = lazy(() => import('./MapPicker'));

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ValidationErrors {
  name?: string;
  description?: string;
  categoryId?: string;
  address?: string;
  dateStart?: string;
  timeStart?: string;
  coords?: string;
}

const EventForm: React.FC<EventFormProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { categories, addEvent } = usePlaces();
  const [step, setStep] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    categoryId: '',
    dateStart: '',
    timeStart: '',
    timeEnd: '',
    capacity: 0,
    price: 0,
    isFree: true,
    tags: '',
    coords: [] as number[],
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validation = storageService.validateMultipleFiles(files, 5, 10);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setImageFiles(prev => [...prev, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleCoordsChange = useCallback((lat: number, lng: number) => {
    handleChange('coords', [lat, lng]);
  }, []);

  const validate = (): boolean => {
    const errs: ValidationErrors = {};

    if (!formData.name?.trim()) errs.name = 'El nombre es obligatorio';
    else if (formData.name.length < 3) errs.name = 'Mínimo 3 caracteres';

    if (!formData.description?.trim()) errs.description = 'La descripción es obligatoria';
    else if (formData.description.length < 10) errs.description = 'Mínimo 10 caracteres';

    if (!formData.categoryId) errs.categoryId = 'Selecciona una categoría';
    if (!formData.dateStart) errs.dateStart = 'Selecciona una fecha';
    if (!formData.timeStart) errs.timeStart = 'Selecciona una hora';
    if (!formData.address?.trim()) errs.address = 'La dirección es obligatoria';
    if (formData.coords.length !== 2) errs.coords = 'Selecciona una ubicación en el mapa';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Corrige los errores antes de continuar');
      return;
    }
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (imageFiles.length > 0) {
        const urls = await storageService.uploadMultipleFiles(imageFiles, 'events');
        imageUrl = urls[0];
      }

      const eventData = {
        ...formData,
        image: imageUrl,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        userId: user.id,
      };

      const event = await addEvent(eventData);
      if (event) {
        toast.success('Evento creado con éxito!');
        onClose();
      }
    } catch {
      toast.error('Error al crear el evento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 0: return formData.name.length >= 3 && formData.description.length >= 10 && formData.categoryId;
      case 1: return formData.dateStart && formData.timeStart;
      case 2: return formData.coords.length === 2;
      case 3: return true;
      default: return true;
    }
  };

  const totalSteps = 4;

  const renderError = (field: string) => {
    if (!touched[field] || !errors[field as keyof ValidationErrors]) return null;
    return (
      <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
        <AlertCircle className="w-3 h-3" /> {errors[field as keyof ValidationErrors]}
      </p>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}>
          <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl"
            onClick={e => e.stopPropagation()}>

            <div className="sticky top-0 bg-white border-b border-stone-100 px-5 py-3.5 flex items-center justify-between z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </div>
                <h2 className="text-base font-bold text-stone-800">Crear Evento</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i <= step ? 'bg-amber-500' : 'bg-stone-200'}`} />
                  ))}
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-stone-400" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-120px)]">
              {step === 0 && (
                <motion.div key="s0" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                  <h3 className="text-base font-bold text-stone-800">Información básica</h3>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-500 uppercase">Nombre del evento</label>
                    <input type="text" value={formData.name}
                      onChange={e => handleChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-sm outline-none focus:ring-0 ${
                        touched.name && errors.name ? 'border-red-300' : 'border-stone-200 focus:border-amber-400'
                      }`}
                      placeholder="Ej. Cata de vinos" />
                    {renderError('name')}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-500 uppercase">Descripción</label>
                    <textarea value={formData.description}
                      onChange={e => handleChange('description', e.target.value)}
                      onBlur={() => handleBlur('description')}
                      rows={3}
                      className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-sm resize-none outline-none focus:ring-0 ${
                        touched.description && errors.description ? 'border-red-300' : 'border-stone-200 focus:border-amber-400'
                      }`}
                      placeholder="Describe tu evento..." />
                    {renderError('description')}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-500 uppercase">Categoría</label>
                    <div className="relative">
                      <select value={formData.categoryId}
                        onChange={e => handleChange('categoryId', e.target.value)}
                        onBlur={() => handleBlur('categoryId')}
                        className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-sm appearance-none cursor-pointer outline-none focus:ring-0 ${
                          touched.categoryId && errors.categoryId ? 'border-red-300' : 'border-stone-200 focus:border-amber-400'
                        }`}>
                        <option value="">Selecciona</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    </div>
                    {renderError('categoryId')}
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                    <input type="checkbox" id="isFree" checked={formData.isFree}
                      onChange={e => handleChange('isFree', e.target.checked)}
                      className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400" />
                    <label htmlFor="isFree" className="text-sm font-medium text-stone-700">Evento gratuito</label>
                  </div>

                  {!formData.isFree && (
                    <div>
                      <label className="text-xs font-semibold text-stone-500 uppercase">Precio (Bs)</label>
                      <input type="number" min={0} value={formData.price || ''}
                        onChange={e => handleChange('price', Number(e.target.value))}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-0" />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-stone-500 uppercase">
                      <Tag className="w-3.5 h-3.5 inline mr-1" /> Tags (separados por coma)
                    </label>
                    <input type="text" value={formData.tags}
                      onChange={e => handleChange('tags', e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-0"
                      placeholder="música, arte, cultura" />
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="s1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                  <h3 className="text-base font-bold text-stone-800">Fecha y ubicación</h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-500 uppercase">Fecha</label>
                      <input type="date" value={formData.dateStart}
                        onChange={e => handleChange('dateStart', e.target.value)}
                        onBlur={() => handleBlur('dateStart')}
                        className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-sm outline-none focus:ring-0 ${
                          touched.dateStart && errors.dateStart ? 'border-red-300' : 'border-stone-200 focus:border-amber-400'
                        }`} />
                      {renderError('dateStart')}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-500 uppercase">Hora inicio</label>
                      <input type="time" value={formData.timeStart}
                        onChange={e => handleChange('timeStart', e.target.value)}
                        onBlur={() => handleBlur('timeStart')}
                        className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-sm outline-none focus:ring-0 ${
                          touched.timeStart && errors.timeStart ? 'border-red-300' : 'border-stone-200 focus:border-amber-400'
                        }`} />
                      {renderError('timeStart')}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-500 uppercase">Hora fin</label>
                      <input type="time" value={formData.timeEnd}
                        onChange={e => handleChange('timeEnd', e.target.value)}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-0" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-500 uppercase">Capacidad</label>
                      <input type="number" min={0} value={formData.capacity || ''}
                        onChange={e => handleChange('capacity', Number(e.target.value))}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-0"
                        placeholder="Máx asistentes" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-500 uppercase">Dirección</label>
                    <input type="text" value={formData.address}
                      onChange={e => handleChange('address', e.target.value)}
                      onBlur={() => handleBlur('address')}
                      className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-sm outline-none focus:ring-0 ${
                        touched.address && errors.address ? 'border-red-300' : 'border-stone-200 focus:border-amber-400'
                      }`}
                      placeholder="Dirección del evento" />
                    {renderError('address')}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-500 uppercase mb-1 block">
                      <Image className="w-3.5 h-3.5 inline mr-1" /> Imágenes
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <label className="flex items-center justify-center w-16 h-16 bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all">
                        <Image className="w-5 h-5 text-stone-400" />
                        <input type="file" accept="image/*" onChange={handleImage} className="hidden" multiple />
                      </label>
                      {imagePreviews.map((src, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden group">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeImage(i)}
                            className="absolute top-0.5 right-0.5 bg-black/40 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1">Máx 5 imágenes, 10MB total</p>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                  <h3 className="text-base font-bold text-stone-800">Ubicación en el mapa</h3>
                  <p className="text-xs text-stone-500">Haz clic en el mapa para marcar la ubicación. Arrastra el marcador para ajustar.</p>
                  <Suspense fallback={
                    <div className="aspect-video bg-stone-100 rounded-xl flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                    </div>
                  }>
                    <MapPicker initialCoords={formData.coords} onCoordsChange={handleCoordsChange} />
                  </Suspense>
                  {renderError('coords')}
                  {formData.coords.length === 2 && (
                    <div className="flex items-center gap-2 text-xs text-stone-500 bg-amber-50 px-3 py-2 rounded-xl">
                      <Locate className="w-3.5 h-3.5 text-amber-500" />
                      <span>{formData.coords[0].toFixed(6)}, {formData.coords[1].toFixed(6)}</span>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                  <h3 className="text-base font-bold text-stone-800">Revisa tu evento</h3>
                  <div className="bg-stone-50 rounded-xl p-5 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-stone-400 text-xs">Nombre</p>
                        <p className="font-medium text-stone-800">{formData.name}</p>
                      </div>
                      <div>
                        <p className="text-stone-400 text-xs">Categoría</p>
                        <p className="font-medium text-stone-800">{categories.find(c => c.id === formData.categoryId)?.name}</p>
                      </div>
                      <div>
                        <p className="text-stone-400 text-xs">Fecha</p>
                        <p className="font-medium text-stone-800">{formData.dateStart} {formData.timeStart}</p>
                      </div>
                      <div>
                        <p className="text-stone-400 text-xs">Precio</p>
                        <p className="font-medium text-stone-800">{formData.isFree ? 'Gratis' : `Bs. ${formData.price}`}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-stone-400 text-xs">Dirección</p>
                        <p className="font-medium text-stone-800">{formData.address}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-stone-400 text-xs">Coordenadas</p>
                        <p className="font-medium text-stone-800">
                          {formData.coords.length === 2 ? `${formData.coords[0].toFixed(6)}, ${formData.coords[1].toFixed(6)}` : 'No definidas'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-stone-400 text-xs">Imágenes</p>
                        <p className="font-medium text-stone-800">{imageFiles.length} imagen(es) seleccionada(s)</p>
                      </div>
                    </div>
                  </div>
                  {formData.tags && (
                    <div className="flex flex-wrap gap-1.5">
                      {formData.tags.split(',').filter(Boolean).map((tag, i) => (
                        <span key={i} className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-medium">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setStep(s => Math.max(0, s - 1))}
                  className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${step === 0 ? 'invisible' : 'text-stone-600 hover:bg-stone-100'}`}>
                  Anterior
                </button>
                {step < totalSteps - 1 ? (
                  <button type="button" onClick={() => {
                    if (step === 0) { setTouched(t => ({ ...t, name: true, description: true, categoryId: true })); }
                    if (step === 1) { setTouched(t => ({ ...t, dateStart: true, timeStart: true, address: true })); }
                    if (!isStepValid()) { validate(); return; }
                    setStep(s => s + 1);
                  }}
                    className="px-6 py-2.5 bg-amber-500 text-white rounded-xl font-medium text-sm hover:bg-amber-600 transition-all">
                    Siguiente
                  </button>
                ) : (
                  <button type="submit" disabled={isSubmitting}
                    className="px-6 py-2.5 bg-amber-500 text-white rounded-xl font-medium text-sm hover:bg-amber-600 transition-all disabled:opacity-50 flex items-center gap-2">
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Publicar Evento</>
                    )}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventForm;
