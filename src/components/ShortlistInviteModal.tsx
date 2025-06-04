
import React, { useState, useEffect } from 'react';
import { UserPlus, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useConnections } from '@/hooks/useConnections';
import { useShortlists } from '@/hooks/useShortlists';
import { useToast } from '@/hooks/use-toast';

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
  console.log("ShortlistInviteModal");
  const { connections } = useConnections();
  const { inviteToShortlist, checkInvitationStatus } = useShortlists();
  const { toast } = useToast();
  const [invitationStatuses, setInvitationStatuses] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInvitationStatuses = async () => {
      if (!isOpen || !connections.length) return;
      
      console.log('Fetching invitation statuses for shortlist:', shortlistId);
      const statuses: {[key: string]: string} = {};
      
      for (const connection of connections) {
        try {
          const status = await checkInvitationStatus(shortlistId, connection.id);
          statuses[connection.id] = status;
          console.log(`Status for ${connection.name} (${connection.id}):`, status);
        } catch (error) {
          console.error('Error checking invitation status:', error);
          statuses[connection.id] = 'not_invited';
        }
      }
      
      setInvitationStatuses(statuses);
    };

    console.log("fetchInvitationStatuses");
    fetchInvitationStatuses();
  }, [isOpen, connections, shortlistId, checkInvitationStatus]);

  const handleInviteUser = async (connectionId: string) => {
    setIsLoading(true);
    try {
      await inviteToShortlist(shortlistId, connectionId);
      
      // Immediately update local status to show as pending
      setInvitationStatuses(prev => ({
        ...prev,
        [connectionId]: 'pending'
      }));
      
      toast({
        title: "Invitation sent!",
        description: "Your invitation has been sent successfully",
      });
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
