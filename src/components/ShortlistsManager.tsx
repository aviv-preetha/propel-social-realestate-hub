import React, { useState, useEffect } from 'react';
import { Plus, Users, Eye, Heart, X, Copy, Check, UserPlus } from 'lucide-react';
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
  const { shortlists, invitations, createShortlist, respondToInvitation, updateShortlistSharing, refetch, inviteToShortlist, checkInvitationStatus } = useShortlists();
  const { connections } = useConnections();
  const { properties } = useProperties();
  const { toast } = useToast();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedShortlist, setSelectedShortlist] = useState<{id: string, name: string, shareToken: string} | null>(null);
  const [newShortlistName, setNewShortlistName] = useState('');
  const [newShortlistDescription, setNewShortlistDescription] = useState('');
  const [viewingShortlistId, setViewingShortlistId] = useState<string | null>(null);
  const [shortlistProperties, setShortlistProperties] = useState<{[key: string]: any[]}>({});
  const [invitationStatuses, setInvitationStatuses] = useState<{[key: string]: {[key: string]: string}}>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchShortlistProperties = async () => {
      const propertiesData: {[key: string]: any[]} = {};
      
      for (const shortlist of shortlists) {
        try {
          // Query shortlist_properties table and join with properties
          const { data, error } = await supabase
            .from('shortlist_properties')
            .select('property_id')
            .eq('shortlist_id', shortlist.id);

          if (error) {
            console.error('Error fetching shortlist property IDs:', error);
            propertiesData[shortlist.id] = [];
            continue;
          }

          if (!data || data.length === 0) {
            propertiesData[shortlist.id] = [];
            continue;
          }

          // Fetch the actual property details
          const propertyIds = data.map(item => item.property_id);
          const { data: propertyDetails, error: propertiesError } = await supabase
            .from('properties')
            .select('*')
            .in('id', propertyIds);

          if (propertiesError) {
            console.error('Error fetching property details:', propertiesError);
            propertiesData[shortlist.id] = [];
          } else {
            propertiesData[shortlist.id] = propertyDetails || [];
          }
        } catch (error) {
          console.error('Error fetching shortlist properties:', error);
          propertiesData[shortlist.id] = [];
        }
      }
      
      setShortlistProperties(propertiesData);
    };

    if (shortlists.length > 0) {
      fetchShortlistProperties();
    }
  }, [shortlists]);

  // Fetch invitation statuses for a specific shortlist
  const fetchInvitationStatuses = async (shortlistId: string) => {
    if (!connections.length) return;
    
    const statuses: {[key: string]: string} = {};
    
    for (const connection of connections) {
      try {
        const status = await checkInvitationStatus(shortlistId, connection.id);
        statuses[connection.id] = status;
      } catch (error) {
        console.error('Error checking invitation status:', error);
        statuses[connection.id] = 'not_invited';
      }
    }
    
    setInvitationStatuses(prev => ({
      ...prev,
      [shortlistId]: statuses
    }));
  };

  const handleCreateShortlist = async () => {
    if (!newShortlistName.trim()) return;
    
    await createShortlist(newShortlistName, newShortlistDescription);
    setNewShortlistName('');
    setNewShortlistDescription('');
    setShowCreateModal(false);
  };

  const handleShareClick = (shortlist: any) => {
    if (!shortlist.is_shared) {
      updateShortlistSharing(shortlist.id, true);
    }
    
    setSelectedShortlist({
      id: shortlist.id,
      name: shortlist.name,
      shareToken: shortlist.share_token
    });
    setShowShareModal(true);
    
    // Fetch invitation statuses when opening share modal
    fetchInvitationStatuses(shortlist.id);
  };

  const handleInviteUser = async (connectionId: string) => {
    if (!selectedShortlist) return;
    
    setIsLoading(true);
    try {
      await inviteToShortlist(selectedShortlist.id, connectionId);
      
      // Refresh invitation statuses after successful invite
      await fetchInvitationStatuses(selectedShortlist.id);
      
      toast({
        title: "Invitation sent!",
        description: "Your invitation has been sent successfully",
      });
    } catch (error: any) {
      console.error('Error inviting user:', error);
      
      if (error?.code === '23505' || error?.message?.includes('already exists')) {
        // Refresh statuses even for duplicate invitations
        await fetchInvitationStatuses(selectedShortlist.id);
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
    if (!selectedShortlist) return;
    const shareUrl = `${window.location.origin}/shortlist/shared/${selectedShortlist.shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Share link has been copied to clipboard",
    });
  };

  const getButtonContent = (connectionId: string) => {
    if (!selectedShortlist) return null;
    
    const status = invitationStatuses[selectedShortlist.id]?.[connectionId];
    
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

  const isUserOwner = (shortlist: any, userId: string) => {
    return shortlist.user_id === userId;
  };

  const canViewProperties = (shortlist: any, userId: string) => {
    // User can view properties if they are the owner or if they are a member (accepted invitation)
    return isUserOwner(shortlist, userId) || shortlist.user_id !== userId;
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
                  {shortlist.property_count || 0} properties
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
                onClick={() => handleShareClick(shortlist)}
                className="w-full"
              >
                <Users className="h-4 w-4 mr-2" />
                Share
              </Button>
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

      {/* Share Modal */}
      {selectedShortlist && (
        <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share "{selectedShortlist.name}"</DialogTitle>
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
      )}
    </div>
  );
};

export default ShortlistsManager;
