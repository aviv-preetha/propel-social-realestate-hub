
import React, { useState, useEffect } from 'react';
import { UserPlus, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useConnections } from '@/hooks/useConnections';
import { useShortlists } from '@/hooks/useShortlists';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ShortlistInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortlistId: string;
  shortlistName: string;
  shareToken: string;
}

const ShortlistInviteModal: React.FC<ShortlistInviteModalProps> = ({
  isOpen,
  onClose,
  shortlistId,
  shortlistName,
  shareToken
}) => {
  const { connections } = useConnections();
  const { inviteToShortlist } = useShortlists();
  const { toast } = useToast();
  const [invitationStatuses, setInvitationStatuses] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [invitingUsers, setInvitingUsers] = useState<Set<string>>(new Set());

  const fetchInvitationStatuses = async () => {
    if (!isOpen || !connections.length || !shortlistId) {
      setInvitationStatuses({});
      return;
    }
    
    console.log('Fetching invitation statuses for shortlist:', shortlistId);
    console.log('Connections:', connections);
    
    try {
      // Get all invitations for this shortlist
      const { data: invitations, error } = await supabase
        .from('shortlist_invitations')
        .select('invitee_id, status')
        .eq('shortlist_id', shortlistId);

      if (error) {
        console.error('Error fetching invitations:', error);
        return;
      }

      console.log('Raw invitations from DB:', invitations);

      // Create status map
      const statuses: {[key: string]: string} = {};
      
      // Initialize all connections as not_invited
      connections.forEach(connection => {
        statuses[connection.id] = 'not_invited';
      });

      // Update with actual invitation statuses
      if (invitations) {
        invitations.forEach(invitation => {
          statuses[invitation.invitee_id] = invitation.status;
        });
      }

      console.log('Final statuses:', statuses);
      setInvitationStatuses(statuses);
    } catch (error) {
      console.error('Error in fetchInvitationStatuses:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Reset statuses first
      setInvitationStatuses({});
      // Then fetch fresh statuses
      fetchInvitationStatuses();
    }
  }, [isOpen, shortlistId, connections]);

  const handleInviteUser = async (connectionId: string) => {
    setIsLoading(true);
    setInvitingUsers(prev => new Set([...prev, connectionId]));
    
    try {
      await inviteToShortlist(shortlistId, connectionId);
      
      // Set status to pending immediately
      setInvitationStatuses(prev => ({
        ...prev,
        [connectionId]: 'pending'
      }));
      
      toast({
        title: "Invitation sent!",
        description: "Your invitation has been sent successfully",
      });

      // Refresh statuses after a short delay to ensure DB consistency
      setTimeout(() => {
        fetchInvitationStatuses();
      }, 1000);
      
    } catch (error: any) {
      console.error('Error inviting user:', error);
      
      // Check if it's a duplicate invitation error
      if (error?.code === '23505' || error?.message?.includes('already exists')) {
        setInvitationStatuses(prev => ({
          ...prev,
          [connectionId]: 'pending'
        }));
        toast({
          title: "Already invited",
          description: "This user has already been invited to this shortlist",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send invitation",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setInvitingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(connectionId);
        return newSet;
      });
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/shortlist/shared/${shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Share link has been copied to clipboard",
    });
  };

  const getButtonContent = (connectionId: string) => {
    const status = invitationStatuses[connectionId];
    const isCurrentlyInviting = invitingUsers.has(connectionId);
    
    console.log(`Button for ${connectionId}: status=${status}, inviting=${isCurrentlyInviting}`);
    
    if (isCurrentlyInviting) {
      return (
        <Button size="sm" disabled className="bg-gray-100 text-gray-600 border border-gray-300">
          Sending...
        </Button>
      );
    }
    
    switch (status) {
      case 'pending':
        return (
          <Button size="sm" disabled className="bg-yellow-100 text-yellow-800 border border-yellow-300">
            <Check className="h-4 w-4 mr-1" />
            Invited
          </Button>
        );
      case 'accepted':
        return (
          <Button size="sm" disabled className="bg-green-100 text-green-800 border border-green-300">
            <Check className="h-4 w-4 mr-1" />
            Joined
          </Button>
        );
      case 'rejected':
        return (
          <Button size="sm" disabled className="bg-red-100 text-red-800 border border-red-300">
            Declined
          </Button>
        );
      default:
        return (
          <Button
            size="sm"
            onClick={() => handleInviteUser(connectionId)}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Invite
          </Button>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{shortlistName}"</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Copy Link Section */}
          <div className="space-y-3">
            <h3 className="font-medium">Share with anyone</h3>
            <Button
              onClick={copyShareLink}
              variant="outline"
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Share Link
            </Button>
          </div>

          {/* Invite Connections Section */}
          <div className="space-y-3">
            <h3 className="font-medium">Invite your connections</h3>
            {connections.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {connections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{connection.name}</p>
                      <p className="text-sm text-gray-600">{connection.location}</p>
                    </div>
                    {getButtonContent(connection.id)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No connections available to invite
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShortlistInviteModal;
