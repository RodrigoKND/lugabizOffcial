import { supabase } from '@lib/supabase/client';
import { CreatePlanData, Plan, PlanParticipant, PlanParticipantRole, PlanRsvpStatus, PlanVisibility } from '@domain/entities';
import { edgeService } from '@lib/supabase/services/notifications/edgeFunctions';

interface UserLite {
  id: string;
  name: string;
  avatar?: string;
}

interface PlanParticipantRow {
  id: string;
  plan_id: string;
  user_id: string;
  role: PlanParticipantRole;
  rsvp_status: PlanRsvpStatus;
  invited_at: string;
  responded_at?: string;
}

interface PlanRow {
  id: string;
  created_by: string;
  place_id?: string;
  event_id?: string;
  plan_date: string;
  plan_time: string;
  visibility: PlanVisibility;
  note?: string;
  status: 'active' | 'cancelled';
  cancel_reason?: string;
  created_at: string;
  place?: { name: string; image?: string } | null;
  event?: { name: string; image?: string } | null;
  plan_participants?: PlanParticipantRow[];
}

// plan_participants.user_id apunta a auth.users: se resuelven nombres con una
// consulta aparte a public.users (mismo motivo que en friendships.ts).
async function fetchUsersLite(ids: string[]): Promise<Map<string, UserLite>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase.from('users').select('id, name, avatar').in('id', ids);
  if (error) throw error;
  return new Map((data || []).map((u) => [u.id, u as UserLite]));
}

function mapParticipant(row: PlanParticipantRow, usersMap: Map<string, UserLite>): PlanParticipant {
  const user = usersMap.get(row.user_id);
  return {
    id: row.id,
    planId: row.plan_id,
    userId: row.user_id,
    role: row.role,
    rsvpStatus: row.rsvp_status,
    invitedAt: new Date(row.invited_at),
    respondedAt: row.responded_at ? new Date(row.responded_at) : undefined,
    userName: user?.name,
    userAvatar: user?.avatar,
  };
}

async function mapPlan(row: PlanRow): Promise<Plan> {
  const participantRows = row.plan_participants || [];
  const usersMap = await fetchUsersLite(participantRows.map((p) => p.user_id));
  return {
    id: row.id,
    createdBy: row.created_by,
    placeId: row.place_id,
    eventId: row.event_id,
    targetName: row.place?.name || row.event?.name,
    targetImage: row.place?.image || row.event?.image,
    planDate: row.plan_date,
    planTime: row.plan_time,
    visibility: row.visibility,
    note: row.note,
    status: row.status,
    cancelReason: row.cancel_reason,
    createdAt: new Date(row.created_at),
    participants: participantRows.map((p) => mapParticipant(p, usersMap)),
  };
}

export const plansService = {
  async createPlan(userId: string, data: CreatePlanData): Promise<string> {
    const { data: planRow, error } = await supabase
      .from('plans')
      .insert({
        created_by: userId,
        place_id: data.placeId,
        event_id: data.eventId,
        plan_date: data.planDate,
        plan_time: data.planTime,
        visibility: data.visibility,
        note: data.note,
      })
      .select('id')
      .single();
    if (error) throw error;

    const planId = planRow.id as string;

    for (const inviteeId of data.inviteeIds) {
      const { data: participant, error: inviteError } = await supabase
        .from('plan_participants')
        .insert({ plan_id: planId, user_id: inviteeId })
        .select('id')
        .single();
      if (inviteError) throw inviteError;
      edgeService.sendPlanInvitePush(participant.id).catch(() => {});
    }

    return planId;
  },

  async respondToInvite(participantId: string, accept: boolean): Promise<void> {
    const { error } = await supabase
      .from('plan_participants')
      .update({ rsvp_status: accept ? 'accepted' : 'declined' })
      .eq('id', participantId);
    if (error) throw error;
    edgeService.sendPlanResponsePush(participantId).catch(() => {});
  },

  // El motivo es obligatorio: se lo notifica (in-app + push) a todos los
  // invitados que ya habían confirmado (trigger `notify_plan_cancelled`).
  async cancelPlan(planId: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('plans')
      .update({ status: 'cancelled', cancel_reason: reason })
      .eq('id', planId);
    if (error) throw error;
  },

  // Cubre planes propios e invitaciones recibidas: el dueño también queda como
  // participant (role='owner') gracias al trigger de la migración. Paginado
  // (limit/offset) para que "Mis planes" siga siendo rápido con cientos de
  // planes — la carga adicional es progresiva (scroll), no trae todo de una.
  async listMyPlans(userId: string, limit = 12, offset = 0): Promise<Plan[]> {
    const { data: participantRows, error: participantsError } = await supabase
      .from('plan_participants')
      .select('plan_id')
      .eq('user_id', userId);
    if (participantsError) throw participantsError;

    const planIds = [...new Set((participantRows || []).map((r) => r.plan_id))];
    if (planIds.length === 0) return [];

    const { data, error } = await supabase
      .from('plans')
      .select('*, place:places(name, image), event:events(name, image), plan_participants(*)')
      .in('id', planIds)
      .order('plan_date', { ascending: true })
      .range(offset, offset + limit - 1);
    if (error) throw error;

    return Promise.all((data || []).map((row) => mapPlan(row as unknown as PlanRow)));
  },
};
