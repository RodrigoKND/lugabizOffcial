import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { placesService } from '@lib/supabase';
import { useAuth } from '@presentation/context';
import { useSEO } from '@presentation/hooks/seo/useSEO';

const EditPlacePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', address: '', categoryId: '',
    latitude: 0, longitude: 0,
  });

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
        categoryId: data.category.id,
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
      });
    }).catch(() => { toast.error('Error al cargar'); navigate('/'); })
    .finally(() => setLoading(false));
  }, [id, user, navigate]);

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
