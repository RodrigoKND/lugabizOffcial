import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { adminService } from '@lib/supabase/services/admin/admin';
import { Search, Users, Loader2, Ban, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';
import { BanModal } from './_BanModal';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'admin' | 'owner' | 'user';
  banned?: boolean;
  ban_reason?: string;
}

export function UsersSection() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [banning, setBanning] = useState<string | null>(null);
  const [banModal, setBanModal] = useState<{ id: string; name: string } | null>(null);
  const [banReason, setBanReason] = useState('');
  const [confirmUnbanId, setConfirmUnbanId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try { setUsers(await adminService.getUsers()); }
    catch { toast.error('Error al cargar usuarios'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleBan = async () => {
    if (!banModal || !banReason) return;
    setBanning(banModal.id);
    try {
      await adminService.banUser(banModal.id, banReason);
      setUsers(prev => prev.map(u => u.id === banModal.id ? { ...u, banned: true, ban_reason: banReason } : u));
      toast.success('Usuario baneado'); setBanModal(null); setBanReason('');
    } catch { toast.error('Error al banear usuario'); } finally { setBanning(null); }
  };

  const handleUnban = async (userId: string) => {
    try { await adminService.unbanUser(userId); setUsers(prev => prev.map(u => u.id === userId ? { ...u, banned: false, ban_reason: null } : u)); toast.success('Usuario restaurado'); }
    catch { toast.error('Error al restaurar usuario'); }
  };

  const q = search.toLowerCase();
  const filtered = users.filter(u => !search || (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
  const banned = users.filter(u => u.banned).length;

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-primary-500" /></div>;

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[{ label: 'Total', value: users.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Activos', value: users.length - banned, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Baneados', value: banned, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-stone-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
        <div className="p-5 border-b border-stone-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o email..."
              className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10" />
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-400"><Users className="w-10 h-10 mx-auto mb-3 text-stone-200" /><p className="text-sm font-medium">No hay usuarios para mostrar</p></div>
        ) : (
          <div className="divide-y divide-stone-50 max-h-[60vh] overflow-y-auto">
            {filtered.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-stone-100 overflow-hidden shrink-0 ring-2 ring-stone-200">
                  {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Users className="w-4 h-4 text-stone-400" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-medium text-stone-700 truncate">{u.name}</p>
                    {u.banned && <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">BANEADO</span>}
                    {u.role === 'admin' && <span className="text-[9px] font-bold bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full">Admin</span>}
                    {u.role === 'owner' && <span className="text-[9px] font-bold bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded-full">Dueño</span>}
                  </div>
                  <p className="text-[11px] text-stone-400 truncate">{u.email}</p>
                  {u.banned && u.ban_reason && <p className="text-[10px] text-red-400 mt-0.5">Motivo: {u.ban_reason}</p>}
                </div>
                <div className="flex items-center">
                  {u.banned ? (
                    <button onClick={() => setConfirmUnbanId(u.id)} className="p-2 rounded-xl text-stone-400 hover:text-green-500 hover:bg-green-50 transition-all" title="Restaurar usuario"><UserCheck className="w-4 h-4" /></button>
                  ) : (
                    <button onClick={() => setBanModal({ id: u.id, name: u.name })} className="p-2 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Banear usuario"><Ban className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmDialog open={!!confirmUnbanId} onClose={() => setConfirmUnbanId(null)} onConfirm={() => { if (confirmUnbanId) handleUnban(confirmUnbanId); }}
        title="Restaurar usuario" message="¿Restaurar el acceso de este usuario?" confirmLabel="Restaurar" variant="warning" />
      <AnimatePresence><BanModal banModal={banModal} banning={banning} banReason={banReason} onClose={() => setBanModal(null)} onReasonChange={setBanReason} onConfirm={handleBan} /></AnimatePresence>
    </>
  );
}
