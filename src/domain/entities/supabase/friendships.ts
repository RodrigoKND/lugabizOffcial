export interface FriendshipsRow {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  responded_at?: string;
}

export interface FriendshipsInsert {
  id?: string;
  requester_id: string;
  addressee_id: string;
}

export interface FriendshipsUpdate {
  id?: string;
  status?: 'accepted' | 'rejected';
}

export interface BlockedUsersRow {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface BlockedUsersInsert {
  id?: string;
  blocker_id: string;
  blocked_id: string;
}

export interface BlockedUsersUpdate {
  id?: string;
}
