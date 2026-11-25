import type { VerdictKey } from './Verdict';

export type GroupPickStatus = 'open' | 'decided' | 'cancelled';

export interface GroupPickMember {
  userId: string;
  name: string;
  username?: string;
  avatar?: string;
}

export interface GroupPickOption {
  id: string;
  placeId?: string;
  eventId?: string;
  addedBy: string;
  position: number;
  name: string;
  image?: string;
}

export interface GroupPickVote {
  optionId: string;
  userId: string;
  verdict: VerdictKey;
}

export interface GroupPick {
  id: string;
  createdBy: string;
  title?: string;
  planDate: string;
  planTime: string;
  status: GroupPickStatus;
  closesAt: Date;
  winnerOptionId?: string;
}

export interface GroupPickDetail {
  pick: GroupPick;
  members: GroupPickMember[];
  options: GroupPickOption[];
  votes: GroupPickVote[];
}

export interface GroupPickSummary {
  id: string;
  title?: string;
  planDate: string;
  planTime: string;
  status: GroupPickStatus;
  closesAt: Date;
  createdBy: string;
  creatorName: string;
  memberCount: number;
}

export interface GroupPickTarget {
  placeId?: string;
  eventId?: string;
}

export interface CreateGroupPickData {
  title?: string;
  planDate: string;
  planTime: string;
  inviteeIds: string[];
  options: GroupPickTarget[];
}
