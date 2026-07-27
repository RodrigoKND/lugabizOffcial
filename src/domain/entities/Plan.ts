export type PlanVisibility = 'private' | 'friends' | 'public';
export type PlanRsvpStatus = 'pending' | 'accepted' | 'declined';
export type PlanParticipantRole = 'owner' | 'invitee';

export interface PlanParticipant {
  id: string;
  planId: string;
  userId: string;
  role: PlanParticipantRole;
  rsvpStatus: PlanRsvpStatus;
  invitedAt: Date;
  respondedAt?: Date;
  userName?: string;
  userAvatar?: string;
}

export interface Plan {
  id: string;
  createdBy: string;
  placeId?: string;
  eventId?: string;
  targetName?: string;
  targetImage?: string;
  planDate: string;
  planTime: string;
  visibility: PlanVisibility;
  note?: string;
  status: 'active' | 'cancelled';
  createdAt: Date;
  participants: PlanParticipant[];
}

export interface CreatePlanData {
  placeId?: string;
  eventId?: string;
  planDate: string;
  planTime: string;
  visibility: PlanVisibility;
  note?: string;
  inviteeIds: string[];
}
