
import React, { useState, useEffect } from 'react';
import { Plus, Users, Share2, Copy, UserPlus, Eye, Heart, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useShortlists } from '@/hooks/useShortlists';
import { useConnections } from '@/hooks/useConnections';
import { useProperties } from '@/hooks/useProperties';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ShortlistsManager: React.FC = () => {
  const { shortlists, invitations, createShortlist, inviteToShortlist, respondToInvitation, updateShortlistSharing, refetch } = useShortlists();
  const { connections } = useConnections();
  const { properties } = useProperties();
  const { toast } = useToast();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedShortlistId, setSelectedShortlistId] = useState<string>('');
  const [newShortlistName, setNewShortlistName] = useState('');
  const [newShortlistDescription, setNewShortlistDescription] = useState('');
  const [viewingShortlistId, setViewingShortlistId] = useState<string | null>(null);
  const [shortlistProperties, setShortlistProperties] = useState<{[key: string]: any[]}>({});

  // Fetch properties for each shortlist
  useEffect(() => {
    const fetchShortlistProperties = async () => {
      const propertiesData: {[key: string]: any[]} = {};
      
      for (const shortlist of shortlists) {
        try {
          const { data, error } = await supabase
            .from('shortlist_properties')
            .select(`
              property_id,
              properties (
                id,
                title,
                description,
                price,
                type,
                location,
                bedrooms,
                bathrooms,
                area,
                images
              )
            `)
            .eq('shortlist_id', shortlist.id);

          if (error) throw error;
          propertiesData[shortlist.id] = data?.map(item => item.properties).filter(Boolean) || [];
        } catch (error) {
          console.error('Error fetching shortlist properties:', error);
        }
      }
      
      setShortlistProperties(propertiesData);
    };

    if (shortlists.length > 0) {
      fetchShortlistProperties();
    }
  }, [shortlists]);

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

  const removePropertyFromShortlist = async (shortlistId: string, propertyId: string) => {
    try {
      const { error } = await supabase
        .from('shortlist_properties')
        .delete()
        .eq('shortlist_id', shortlistId)
        .eq('property_id', propertyId);

      if (error) throw error;

      // Update local state
      setShortlistProperties(prev => ({
        ...prev,
        [shortlistId]: prev[shortlistId]?.filter(property => property.id !== propertyId) || []
      }));

      toast({
        title: "Property removed",
        description: "Property has been removed from shortlist",
      });

      // Refresh shortlists to update counts
      refetch();
    } catch (error) {
      console.error('Error removing property:', error);
      toast({
        title: "Error",
        description: "Failed to remove property from shortlist",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `€${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `€${(price / 1000).toFixed(0)}K`;
    }
    return `€${price}`;
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
                <p className="text-sm text-gray-500 mt-2">
                  {shortlistProperties[shortlist.id]?.length || 0} properties
                </p>
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
                onClick={() => setViewingShortlistId(viewingShortlistId === shortlist.id ? null : shortlist.id)}
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                {viewingShortlistId === shortlist.id ? 'Hide Properties' : 'View Properties'}
              </Button>
              
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

            {/* Properties List */}
            {viewingShortlistId === shortlist.id && (
              <div className="mt-4 space-y-3 border-t pt-4">
                {shortlistProperties[shortlist.id]?.length > 0 ? (
                  shortlistProperties[shortlist.id].map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{property.title}</h4>
                        <p className="text-xs text-gray-600">{property.location}</p>
                        <p className="text-sm font-semibold text-blue-600">{formatPrice(property.price)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePropertyFromShortlist(shortlist.id, property.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">No properties in this shortlist</p>
                )}
              </div>
            )}
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
