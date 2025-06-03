
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { useToast } from '@/hooks/use-toast';

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

export function useConnections() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [connections, setConnections] = useState<Profile[]>([]);
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConnections = async () => {
    if (!profile?.id) return;

    try {
      // First, get the profile IDs of connected users
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select('connected_user_id')
        .eq('user_id', profile.id)
        .eq('status', 'accepted');

      if (connectionsError) throw connectionsError;

      const connectedProfileIds = connectionsData.map(conn => conn.connected_user_id);

      // Then fetch the profiles for those users
      let connectedProfiles: Profile[] = [];
      if (connectedProfileIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', connectedProfileIds);

        if (profilesError) throw profilesError;
        connectedProfiles = profilesData as Profile[];
      }

      setConnections(connectedProfiles);

      // Fetch all profiles except current user and existing connections
      const excludeIds = [profile.id, ...connectedProfileIds];

      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${excludeIds.join(',')})`);

      if (profilesError) throw profilesError;

      setSuggestions(allProfiles as Profile[]);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: "Failed to fetch connections",
        variant: "destructive",
      });
    }
  };

  const connect = async (targetProfileId: string) => {
    if (!user || !profile?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to connect with others",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          user_id: profile.id,
          connected_user_id: targetProfileId,
          status: 'accepted' // For simplicity, auto-accept connections
        });

      if (error) throw error;

      // Also create the reverse connection
      await supabase
        .from('connections')
        .insert({
          user_id: targetProfileId,
          connected_user_id: profile.id,
          status: 'accepted'
        });

      // Move from suggestions to connections
      const connectedProfile = suggestions.find(p => p.id === targetProfileId);
      if (connectedProfile) {
        setConnections(prev => [...prev, connectedProfile]);
        setSuggestions(prev => prev.filter(p => p.id !== targetProfileId));
      }

      toast({
        title: "Connected!",
        description: "You are now connected",
      });
    } catch (error) {
      console.error('Error connecting:', error);
      toast({
        title: "Error",
        description: "Failed to connect",
        variant: "destructive",
      });
    }
  };

  const disconnect = async (targetProfileId: string) => {
    if (!profile?.id) return;

    try {
      // Remove both directions of the connection
      await supabase
        .from('connections')
        .delete()
        .eq('user_id', profile.id)
        .eq('connected_user_id', targetProfileId);

      await supabase
        .from('connections')
        .delete()
        .eq('user_id', targetProfileId)
        .eq('connected_user_id', profile.id);

      // Move from connections to suggestions
      const disconnectedProfile = connections.find(p => p.id === targetProfileId);
      if (disconnectedProfile) {
        setConnections(prev => prev.filter(p => p.id !== targetProfileId));
        setSuggestions(prev => [...prev, disconnectedProfile]);
      }

      toast({
        title: "Disconnected",
        description: "Connection removed",
      });
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadConnections = async () => {
      setLoading(true);
      await fetchConnections();
      setLoading(false);
    };

    loadConnections();
  }, [profile?.id]);

  return {
    connections,
    suggestions,
    loading,
    connect,
    disconnect,
    refetch: fetchConnections
  };
}
