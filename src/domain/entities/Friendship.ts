export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: Date;
  respondedAt?: Date;
  otherUserId: string;
  otherUserName: string;
  otherUserUsername?: string;
  otherUserAvatar?: string;
}

export interface UserSearchResult {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}
