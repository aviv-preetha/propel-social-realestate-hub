
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './useProfile';

export function useProfiles() {
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  const fetchProfile = async (userId: string) => {
    if (profiles[userId]) return profiles[userId];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        const profile: Profile = {
          ...data,
          badge: data.badge as 'owner' | 'seeker' | 'business'
        };
        setProfiles(prev => ({ ...prev, [userId]: profile }));
        return profile;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
    return null;
  };

  const getProfile = (userId: string) => {
    if (!profiles[userId]) {
      fetchProfile(userId);
    }
    return profiles[userId] || null;
  };

  return {
    profiles,
    getProfile,
    fetchProfile
  };
}
