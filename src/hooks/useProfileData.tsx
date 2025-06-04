
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  id: string;
  name: string;
  avatar_url?: string;
  badge: 'owner' | 'seeker' | 'business';
}

export function useProfileData(userId: string) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, badge')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile(data as ProfileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading };
}
