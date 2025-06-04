import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { useToast } from '@/hooks/use-toast';
import { Profile, Connection } from '@/types/connections';
import { connectionService } from '@/services/connectionService';
import { connectionUtils } from '@/utils/connectionUtils';

export function useConnections() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [connections, setConnections] = useState<Profile[]>([]);
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [pendingConnections, setPendingConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const sortSuggestionsByRelevance = (profiles: Profile[], currentProfile: Profile) => {
    return profiles.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Same location gets high priority
      if (a.location === currentProfile.location) scoreA += 50;
      if (b.location === currentProfile.location) scoreB += 50;

      // Business badge relevance for seekers
      if (currentProfile.badge === 'seeker') {
        if (a.badge === 'business') scoreA += 40;
        if (a.badge === 'owner') scoreA += 30;
        if (b.badge === 'business') scoreB += 40;
        if (b.badge === 'owner') scoreB += 30;
      }

      // Owner badge relevance for seekers
      if (currentProfile.badge === 'owner') {
        if (a.badge === 'seeker') scoreA += 30;
        if (a.badge === 'business') scoreA += 20;
        if (b.badge === 'seeker') scoreB += 30;
        if (b.badge === 'business') scoreB += 20;
      }

      // Business connecting with other businesses
      if (currentProfile.badge === 'business') {
        if (a.badge === 'owner') scoreA += 35;
        if (a.badge === 'seeker') scoreA += 25;
        if (a.badge === 'business') scoreA += 15;
        if (b.badge === 'owner') scoreB += 35;
        if (b.badge === 'seeker') scoreB += 25;
        if (b.badge === 'business') scoreB += 15;
      }

      // Listing preference match
      if (currentProfile.listing_preference && a.listing_preference) {
        if (currentProfile.listing_preference === a.listing_preference) scoreA += 20;
      }
      if (currentProfile.listing_preference && b.listing_preference) {
        if (currentProfile.listing_preference === b.listing_preference) scoreB += 20;
      }

      return scoreB - scoreA;
    });
  };

  const fetchConnections = async () => {
    if (!profile?.id) return;

    try {
      const { connectionsData, pendingData, connectedProfileIds } = 
        await connectionService.fetchConnections(profile.id);

      setPendingConnections(pendingData);

      // Fetch profiles for connected users
      const connectedProfiles = await connectionService.fetchProfiles(connectedProfileIds);
      setConnections(connectedProfiles);

      // Fetch suggestions - exclude only current user and accepted connections
      // Do NOT exclude pending connections from suggestions
      const excludeIds = [profile.id, ...connectedProfileIds];
      const allProfiles = await connectionService.fetchSuggestions(excludeIds);
      
      // Sort suggestions by relevance
      const sortedSuggestions = sortSuggestionsByRelevance(allProfiles, profile);
      setSuggestions(sortedSuggestions);
      
      console.log('Suggestions after filtering and sorting:', sortedSuggestions?.length);
      console.log('Excluded IDs:', excludeIds);
      console.log('Pending connections count:', pendingData.length);
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
      await connectionService.createConnection(profile.id, targetProfileId);

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
      await connectionService.acceptConnection(connectionId);

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
      await connectionService.deleteConnection(profile.id, targetProfileId);

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
    
    return connectionUtils.getConnectionStatus(
      profile.id,
      profileId,
      connections,
      pendingConnections
    );
  };

  const getPendingConnectionId = (profileId: string) => {
    if (!profile?.id) return undefined;
    
    return connectionUtils.getPendingConnectionId(
      profile.id,
      profileId,
      pendingConnections
    );
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

// Re-export the Profile and Connection types for backward compatibility
export type { Profile, Connection } from '@/types/connections';
