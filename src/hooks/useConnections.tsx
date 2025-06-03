
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
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
  const [connections, setConnections] = useState<Profile[]>([]);
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConnections = async () => {
    if (!user) return;

    try {
      // Fetch user's connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select(`
          connected_user_id,
          profiles!connections_connected_user_id_fkey(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (connectionsError) throw connectionsError;

      const connectedProfiles = connectionsData
        .map(conn => conn.profiles)
        .filter(Boolean) as Profile[];

      setConnections(connectedProfiles);

      // Fetch all profiles except user and existing connections
      const connectedUserIds = connectedProfiles.map(p => p.user_id);
      const excludeIds = [user.id, ...connectedUserIds];

      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .not('user_id', 'in', `(${excludeIds.join(',')})`);

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

  const connect = async (targetUserId: string) => {
    if (!user) {
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
          user_id: user.id,
          connected_user_id: targetUserId,
          status: 'accepted' // For simplicity, auto-accept connections
        });

      if (error) throw error;

      // Also create the reverse connection
      await supabase
        .from('connections')
        .insert({
          user_id: targetUserId,
          connected_user_id: user.id,
          status: 'accepted'
        });

      // Move from suggestions to connections
      const connectedProfile = suggestions.find(p => p.user_id === targetUserId);
      if (connectedProfile) {
        setConnections(prev => [...prev, connectedProfile]);
        setSuggestions(prev => prev.filter(p => p.user_id !== targetUserId));
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

  const disconnect = async (targetUserId: string) => {
    if (!user) return;

    try {
      // Remove both directions of the connection
      await supabase
        .from('connections')
        .delete()
        .eq('user_id', user.id)
        .eq('connected_user_id', targetUserId);

      await supabase
        .from('connections')
        .delete()
        .eq('user_id', targetUserId)
        .eq('connected_user_id', user.id);

      // Move from connections to suggestions
      const disconnectedProfile = connections.find(p => p.user_id === targetUserId);
      if (disconnectedProfile) {
        setConnections(prev => prev.filter(p => p.user_id !== targetUserId));
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
  }, [user]);

  return {
    connections,
    suggestions,
    loading,
    connect,
    disconnect,
    refetch: fetchConnections
  };
}
