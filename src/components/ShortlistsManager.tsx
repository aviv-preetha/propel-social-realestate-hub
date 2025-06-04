
import React, { useState } from 'react';
import { Plus, Users, Share2, Copy, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useShortlists } from '@/hooks/useShortlists';
import { useConnections } from '@/hooks/useConnections';
import { useToast } from '@/hooks/use-toast';

const ShortlistsManager: React.FC = () => {
  const { shortlists, invitations, createShortlist, inviteToShortlist, respondToInvitation, updateShortlistSharing } = useShortlists();
  const { connections } = useConnections();
  const { toast } = useToast();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedShortlistId, setSelectedShortlistId] = useState<string>('');
  const [newShortlistName, setNewShortlistName] = useState('');
  const [newShortlistDescription, setNewShortlistDescription] = useState('');

  const handleCreateShortlist = async () => {
    if (!newShortlistName.trim()) return;
    
    await createShortlist(newShortlistName, newShortlistDescription);
    setNewShortlistName('');
    setNewShortlistDescription('');
    setShowCreateModal(false);
  };

  const handleInviteUser = async (connectionId: string) => {
    if (!selectedShortlistId) return;
    
    await inviteToShortlist(selectedShortlistId, connectionId);
    setShowInviteModal(false);
  };

  const copyShareLink = (shareToken: string) => {
    const shareUrl = `${window.location.origin}/shortlist/shared/${shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Share link has been copied to clipboard",
    });
  };

  const toggleSharing = async (shortlistId: string, currentSharing: boolean) => {
    await updateShortlistSharing(shortlistId, !currentSharing);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Shortlists</h1>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Shortlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Shortlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Shortlist name"
                value={newShortlistName}
                onChange={(e) => setNewShortlistName(e.target.value)}
              />
              <Textarea
                placeholder="Description (optional)"
                value={newShortlistDescription}
                onChange={(e) => setNewShortlistDescription(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleCreateShortlist}
                disabled={!newShortlistName.trim()}
                className="w-full"
              >
                Create Shortlist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Pending Invitations</h2>
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{invitation.shortlist?.name}</p>
                    <p className="text-sm text-gray-600">
                      Invited by {invitation.inviter_name}
                    </p>
                    {invitation.shortlist?.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {invitation.shortlist.description}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => respondToInvitation(invitation.id, true)}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => respondToInvitation(invitation.id, false)}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shortlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shortlists.map((shortlist) => (
          <div key={shortlist.id} className="p-6 border rounded-lg bg-white shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{shortlist.name}</h3>
                {shortlist.description && (
                  <p className="text-gray-600 text-sm mt-1">{shortlist.description}</p>
                )}
              </div>
              {shortlist.is_shared && (
                <div className="flex items-center text-blue-600">
                  <Users className="h-4 w-4" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSharing(shortlist.id, shortlist.is_shared)}
                className="w-full"
              >
                <Share2 className="h-4 w-4 mr-2" />
                {shortlist.is_shared ? 'Disable Sharing' : 'Enable Sharing'}
              </Button>
              
              {shortlist.is_shared && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyShareLink(shortlist.share_token)}
                    className="w-full"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Share Link
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedShortlistId(shortlist.id);
                      setShowInviteModal(true);
                    }}
                    className="w-full"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Connections
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Connections</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {connections.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {connections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{connection.name}</p>
                      <p className="text-sm text-gray-600">{connection.location}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleInviteUser(connection.id)}
                    >
                      Invite
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No connections available to invite
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShortlistsManager;
