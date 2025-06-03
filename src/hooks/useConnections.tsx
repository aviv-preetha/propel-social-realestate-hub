
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

export interface Connection {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
}

export function useConnections() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [connections, setConnections] = useState<Profile[]>([]);
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [pendingConnections, setPendingConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConnections = async () => {
    if (!profile?.id) return;

    try {
      console.log('Fetching connections for profile:', profile.id);

      // Get accepted connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select('*')
        .or(`user_id.eq.${profile.id},connected_user_id.eq.${profile.id}`)
        .eq('status', 'accepted');

      if (connectionsError) {
        console.error('Error fetching connections:', connectionsError);
        throw connectionsError;
      }

      // Get pending connections
      const { data: pendingData, error: pendingError } = await supabase
        .from('connections')
        .select('*')
        .or(`user_id.eq.${profile.id},connected_user_id.eq.${profile.id}`)
        .eq('status', 'pending');

      if (pendingError) {
        console.error('Error fetching pending connections:', pendingError);
        throw pendingError;
      }

      console.log('Raw pending connections data:', pendingData);

      const typedPendingData: Connection[] = (pendingData || []).map(conn => ({
        ...conn,
        status: conn.status as 'pending' | 'accepted'
      }));

      console.log('Typed pending connections:', typedPendingData);
      setPendingConnections(typedPendingData);

      // Get connected profile IDs
      const connectedProfileIds = connectionsData?.map(conn => 
        conn.user_id === profile.id ? conn.connected_user_id : conn.user_id
      ) || [];

      // Get pending profile IDs (both sent and received)
      const pendingProfileIds = pendingData?.map(conn => 
        conn.user_id === profile.id ? conn.connected_user_id : conn.user_id
      ) || [];

      console.log('Connected profile IDs:', connectedProfileIds);
      console.log('Pending profile IDs:', pendingProfileIds);

      // Fetch profiles for connected users
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

      // Fetch all profiles except current user, existing connections, and pending connections
      const excludeIds = [profile.id, ...connectedProfileIds, ...pendingProfileIds];

      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${excludeIds.join(',')})`);

      if (profilesError) throw profilesError;

      setSuggestions(allProfiles as Profile[]);
      console.log('Suggestions after filtering:', allProfiles?.length);
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
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Connection request sent!",
        description: "Your connection request has been sent",
      });

      // Refresh data to update the UI
      await fetchConnections();
    } catch (error) {
      console.error('Error connecting:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
    }
  };

  const acceptConnection = async (connectionId: string) => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Connection accepted!",
        description: "You are now connected",
      });

      // Refresh data
      await fetchConnections();
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast({
        title: "Error",
        description: "Failed to accept connection",
        variant: "destructive",
      });
    }
  };

  const disconnect = async (targetProfileId: string) => {
    if (!profile?.id) return;

    try {
      // Delete any connection between these two users (regardless of who initiated)
      const { error } = await supabase
        .from('connections')
        .delete()
        .or(`and(user_id.eq.${profile.id},connected_user_id.eq.${targetProfileId}),and(user_id.eq.${targetProfileId},connected_user_id.eq.${profile.id})`);

      if (error) throw error;

      toast({
        title: "Disconnected",
        description: "Connection removed",
      });

      // Refresh data
      await fetchConnections();
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect",
        variant: "destructive",
      });
    }
  };

  const getConnectionStatus = (profileId: string) => {
    if (!profile?.id) return 'none';
    
    console.log('Checking connection status for:', profileId);
    console.log('Current connections:', connections.map(c => c.id));
    console.log('Pending connections:', pendingConnections);
    
    // Check if already connected
    if (connections.some(p => p.id === profileId)) {
      console.log('Found in connections - status: connected');
      return 'connected';
    }
    
    // Check if pending (I sent the request)
    const sentRequest = pendingConnections.find(conn => 
      conn.user_id === profile.id && conn.connected_user_id === profileId
    );
    if (sentRequest) {
      console.log('Found sent request - status: pending');
      return 'pending';
    }
    
    // Check if I received a request
    const receivedRequest = pendingConnections.find(conn => 
      conn.connected_user_id === profile.id && conn.user_id === profileId
    );
    if (receivedRequest) {
      console.log('Found received request - status: received');
      return 'received';
    }
    
    console.log('No connection found - status: none');
    return 'none';
  };

  const getPendingConnectionId = (profileId: string) => {
    const connection = pendingConnections.find(conn => 
      (conn.user_id === profileId && conn.connected_user_id === profile?.id) ||
      (conn.connected_user_id === profileId && conn.user_id === profile?.id)
    );
    return connection?.id;
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
    pendingConnections,
    loading,
    connect,
    acceptConnection,
    disconnect,
    refetch: fetchConnections,
    getConnectionStatus,
    getPendingConnectionId
  };
}
