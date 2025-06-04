
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

      let memberShortlists: Shortlist[] = [];
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

      setShortlists(allShortlists);
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
      const { data: invitationData, error } = await supabase
        .from('shortlist_invitations')
        .select('*')
        .eq('invitee_id', profile.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!invitationData || invitationData.length === 0) {
        setInvitations([]);
        return;
      }

      // Fetch shortlist details for each invitation
      const shortlistIds = invitationData.map(inv => inv.shortlist_id);
      const { data: shortlistData, error: shortlistError } = await supabase
        .from('shortlists')
        .select('*')
        .in('id', shortlistIds);

      if (shortlistError) throw shortlistError;

      // Fetch inviter details
      const inviterIds = invitationData.map(inv => inv.inviter_id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', inviterIds);

      if (profileError) throw profileError;

      const formattedInvitations = invitationData.map(inv => {
        const shortlist = shortlistData?.find(s => s.id === inv.shortlist_id);
        const inviter = profileData?.find(p => p.id === inv.inviter_id);
        
        return {
          ...inv,
          status: inv.status as 'pending' | 'accepted' | 'rejected',
          shortlist,
          inviter_name: inviter?.name
        };
      });

      setInvitations(formattedInvitations);
    } catch (error) {
      console.error('Error fetching invitations:', error);
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

      setShortlists(prev => [data, ...prev]);
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
      const { error } = await supabase
        .from('shortlist_properties')
        .insert({
          shortlist_id: shortlistId,
          property_id: propertyId,
          added_by: profile.id
        });

      if (error) throw error;

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
      const { error } = await supabase
        .from('shortlist_invitations')
        .insert({
          shortlist_id: shortlistId,
          inviter_id: profile.id,
          invitee_id: inviteeId
        });

      if (error) throw error;

      toast({
        title: "Invitation sent!",
        description: "Your invitation has been sent",
      });
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const respondToInvitation = async (invitationId: string, accept: boolean) => {
    try {
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
    refetch: () => Promise.all([fetchShortlists(), fetchInvitations()])
  };
}
