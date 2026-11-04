import { useState } from 'react';
import { Search, Loader2, CheckCircle } from 'lucide-react';

export function UserSelector({ users, usersLoaded, selectedIds, onToggle }: {
  users: { id: string; name?: string; email?: string; avatar?: string }[];
  usersLoaded: boolean;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [userQuery, setUserQuery] = useState('');
  const filteredUsers = userQuery.trim()
    ? users.filter(u => `${u.name ?? ''} ${u.email ?? ''}`.toLowerCase().includes(userQuery.toLowerCase()))
    : users;

  return (
    <div className="border border-lg-surface-2 rounded-xl overflow-hidden">
      <div className="p-2.5 border-b border-lg-surface-2 flex items-center gap-2">
        <Search className="w-3.5 h-3.5 text-lg-dim" />
        <input value={userQuery} onChange={e => setUserQuery(e.target.value)}
          placeholder="Buscar por nombre o email…" className="flex-1 text-xs focus:outline-none" />
        <span className="text-[10px] text-lg-dim">{selectedIds.size} elegido(s)</span>
      </div>
      <div className="max-h-52 overflow-y-auto divide-y divide-lg-surface-2">
        {!usersLoaded ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-lg-accent" /></div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-xs text-lg-dim py-8">Sin resultados</p>
        ) : filteredUsers.slice(0, 80).map(u => {
          const sel = selectedIds.has(u.id);
          return (
            <button key={u.id} onClick={() => onToggle(u.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${sel ? 'bg-lg-surface-2' : 'hover:bg-lg-surface-2'}`}>
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${sel ? 'bg-lg-accent border-primary-500' : 'border-lg-surface-2'}`}>
                {sel && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <img src={u.avatar || '/avatar.png'} alt="" className="w-7 h-7 rounded-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = '/avatar.png'; }} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-lg-text truncate">{u.name ?? 'Sin nombre'}</p>
                <p className="text-[10px] text-lg-dim truncate">{u.email ?? 'sin email'}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
