
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
  const { connections } = useConnections();
  const { inviteToShortlist, checkInvitationStatus } = useShortlists();
  const { toast } = useToast();
  const [invitationStatuses, setInvitationStatuses] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInvitationStatuses = async () => {
      if (!isOpen || !connections.length) return;
      
      const statuses: {[key: string]: string} = {};
      for (const connection of connections) {
        const status = await checkInvitationStatus(shortlistId, connection.id);
        statuses[connection.id] = status;
      }
      setInvitationStatuses(statuses);
    };

    fetchInvitationStatuses();
  }, [isOpen, connections, shortlistId, checkInvitationStatus]);

  const handleInviteUser = async (connectionId: string) => {
    setIsLoading(true);
    try {
      await inviteToShortlist(shortlistId, connectionId);
      // Update local status to show as invited
      setInvitationStatuses(prev => ({
        ...prev,
        [connectionId]: 'pending'
      }));
    } catch (error) {
      console.error('Error inviting user:', error);
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
          <Button size="sm" disabled className="bg-yellow-100 text-yellow-800">
            <Check className="h-4 w-4 mr-1" />
            Invited
          </Button>
        );
      case 'accepted':
        return (
          <Button size="sm" disabled className="bg-green-100 text-green-800">
            <Check className="h-4 w-4 mr-1" />
            Joined
          </Button>
        );
      case 'rejected':
        return (
          <Button size="sm" disabled className="bg-red-100 text-red-800">
            Declined
          </Button>
        );
      default:
        return (
          <Button
            size="sm"
            onClick={() => handleInviteUser(connectionId)}
            disabled={isLoading}
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
