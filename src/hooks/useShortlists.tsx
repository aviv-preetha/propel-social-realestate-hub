import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { useToast } from '@/hooks/use-toast';

export interface Shortlist {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  is_shared: boolean;
  share_token: string;
  created_at: string;
  updated_at: string;
  properties?: any[];
  property_count?: number;
  property_ids?: string[];
}

export interface ShortlistInvitation {
  id: string;
  shortlist_id: string;
  inviter_id: string;
  invitee_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  shortlist?: Shortlist;
  inviter_name?: string;
}

export function useShortlists() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [shortlists, setShortlists] = useState<Shortlist[]>([]);
  const [invitations, setInvitations] = useState<ShortlistInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchShortlists = async () => {
    if (!profile?.id) return;

    try {
      // Fetch user's own shortlists
      const { data: ownShortlists, error: ownError } = await supabase
        .from('shortlists')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (ownError) throw ownError;

      // Fetch shared shortlists user is a member of
      const { data: memberData, error: memberError } = await supabase
        .from('shortlist_members')
        .select('shortlist_id')
        .eq('user_id', profile.id)
        .neq('role', 'owner');

      if (memberError) throw memberError;

      let memberShortlists: any[] = [];
      if (memberData && memberData.length > 0) {
        const shortlistIds = memberData.map(m => m.shortlist_id);
        const { data: sharedShortlists, error: sharedError } = await supabase
          .from('shortlists')
          .select('*')
          .in('id', shortlistIds);

        if (sharedError) throw sharedError;
        memberShortlists = sharedShortlists || [];
      }

      const allShortlists = [
        ...(ownShortlists || []),
        ...memberShortlists
      ];

      // Fetch property counts and property IDs for each shortlist
      const shortlistsWithCounts = await Promise.all(
        allShortlists.map(async (shortlist) => {
          const { data: shortlistProperties, error } = await supabase
            .from('shortlist_properties')
            .select('property_id')
            .eq('shortlist_id', shortlist.id);

          if (error) {
            console.error('Error fetching shortlist properties:', error);
            return { 
              ...shortlist, 
              property_count: 0,
              property_ids: []
            };
          }

          const propertyIds = shortlistProperties?.map(sp => sp.property_id) || [];
          
          return { 
            ...shortlist, 
            property_count: propertyIds.length,
            property_ids: propertyIds
          };
        })
      );

      setShortlists(shortlistsWithCounts);
    } catch (error) {
      console.error('Error fetching shortlists:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shortlists",
        variant: "destructive",
      });
    }
  };

  const fetchInvitations = async () => {
    if (!profile?.id) return;

    try {
      console.log('Fetching invitations for user:', profile.id);
      
      // First get the raw invitation data
      const { data: invitationData, error } = await supabase
        .from('shortlist_invitations')
        .select('*')
        .eq('invitee_id', profile.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
        throw error;
      }

      console.log('Raw invitation data:', invitationData);

      if (!invitationData || invitationData.length === 0) {
        setInvitations([]);
        return;
      }

      // Get unique shortlist and inviter IDs
      const shortlistIds = [...new Set(invitationData.map(inv => inv.shortlist_id))];
      const inviterIds = [...new Set(invitationData.map(inv => inv.inviter_id))];

      // Fetch shortlist details
      const { data: shortlistsData, error: shortlistError } = await supabase
        .from('shortlists')
        .select('*')
        .in('id', shortlistIds);

      if (shortlistError) {
        console.error('Error fetching shortlists:', shortlistError);
      }

      // Fetch inviter details
      const { data: profilesData, error: profileError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', inviterIds);

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
      }

      // Combine the data
      const formattedInvitations = invitationData.map(inv => {
        const shortlist = shortlistsData?.find(s => s.id === inv.shortlist_id);
        const inviter = profilesData?.find(p => p.id === inv.inviter_id);
        
        return {
          ...inv,
          status: inv.status as 'pending' | 'accepted' | 'rejected',
          shortlist,
          inviter_name: inviter?.name || 'Unknown User'
        };
      });

      console.log('Formatted invitations:', formattedInvitations);
      setInvitations(formattedInvitations);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      setInvitations([]);
    }
  };

  const createShortlist = async (name: string, description?: string) => {
    if (!profile?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create shortlists",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('shortlists')
        .insert({
          name,
          description: description || null,
          user_id: profile.id
        })
        .select()
        .single();

      if (error) throw error;

      const newShortlist = { ...data, property_count: 0 };
      setShortlists(prev => [newShortlist, ...prev]);
      toast({
        title: "Shortlist created!",
        description: `"${name}" has been created`,
      });

      return data;
    } catch (error) {
      console.error('Error creating shortlist:', error);
      toast({
        title: "Error",
        description: "Failed to create shortlist",
        variant: "destructive",
      });
    }
  };

  const addPropertyToShortlist = async (shortlistId: string, propertyId: string) => {
    if (!profile?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add properties",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if property is already in the shortlist
      const { data: existingEntry, error: checkError } = await supabase
        .from('shortlist_properties')
        .select('id')
        .eq('shortlist_id', shortlistId)
        .eq('property_id', propertyId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingEntry) {
        toast({
          title: "Already added",
          description: "This property is already in the shortlist",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('shortlist_properties')
        .insert({
          shortlist_id: shortlistId,
          property_id: propertyId,
          added_by: profile.id
        });

      if (error) throw error;

      // Update the property count
      setShortlists(prev => prev.map(shortlist => 
        shortlist.id === shortlistId 
          ? { ...shortlist, property_count: (shortlist.property_count || 0) + 1 }
          : shortlist
      ));

      toast({
        title: "Property added!",
        description: "Property has been added to shortlist",
      });
    } catch (error) {
      console.error('Error adding property to shortlist:', error);
      toast({
        title: "Error",
        description: "Failed to add property to shortlist",
        variant: "destructive",
      });
    }
  };

  const inviteToShortlist = async (shortlistId: string, inviteeId: string) => {
    if (!profile?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send invitations",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Sending invitation from', profile.id, 'to', inviteeId, 'for shortlist', shortlistId);
      
      // Check if invitation already exists
      const { data: existingInvitation, error: checkError } = await supabase
        .from('shortlist_invitations')
        .select('id, status')
        .eq('shortlist_id', shortlistId)
        .eq('invitee_id', inviteeId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing invitations:', checkError);
        throw checkError;
      }

      if (existingInvitation) {
        console.log('Invitation already exists:', existingInvitation);
        if (existingInvitation.status === 'pending') {
          // Already has a pending invitation, don't throw error
          console.log('Invitation already pending');
          return;
        } else if (existingInvitation.status === 'rejected') {
          // Update existing rejected invitation to pending
          const { error: updateError } = await supabase
            .from('shortlist_invitations')
            .update({ 
              status: 'pending', 
              updated_at: new Date().toISOString(),
              inviter_id: profile.id 
            })
            .eq('id', existingInvitation.id);

          if (updateError) throw updateError;
          console.log('Updated rejected invitation to pending');
        } else {
          // Already accepted, don't send again
          console.log('Invitation already accepted');
          return;
        }
      } else {
        // Create new invitation
        const { error } = await supabase
          .from('shortlist_invitations')
          .insert({
            shortlist_id: shortlistId,
            inviter_id: profile.id,
            invitee_id: inviteeId,
            status: 'pending'
          });

        if (error) throw error;
        console.log('New invitation created');
      }

      console.log('Invitation sent successfully');
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw error; // Re-throw to let the component handle it
    }
  };

  const checkInvitationStatus = async (shortlistId: string, userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_invitation_status', {
        p_shortlist_id: shortlistId,
        p_user_id: userId
      });

      if (error) {
        console.error('Error checking invitation status:', error);
        throw error;
      }
      
      console.log('Invitation status for user', userId, 'shortlist', shortlistId, ':', data);
      return data;
    } catch (error) {
      console.error('Error checking invitation status:', error);
      return 'not_invited';
    }
  };

  const respondToInvitation = async (invitationId: string, accept: boolean) => {
    try {
      console.log('Responding to invitation:', invitationId, 'accept:', accept);
      
      if (accept) {
        const { data, error } = await supabase.rpc('accept_shortlist_invitation', {
          invitation_id: invitationId
        });

        if (error) throw error;

        toast({
          title: "Invitation accepted!",
          description: "You've joined the shortlist",
        });
      } else {
        const { error } = await supabase
          .from('shortlist_invitations')
          .update({ status: 'rejected', updated_at: new Date().toISOString() })
          .eq('id', invitationId);

        if (error) throw error;

        toast({
          title: "Invitation declined",
          description: "You've declined the invitation",
        });
      }

      await fetchInvitations();
      await fetchShortlists();
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast({
        title: "Error",
        description: "Failed to respond to invitation",
        variant: "destructive",
      });
    }
  };

  const updateShortlistSharing = async (shortlistId: string, isShared: boolean) => {
    try {
      const { error } = await supabase
        .from('shortlists')
        .update({ is_shared: isShared })
        .eq('id', shortlistId);

      if (error) throw error;

      setShortlists(prev => prev.map(s => 
        s.id === shortlistId ? { ...s, is_shared: isShared } : s
      ));

      toast({
        title: isShared ? "Sharing enabled" : "Sharing disabled",
        description: isShared ? "This shortlist can now be shared" : "This shortlist is now private",
      });
    } catch (error) {
      console.error('Error updating sharing:', error);
      toast({
        title: "Error",
        description: "Failed to update sharing settings",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchShortlists(), fetchInvitations()]);
      setLoading(false);
    };

    if (profile?.id) {
      loadData();
    }
  }, [profile?.id]);

  return {
    shortlists,
    invitations,
    loading,
    createShortlist,
    addPropertyToShortlist,
    inviteToShortlist,
    respondToInvitation,
    updateShortlistSharing,
    checkInvitationStatus,
    refetch: () => Promise.all([fetchShortlists(), fetchInvitations()])
  };
}
