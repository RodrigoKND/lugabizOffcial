import { VERDICT_KEYS, type VerdictKey } from '@domain/entities/Verdict';
import type { GroupPickDetail, GroupPickStatus, GroupPickSummary } from '@domain/entities/GroupPick';

interface RawPick { id: string; created_by: string; title?: string | null; plan_date: string; plan_time: string; status: GroupPickStatus; closes_at: string; winner_option_id?: string | null }
interface RawMember { user_id: string; name: string; username?: string | null; avatar?: string | null }
interface RawOption { id: string; place_id?: string | null; event_id?: string | null; added_by: string; position: number; name: string; image?: string | null }
interface RawVote { option_id: string; user_id: string; verdict: string }
export interface RawGroupPickDetail { pick: RawPick; members: RawMember[]; options: RawOption[]; votes: RawVote[] }

export interface RawGroupPickSummary {
  id: string; title?: string | null; plan_date: string; plan_time: string; status: GroupPickStatus;
  closes_at: string; created_by: string; creator_name: string; member_count: number | string;
}

// El RPC devuelve null si no eres miembro (o no existe): la UI lo trata como "no encontrada".
export function mapGroupPickDetail(raw: RawGroupPickDetail | null | undefined): GroupPickDetail | null {
  if (!raw?.pick) return null;
  const { pick } = raw;
  return {
    pick: {
      id: pick.id, createdBy: pick.created_by, title: pick.title ?? undefined,
      planDate: pick.plan_date, planTime: pick.plan_time, status: pick.status,
      closesAt: new Date(pick.closes_at), winnerOptionId: pick.winner_option_id ?? undefined,
    },
    members: raw.members.map(m => ({ userId: m.user_id, name: m.name, username: m.username ?? undefined, avatar: m.avatar ?? undefined })),
    options: raw.options.map(o => ({
      id: o.id, placeId: o.place_id ?? undefined, eventId: o.event_id ?? undefined,
      addedBy: o.added_by, position: o.position, name: o.name, image: o.image ?? undefined,
    })),
    votes: raw.votes
      .filter(v => VERDICT_KEYS.includes(v.verdict as VerdictKey))
      .map(v => ({ optionId: v.option_id, userId: v.user_id, verdict: v.verdict as VerdictKey })),
  };
}

export function mapGroupPickSummary(row: RawGroupPickSummary): GroupPickSummary {
  return {
    id: row.id, title: row.title ?? undefined, planDate: row.plan_date, planTime: row.plan_time, status: row.status,
    closesAt: new Date(row.closes_at), createdBy: row.created_by, creatorName: row.creator_name, memberCount: Number(row.member_count),
  };
}
