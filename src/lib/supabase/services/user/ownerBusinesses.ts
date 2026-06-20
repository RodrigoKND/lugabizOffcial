import { supabase } from '@lib/supabase/client';

export const MAX_BUSINESSES = 3;

export interface OwnerBusiness {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface AdminOwnerBusiness extends OwnerBusiness {
  ownerName?: string;
  ownerEmail?: string;
}

function mapRow(r: any): OwnerBusiness {
  return { id: r.id, userId: r.user_id, name: r.name, createdAt: r.created_at };
}

export const ownerBusinessesService = {
  /** Negocios del dueño actual. */
  async listMine(userId: string): Promise<OwnerBusiness[]> {
    const { data, error } = await supabase
      .from('owner_businesses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapRow);
  },

  /** Registra un negocio nuevo. La RLS exige identidad verificada y un trigger limita a 3. */
  async add(userId: string, name: string): Promise<OwnerBusiness> {
    const { data, error } = await supabase
      .from('owner_businesses')
      .insert({ user_id: userId, name: name.trim() })
      .select()
      .single();
    if (error) {
      // El trigger de tope de 3 lanza un mensaje claro; lo propagamos.
      throw new Error(error.message || 'No se pudo registrar el negocio.');
    }
    return mapRow(data);
  },

  /** Elimina un negocio propio. */
  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('owner_businesses').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Admin -----------------------------------------------------------------

  /** Todos los negocios con datos del dueño (solo admin, vía RLS admin). */
  async listAllForAdmin(): Promise<AdminOwnerBusiness[]> {
    const { data, error } = await supabase
      .from('owner_businesses')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const rows = (data || []).map(mapRow);
    const ids = [...new Set(rows.map(r => r.userId))];
    const ownerMap: Record<string, { name?: string; email?: string }> = {};
    if (ids.length) {
      const { data: users } = await supabase.from('users').select('id, name, email').in('id', ids);
      for (const u of users || []) ownerMap[u.id] = { name: u.name, email: u.email };
    }
    return rows.map(r => ({ ...r, ownerName: ownerMap[r.userId]?.name, ownerEmail: ownerMap[r.userId]?.email }));
  },

  /** Elimina cualquier negocio (solo admin, vía RLS admin delete). */
  async removeForAdmin(id: string): Promise<void> {
    const { error } = await supabase.from('owner_businesses').delete().eq('id', id);
    if (error) throw error;
  },
};
