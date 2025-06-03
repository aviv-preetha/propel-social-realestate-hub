
import { supabase } from '@/integrations/supabase/client';
import { Connection, Profile } from '@/types/connections';

export const connectionService = {
  async fetchConnections(profileId: string) {
    console.log('Fetching connections for profile:', profileId);

    // Get accepted connections
    const { data: connectionsData, error: connectionsError } = await supabase
      .from('connections')
      .select('*')
      .or(`user_id.eq.${profileId},connected_user_id.eq.${profileId}`)
      .eq('status', 'accepted');

    if (connectionsError) {
      console.error('Error fetching connections:', connectionsError);
      throw connectionsError;
    }

    // Get pending connections
    const { data: pendingData, error: pendingError } = await supabase
      .from('connections')
      .select('*')
      .or(`user_id.eq.${profileId},connected_user_id.eq.${profileId}`)
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

    // Get connected profile IDs
    const connectedProfileIds = connectionsData?.map(conn => 
      conn.user_id === profileId ? conn.connected_user_id : conn.user_id
    ) || [];

    console.log('Connected profile IDs:', connectedProfileIds);

    return {
      connectionsData: connectionsData || [],
      pendingData: typedPendingData,
      connectedProfileIds
    };
  },

  async fetchProfiles(profileIds: string[]): Promise<Profile[]> {
    if (profileIds.length === 0) return [];

    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', profileIds);

    if (profilesError) throw profilesError;
    return profilesData as Profile[];
  },

  async fetchSuggestions(excludeIds: string[]): Promise<Profile[]> {
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .not('id', 'in', `(${excludeIds.join(',')})`);

    if (profilesError) throw profilesError;
    return allProfiles as Profile[];
  },

  async createConnection(userId: string, targetProfileId: string) {
    const { error } = await supabase
      .from('connections')
      .insert({
        user_id: userId,
        connected_user_id: targetProfileId,
        status: 'pending'
      });

    if (error) throw error;
  },

  async acceptConnection(connectionId: string) {
    const { error } = await supabase
      .from('connections')
      .update({ status: 'accepted' })
      .eq('id', connectionId);

    if (error) throw error;
  },

  async deleteConnection(userId: string, targetProfileId: string) {
    const { error } = await supabase
      .from('connections')
      .delete()
      .or(`and(user_id.eq.${userId},connected_user_id.eq.${targetProfileId}),and(user_id.eq.${targetProfileId},connected_user_id.eq.${userId})`);

    if (error) throw error;
  }
};
