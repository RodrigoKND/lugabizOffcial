import { useState, useEffect } from 'react';
import { adminService } from '@lib/supabase/services/admin/admin';
import { broadcastService, type BroadcastAudience, type BroadcastResult } from '@lib/supabase';
import { Megaphone, BellRing, Loader2, Send, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';
import { AudienceSelector } from './_AudienceSelector';
import { UserSelector } from './_UserSelector';
import { BroadcastResultDisplay } from './_BroadcastResult';

export function MarketingSection() {
  const [audience, setAudience] = useState<BroadcastAudience>('all');
  const [heading, setHeading] = useState('');
  const [message, setMessage] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [users, setUsers] = useState<{ id: string; name?: string; email?: string; avatar?: string }[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [count, setCount] = useState<{ total: number } | null>(null);
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<BroadcastResult | null>(null);

  useEffect(() => {
    if (audience === 'specific' && !usersLoaded) {
      adminService.getUsers().then(list => { setUsers(list.map(u => ({ id: u.id, name: u.name, email: u.email, avatar: u.avatar }))); setUsersLoaded(true); })
        .catch((e) => toast.error(e?.message ?? 'No se pudieron cargar usuarios'));
    }
  }, [audience, usersLoaded]);

  useEffect(() => {
    let cancelled = false;
    if (audience === 'specific') { setCount({ total: selectedIds.size }); return; }
    setCount(null);
    broadcastService.previewAudience(audience).then(c => { if (!cancelled) setCount(c); }).catch(() => { if (!cancelled) setCount(null); });
    return () => { cancelled = true; };
  }, [audience, selectedIds]);

  const toggleUser = (id: string) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const validate = (): string | null => {
    if (!heading.trim()) return 'Escribí un título para la campaña.';
    if (!message.trim()) return 'Escribí el mensaje.';
    if (audience === 'specific' && selectedIds.size === 0) return 'Elegí al menos un usuario.';
    return null;
  };
  const onSendClick = () => { const err = validate(); if (err) { toast.error(err); return; } setConfirmOpen(true); };

  const doSend = async () => {
    setConfirmOpen(false); setSending(true); setResult(null);
    try {
      const res = await broadcastService.send({ audience, userIds: audience === 'specific' ? [...selectedIds] : undefined, heading: heading.trim(), message: message.trim(), ctaUrl: ctaUrl.trim() || undefined });
      setResult(res); toast.success('Campaña enviada.');
    } catch (e) { toast.error(e?.message ?? 'No se pudo enviar la campaña.'); } finally { setSending(false); }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
        <div className="p-5 border-b border-stone-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center"><Megaphone className="w-4 h-4 text-primary-500" /></div>
          <div className="flex-1"><h3 className="font-bold text-stone-800">Marketing</h3><p className="text-[11px] text-stone-400">Enviá avisos por la campana y push.</p></div>
        </div>
        <div className="m-5 mb-0 flex items-start gap-2 text-[11px] bg-primary-50 border border-primary-100 rounded-xl px-3 py-2.5 text-primary-700">
          <BellRing className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <p>El aviso llega a la <b>campana</b> y como <b>notificación push</b> a quienes activaron notificaciones.</p>
        </div>
        <div className="p-5 space-y-5">
          <AudienceSelector value={audience} onChange={setAudience} />
          {audience === 'specific' && <UserSelector users={users} usersLoaded={usersLoaded} selectedIds={selectedIds} onToggle={toggleUser} />}
          <div className="space-y-3">
            <div><label className="text-xs font-semibold text-stone-600 mb-1 block">Título</label>
              <input value={heading} onChange={e => setHeading(e.target.value)} placeholder="Ej. Descubrí lo mejor de tu ciudad"
                className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200" /></div>
            <div><label className="text-xs font-semibold text-stone-600 mb-1 block">Mensaje</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Escribí tu mensaje."
                className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-primary-200" /></div>
            <div><label className="text-xs font-semibold text-stone-600 mb-1 block flex items-center gap-1"><Link2 className="w-3 h-3" /> Al tocar, llevar a (opcional)</label>
              <input value={ctaUrl} onChange={e => setCtaUrl(e.target.value)} placeholder="Ej. /comunidad · /event/123"
                className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200" /></div>
          </div>
          {(heading || message) && <div><label className="text-xs font-semibold text-stone-600 mb-2 block">Vista previa</label>
              <div className="rounded-xl border border-stone-200 bg-white shadow-sm p-3 flex items-start gap-3 max-w-md">
                <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center shrink-0"><span className="text-white font-extrabold text-sm">L</span></div>
                <div className="min-w-0"><p className="text-sm font-semibold text-stone-800 leading-snug">📢 {heading || 'Tu título aquí'}</p>
                  <p className="text-xs text-stone-500 mt-0.5 whitespace-pre-wrap leading-snug">{message || 'Tu mensaje aquí…'}</p>
                  <p className="text-[10px] text-stone-400 mt-1">Lugabiz · ahora</p>
                </div>
              </div>
            </div>}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="text-xs text-stone-500">
              {count == null ? <span className="inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> calculando alcance…</span>
                : <span><b className="text-stone-700">{count.total}</b> destinatario(s)</span>}
            </div>
            <button onClick={onSendClick} disabled={sending}
              className="px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-bold hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center gap-2">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Enviar campaña
            </button>
          </div>
          {result && <BroadcastResultDisplay result={result} />}
        </div>
      </div>
      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={doSend} title="Enviar campaña" message={`Vas a enviar "${heading}" a la audiencia: ${audience}${count ? ` (${count.total} destinatario(s))` : ''}. ¿Confirmás?`} confirmLabel="Enviar" />
    </div>
  );
}
