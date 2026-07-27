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

// Resultado de search_my_friends: ya viene filtrado+acotado desde SQL, pensado
// para funcionar igual de rápido con 5 o con 500 amigos.
export interface FriendOption {
  friendshipId: string;
  userId: string;
  name: string;
  username?: string;
  avatar?: string;
}
