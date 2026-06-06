import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Send, Image, X, Plus } from 'lucide-react';
import { eventsService } from '@lib/supabase';
import { Event } from '@domain/entities';
import { useAuth } from '@presentation/context';
import { useSEO } from '@presentation/hooks/seo/useSEO';

const MAX_GALLERY_BYTES = 10 * 1024 * 1024; // 10 MB total

function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatMB(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(1);
}

const EditEventPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cover image
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  // Gallery images (existing URLs + new Files)
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '', description: '', address: '', categoryId: '',
    dateStart: '', timeStart: '', timeEnd: '', price: 0, capacity: 0,
    isFree: false, tags: '',
  });

  useSEO({ title: 'Editar Evento', description: 'Editar evento en Lugabiz' });

  useEffect(() => {
    if (!id) return;
    eventsService.getEventById(id).then((data) => {
      if (!data) { toast.error('Evento no encontrado'); navigate('/'); return; }
      if (user && data.userId !== user.id) { toast.error('No autorizado'); navigate('/'); return; }
      setEvent(data);
      setForm({
        name: data.name,
        description: data.description,
        address: data.address,
        categoryId: data.categoryId,
        dateStart: toLocalDateStr(data.dateStart instanceof Date ? data.dateStart : new Date(data.dateStart)),
        timeStart: data.timeStart,
        timeEnd: data.timeEnd || '',
        price: data.price || 0,
        capacity: data.capacity || 0,
        isFree: data.isFree,
        tags: (data.tags || []).join(', '),
      });
      if (data.image) setCoverPreview(data.image);
      if (data.gallery?.length) setGalleryUrls(data.gallery);
    }).catch((err) => {
      console.error('Error loading event:', err);
      toast.error('Error al cargar el evento');
      navigate('/');
    }).finally(() => setLoading(false));
  }, [id, user, navigate]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const clearCover = () => {
    setCoverPreview(null);
    setCoverFile(null);
    if (coverRef.current) coverRef.current.value = '';
  };

  const handleGalleryAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Compute total size: existing new files + new selections
    const existingNewSize = galleryFiles.reduce((s, f) => s + f.size, 0);
    const newSize = files.reduce((s, f) => s + f.size, 0);
    if (existingNewSize + newSize > MAX_GALLERY_BYTES) {
      toast.error(`El total supera los 10 MB. Tamaño actual de nuevas imágenes: ${formatMB(existingNewSize)} MB + ${formatMB(newSize)} MB nuevos.`);
      if (galleryRef.current) galleryRef.current.value = '';
      return;
    }

    setGalleryFiles(prev => [...prev, ...files]);
    setGalleryPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    if (galleryRef.current) galleryRef.current.value = '';
  };

  const removeExistingGallery = (url: string) => {
    setGalleryUrls(prev => prev.filter(u => u !== url));
  };

  const removeNewGallery = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      let coverUrl = coverPreview && !coverFile ? coverPreview : undefined;
      if (coverFile) {
        coverUrl = await eventsService.uploadCoverImage(coverFile);
      }

      // Upload new gallery images
      const uploadedGallery: string[] = [];
      for (const file of galleryFiles) {
        const url = await eventsService.uploadCoverImage(file);
        uploadedGallery.push(url);
      }
      const finalGallery = [...galleryUrls, ...uploadedGallery];

      await eventsService.updateEvent(id, {
        name: form.name,
        description: form.description,
        address: form.address,
        categoryId: form.categoryId,
        dateStart: form.dateStart,
        timeStart: form.timeStart,
        timeEnd: form.timeEnd || undefined,
        price: form.price,
        capacity: form.capacity || undefined,
        isFree: form.isFree,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        image: coverUrl,
        gallery: finalGallery,
      });
      toast.success('Evento actualizado');
      navigate(`/event/${id}`);
    } catch {
      toast.error('Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const iCls = 'w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-400';

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
    </div>
  );

  if (!event) return null;

  const totalNewMB = galleryFiles.reduce((s, f) => s + f.size, 0) / 1024 / 1024;

  return (
    <section className="min-h-screen bg-stone-50 text-stone-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link to={`/event/${id}`} className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" /> Volver al evento
        </Link>
        <h1 className="text-2xl font-bold mb-6">Editar Evento</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-stone-200 space-y-5">

          {/* Imagen de portada */}
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase block mb-2">Imagen de portada</label>
            <input ref={coverRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
            {coverPreview ? (
              <div className="flex items-start gap-3">
                <div className="relative w-32 h-20 rounded-xl overflow-hidden ring-1 ring-stone-200 shrink-0">
                  <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={clearCover}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <button type="button" onClick={() => coverRef.current?.click()}
                  className="text-xs text-amber-600 hover:underline self-center">
                  Cambiar imagen
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => coverRef.current?.click()}
                className="flex items-center gap-2 px-4 py-3 bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl hover:border-amber-400 hover:bg-amber-50/30 transition-all text-sm text-stone-500">
                <Image className="w-4 h-4" />
                Seleccionar imagen de portada
              </button>
            )}
          </div>

          {/* Galería de imágenes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-500 uppercase">Galería</label>
              {galleryFiles.length > 0 && (
                <span className={`text-[11px] font-medium ${totalNewMB > 8 ? 'text-red-500' : 'text-stone-400'}`}>
                  {totalNewMB.toFixed(1)} / 10 MB
                </span>
              )}
            </div>
            <input ref={galleryRef} type="file" accept="image/*" multiple onChange={handleGalleryAdd} className="hidden" />
            <div className="flex flex-wrap gap-2">
              {/* Existing gallery images */}
              {galleryUrls.map((url) => (
                <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden ring-1 ring-stone-200 group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeExistingGallery(url)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {/* New gallery images */}
              {galleryPreviews.map((src, i) => (
                <div key={`new-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden ring-2 ring-amber-400 group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeNewGallery(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {/* Add button */}
              <button type="button" onClick={() => galleryRef.current?.click()}
                className="flex flex-col items-center justify-center w-20 h-20 bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl hover:border-amber-400 hover:bg-amber-50/30 transition-all text-stone-400 hover:text-amber-500">
                <Plus className="w-5 h-5" />
                <span className="text-[9px] mt-1">Agregar</span>
              </button>
            </div>
            <p className="text-[10px] text-stone-400 mt-1.5">Máximo 10 MB en total para imágenes nuevas</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase">Nombre</label>
            <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className={iCls} />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase">Descripción</label>
            <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className={`${iCls} resize-none`} rows={4} />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase">Dirección</label>
            <input type="text" value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} className={iCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase">Fecha</label>
              <input type="date" value={form.dateStart} onChange={(e) => setForm(f => ({ ...f, dateStart: e.target.value }))} className={iCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase">Hora inicio</label>
              <input type="time" value={form.timeStart} onChange={(e) => setForm(f => ({ ...f, timeStart: e.target.value }))} className={iCls} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase">Hora fin <span className="text-stone-400 font-normal">(opcional)</span></label>
            <input type="time" value={form.timeEnd} onChange={(e) => setForm(f => ({ ...f, timeEnd: e.target.value }))} className={iCls} />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase">Tags (separados por coma)</label>
            <input type="text" value={form.tags} onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))} className={iCls} />
          </div>
          <button type="submit" disabled={saving}
            className="w-full py-3.5 bg-amber-500 text-white rounded-xl font-semibold text-sm hover:bg-amber-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default EditEventPage;
