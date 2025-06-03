
export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  description: string | null;
  badge: 'owner' | 'seeker' | 'business';
  location: string | null;
  listing_preference: string | null;
}

export interface Connection {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
}

export type ConnectionStatus = 'none' | 'pending' | 'received' | 'connected';
