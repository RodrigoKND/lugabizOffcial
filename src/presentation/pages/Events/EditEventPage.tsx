import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { eventsService } from '@lib/supabase';
import { Event } from '@domain/entities';
import { useAuth } from '@presentation/context';
import { useSEO } from '@presentation/hooks/seo/useSEO';

const EditEventPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        dateStart: data.dateStart.toISOString().split('T')[0],
        timeStart: data.timeStart,
        timeEnd: data.timeEnd || '',
        price: data.price || 0,
        capacity: data.capacity || 0,
        isFree: data.isFree,
        tags: (data.tags || []).join(', '),
      });
    }).finally(() => setLoading(false));
  }, [id, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
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
      });
      toast.success('Evento actualizado');
      navigate(`/event/${id}`);
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

  if (!event) return null;

  return (
    <section className="min-h-screen bg-stone-50 text-stone-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link to={`/event/${id}`} className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" /> Volver al evento
        </Link>
        <h1 className="text-2xl font-bold mb-6">Editar Evento</h1>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase">Fecha</label>
              <input type="date" value={form.dateStart} onChange={(e) => setForm(f => ({ ...f, dateStart: e.target.value }))}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase">Hora inicio</label>
              <input type="time" value={form.timeStart} onChange={(e) => setForm(f => ({ ...f, timeStart: e.target.value }))}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-400" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase">Tags (separados por coma)</label>
            <input type="text" value={form.tags} onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
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

export default EditEventPage;
