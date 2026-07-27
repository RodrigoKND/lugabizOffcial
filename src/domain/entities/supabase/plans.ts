export interface PlansRow {
  id: string;
  created_by: string;
  place_id?: string;
  event_id?: string;
  plan_date: string;
  plan_time: string;
  visibility: 'private' | 'friends' | 'public';
  note?: string;
  status: 'active' | 'cancelled';
  created_at: string;
}

export interface PlansInsert {
  id?: string;
  created_by: string;
  place_id?: string;
  event_id?: string;
  plan_date: string;
  plan_time: string;
  visibility?: 'private' | 'friends' | 'public';
  note?: string;
}

export interface PlansUpdate {
  id?: string;
  plan_date?: string;
  plan_time?: string;
  visibility?: 'private' | 'friends' | 'public';
  note?: string;
  status?: 'active' | 'cancelled';
}

export interface PlanParticipantsRow {
  id: string;
  plan_id: string;
  user_id: string;
  role: 'owner' | 'invitee';
  rsvp_status: 'pending' | 'accepted' | 'declined';
  invited_at: string;
  responded_at?: string;
}

export interface PlanParticipantsInsert {
  id?: string;
  plan_id: string;
  user_id: string;
}

export interface PlanParticipantsUpdate {
  id?: string;
  rsvp_status?: 'accepted' | 'declined';
}
