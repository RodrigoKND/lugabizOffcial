import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Send, ImagePlus, X, Trash2 } from 'lucide-react';
import { supabase } from '@lib/supabase/client';
import { placesService } from '@lib/supabase';
import { useAuth } from '@presentation/context';
import { useSEO } from '@presentation/hooks/seo/useSEO';

const EditPlacePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', address: '', categoryId: '',
    latitude: 0, longitude: 0,
  });
  const [image, setImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);

  useSEO({ title: 'Editar Lugar', description: 'Editar lugar en Lugabiz' });

  useEffect(() => {
    if (!id) return;
    placesService.getPlaceById(id).then((data) => {
      if (!data) { toast.error('Lugar no encontrado'); navigate('/'); return; }
      if (user && data.authorId !== user.id) { toast.error('No autorizado'); navigate('/'); return; }
      setForm({
        name: data.name,
        description: data.description,
        address: data.address,
        categoryId: data.category?.id || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
      });
      setImage(data.image || null);
      setGallery(data.gallery || []);
      setLoading(false);
    }).catch((err) => {
      console.error('Error loading place:', err);
      toast.error('Error al cargar el lugar');
      navigate('/');
    });
  }, [id, user, navigate]);

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `places/${fileName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadFile(file);
      setImage(url);
      toast.success('Imagen principal actualizada');
    } catch { toast.error('Error al subir imagen'); }
    setUploadingImage(false);
  };

  const handleGalleryAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingGallery(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        const url = await uploadFile(f);
        urls.push(url);
      }
      setGallery(prev => [...prev, ...urls]);
      toast.success(`${urls.length} foto(s) agregada(s)`);
    } catch { toast.error('Error al subir fotos'); }
    setUploadingGallery(false);
  };

  const removeImage = () => setImage(null);

  const removeGalleryItem = (idx: number) => {
    setGallery(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      await placesService.updatePlace(id, {
        name: form.name,
        description: form.description,
        address: form.address,
        categoryId: form.categoryId,
        latitude: form.latitude || undefined,
        longitude: form.longitude || undefined,
        image: image || undefined,
        gallery: gallery.length > 0 ? gallery : undefined,
      });
      toast.success('Lugar actualizado');
      navigate(`/place/${id}`);
    } catch {
      toast.error('Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
    </div>
  );

  return (
    <section className="min-h-screen bg-stone-50 text-stone-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link to={`/place/${id}`} className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" /> Volver al lugar
        </Link>
        <h1 className="text-2xl font-bold mb-6">Editar Lugar</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-stone-200 space-y-4">
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase">Nombre</label>
            <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase">Descripción</label>
            <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-400 resize-none" rows={4} />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase">Dirección</label>
            <input type="text" value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-400" />
          </div>

          {/* Imagen principal */}
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase mb-2 block">Imagen Principal</label>
            {image ? (
              <div className="relative rounded-xl overflow-hidden group">
                <img src={image} alt="Principal" className="w-full h-40 object-cover rounded-xl" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button type="button" onClick={removeImage}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-white text-stone-700 rounded-full hover:bg-stone-100 transition-all">
                    <ImagePlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}
                className="w-full h-32 border-2 border-dashed border-stone-300 rounded-xl flex items-center justify-center gap-2 text-stone-400 hover:border-amber-400 hover:text-amber-500 transition-all disabled:opacity-50">
                {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
                {uploadingImage ? 'Subiendo...' : 'Agregar imagen principal'}
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          {/* Galería */}
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase mb-2 block">Galería de Fotos</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {gallery.map((url, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden group aspect-square">
                  <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeGalleryItem(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => galleryInputRef.current?.click()} disabled={uploadingGallery}
                className="aspect-square border-2 border-dashed border-stone-300 rounded-lg flex items-center justify-center text-stone-400 hover:border-amber-400 hover:text-amber-500 transition-all disabled:opacity-50">
                {uploadingGallery ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
              </button>
            </div>
            <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryAdd} />
            {gallery.length > 0 && (
              <p className="text-[11px] text-stone-400">{gallery.length} foto(s) en galería</p>
            )}
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

export default EditPlacePage;
