import React, { useState, useEffect } from 'react';
import { Edit, MapPin, Heart, Star, Building, Camera, MessageSquare, FileText, List, X, Bed, Bath, Square, Share2, Plus, Copy, UserPlus, Check } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useConnections } from '@/hooks/useConnections';
import { useProperties } from '@/hooks/useProperties';
import { useBusinessRatings } from '@/hooks/useBusinessRatings';
import { usePosts } from '@/hooks/usePosts';
import { useShortlists } from '@/hooks/useShortlists';
import AvatarWithBadge from './AvatarWithBadge';
import UserBadge from './UserBadge';
import StarRating from './StarRating';
import ImageUpload from './ImageUpload';
import EditProfileModal from './EditProfileModal';
import BusinessReviews from './BusinessReviews';
import UserConnections from './UserConnections';
import UserProperties from './UserProperties';
import ShortlistsManager from './ShortlistsManager';
import UserPosts from './UserPosts';
import PropertyModal from './PropertyModal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface ListingPreferences {
  types: string[];
  minSize: number;
  maxSize: number;
  minPrice: number;
  maxPrice: number;
  location: string;
}

const parseListingPreference = (preference: string | undefined): ListingPreferences | null => {
  if (!preference) return null;
  
  try {
    const parsed = JSON.parse(preference);
    if (parsed.types || parsed.minSize !== undefined) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { connections } = useConnections();
  const { properties } = useProperties();
  const { fetchBusinessRatings, getRatingStats } = useBusinessRatings();
  const { posts } = usePosts();
  const { shortlists, invitations, createShortlist, respondToInvitation, updateShortlistSharing, inviteToShortlist, checkInvitationStatus } = useShortlists();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [activeSection, setActiveSection] = useState<'reviews' | 'connections' | 'properties' | 'shortlists' | 'posts' | null>(null);
  const [viewingShortlistProperties, setViewingShortlistProperties] = useState<string | null>(null);
  const [shortlistProperties, setShortlistProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedShortlistForShare, setSelectedShortlistForShare] = useState<any>(null);
  const [newShortlistName, setNewShortlistName] = useState('');
  const [newShortlistDescription, setNewShortlistDescription] = useState('');
  const [invitationStatuses, setInvitationStatuses] = useState<{[key: string]: {[key: string]: string}}>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch ratings if current user is a business
  useEffect(() => {
    if (profile && profile.badge === 'business') {
      fetchBusinessRatings([profile.id]);
    }
  }, [profile, fetchBusinessRatings]);

  if (!user || !profile) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  const handleAvatarUpload = async (url: string) => {
    setIsUploadingAvatar(true);
    try {
      await updateProfile({ avatar_url: url });
      toast({
        title: "Success!",
        description: "Profile picture updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile picture.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleProfileUpdate = async (updatedData: any) => {
    try {
      await updateProfile(updatedData);
      toast({
        title: "Success!",
        description: "Profile updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const handleSectionToggle = (section: 'reviews' | 'connections' | 'properties' | 'shortlists' | 'posts') => {
    setActiveSection(activeSection === section ? null : section);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `€${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `€${(price / 1000).toFixed(0)}K`;
    }
    return `€${price}`;
  };

  const formatSizeRange = (minSize: number, maxSize: number) => {
    if (minSize > 0 && maxSize > 0) {
      return `${minSize} - ${maxSize} m²`;
    } else if (minSize > 0) {
      return `> ${minSize} m²`;
    } else if (maxSize > 0) {
      return `< ${maxSize} m²`;
    }
    return null;
  };

  const formatPriceRange = (minPrice: number, maxPrice: number) => {
    if (minPrice > 0 && maxPrice > 0) {
      return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
    } else if (minPrice > 0) {
      return `> ${formatPrice(minPrice)}`;
    } else if (maxPrice > 0) {
      return `< ${formatPrice(maxPrice)}`;
    }
    return null;
  };

  const ratingStats = profile.badge === 'business' ? getRatingStats(profile.id) : null;
  const isBusiness = profile.badge === 'business';
  const isOwner = profile.badge === 'owner';
  const isSeeker = profile.badge === 'seeker';

  // Count properties owned by this user
  const userPropertiesCount = properties.filter(property => property.owner_id === profile.id).length;

  // Count posts by this user
  const userPostsCount = posts.filter(post => post.userId === profile.id).length;

  // Count total properties across all shortlists
  const totalShortlistedCount = shortlists.reduce((total, shortlist) => {
    return total + (shortlist.properties?.length || 0);
  }, 0);

  // Parse listing preferences for seeker users
  const listingPreferences = isSeeker ? parseListingPreference(profile.listing_preference) : null;

  const handleViewProperties = async (shortlistId: string) => {
    try {
      // Fetch property IDs from shortlist_properties
      const { data: propertyIds, error: idsError } = await supabase
        .from('shortlist_properties')
        .select('property_id')
        .eq('shortlist_id', shortlistId);

      if (idsError) throw idsError;

      if (!propertyIds || propertyIds.length === 0) {
        setShortlistProperties([]);
        setViewingShortlistProperties(shortlistId);
        return;
      }

      // Fetch actual property details
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds.map(p => p.property_id));

      if (propertiesError) throw propertiesError;

      setShortlistProperties(properties || []);
      setViewingShortlistProperties(shortlistId);
    } catch (error) {
      console.error('Error fetching shortlist properties:', error);
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      });
    }
  };

  const handleRemovePropertyFromShortlist = async (propertyId: string) => {
    if (!viewingShortlistProperties) return;

    try {
      const { error } = await supabase
        .from('shortlist_properties')
        .delete()
        .eq('shortlist_id', viewingShortlistProperties)
        .eq('property_id', propertyId);

      if (error) throw error;

      // Update local state
      setShortlistProperties(prev => prev.filter(property => property.id !== propertyId));

      toast({
        title: "Property removed",
        description: "Property has been removed from shortlist",
      });
    } catch (error) {
      console.error('Error removing property:', error);
      toast({
        title: "Error",
        description: "Failed to remove property from shortlist",
        variant: "destructive",
      });
    }
  };

  const handleCreateShortlist = async () => {
    if (!newShortlistName.trim()) return;
    
    await createShortlist(newShortlistName, newShortlistDescription);
    setNewShortlistName('');
    setNewShortlistDescription('');
    setShowCreateModal(false);
  };

  const toggleSharing = async (shortlistId: string, currentSharing: boolean) => {
    await updateShortlistSharing(shortlistId, !currentSharing);
  };

  // Count shortlists correctly
  const shortlistsCount = shortlists.length;

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

  const handleShareShortlist = (shortlist: any) => {
    setSelectedShortlistForShare(shortlist);
    setShowShareModal(true);
    
    // Fetch invitation statuses when opening share modal
    fetchInvitationStatuses(shortlist.id);
  };

  const copyShareLink = (shareToken: string) => {
    const shareUrl = `${window.location.origin}/shortlist/shared/${shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Share link has been copied to clipboard",
    });
  };

  const getButtonContent = (connectionId: string) => {
    if (!selectedShortlistForShare) return null;
    
    const status = invitationStatuses[selectedShortlistForShare.id]?.[connectionId];
    
    switch (status) {
      case 'pending':
        return (
          <Button size="sm" disabled className="bg-yellow-100 text-yellow-800 border border-yellow-300">
            <UserPlus className="h-4 w-4 mr-1" />
            Invited
          </Button>
        );
      case 'accepted':
        return (
          <Button size="sm" disabled className="bg-green-100 text-green-800 border border-green-300">
            <UserPlus className="h-4 w-4 mr-1" />
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

  const handleInviteUser = async (connectionId: string) => {
    if (!selectedShortlistForShare) return;
    
    setIsLoading(true);
    try {
      await inviteToShortlist(selectedShortlistForShare.id, connectionId);
      
      // Refresh invitation statuses after successful invite
      await fetchInvitationStatuses(selectedShortlistForShare.id);
      
      toast({
        title: "Invitation sent!",
        description: "Your connection has been invited to the shortlist",
      });
    } catch (error: any) {
      console.error('Error inviting user:', error);
      
      if (error?.code === '23505' || error?.message?.includes('already exists')) {
        // Refresh statuses even for duplicate invitations
        await fetchInvitationStatuses(selectedShortlistForShare.id);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="flex items-start space-x-8">
          <div className="relative">
            {isUploadingAvatar ? (
              <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center">
                <p className="text-sm text-gray-500">Uploading...</p>
              </div>
            ) : (
              <div className="relative w-48 h-48 group">
                <ImageUpload
                  bucket="avatars"
                  onUpload={handleAvatarUpload}
                  isAvatar={true}
                  isOverlay={true}
                  className="w-full h-full"
                >
                  <div className="relative w-full h-full cursor-pointer">
                    <img
                      src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`}
                      alt={profile.name}
                      className="w-48 h-48 rounded-full object-cover shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="w-12 h-12 bg-white rounded-full shadow-lg border-2 border-white flex items-center justify-center">
                          <Camera className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </ImageUpload>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-3 text-left">{profile.name}</h1>
                <div className="flex items-center gap-3 mb-4">
                  <UserBadge badge={profile.badge} size="md" />
                  {ratingStats && ratingStats.totalRatings > 0 && (
                    <div className="flex items-center space-x-2">
                      <StarRating rating={ratingStats.averageRating} readonly size="md" />
                      <span className="text-sm text-gray-600">
                        ({ratingStats.averageRating.toFixed(1)}) • {ratingStats.totalRatings} review{ratingStats.totalRatings !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{profile.location || 'Location not set'}</span>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4 text-left">
                  {profile.description || 'No description provided'}
                </p>
                
                {/* Display listing preferences for seeker users */}
                {isSeeker && listingPreferences && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 font-medium text-sm mb-3 text-left">Listing Preferences:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {listingPreferences.types.length > 0 && (
                        <div>
                          <span className="text-blue-700 font-medium">Type: </span>
                          <span className="text-blue-600">
                            {listingPreferences.types.map(type => type === 'rent' ? 'Rent' : 'Buy').join(', ')}
                          </span>
                        </div>
                      )}
                      {formatSizeRange(listingPreferences.minSize, listingPreferences.maxSize) && (
                        <div>
                          <span className="text-blue-700 font-medium">Size: </span>
                          <span className="text-blue-600">
                            {formatSizeRange(listingPreferences.minSize, listingPreferences.maxSize)}
                          </span>
                        </div>
                      )}
                      {formatPriceRange(listingPreferences.minPrice, listingPreferences.maxPrice) && (
                        <div>
                          <span className="text-blue-700 font-medium">Price: </span>
                          <span className="text-blue-600">
                            {formatPriceRange(listingPreferences.minPrice, listingPreferences.maxPrice)}
                          </span>
                        </div>
                      )}
                      {listingPreferences.location && (
                        <div>
                          <span className="text-blue-700 font-medium">Location: </span>
                          <span className="text-blue-600">{listingPreferences.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Fallback for old text-based listing preference */}
                {isSeeker && profile.listing_preference && !listingPreferences && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 font-medium text-sm text-left">Listing Preference:</p>
                    <p className="text-blue-700 text-sm text-left">{profile.listing_preference}</p>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(isOwner || isBusiness) && (
          <div 
            className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all duration-200 ${
              activeSection === 'properties' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
            }`}
            onClick={() => handleSectionToggle('properties')}
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 mx-auto">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center">{userPropertiesCount}</h3>
            <p className="text-gray-600 text-center">Properties Listed</p>
          </div>
        )}
        
        {isSeeker && (
          <div 
            className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all duration-200 ${
              activeSection === 'shortlists' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
            }`}
            onClick={() => handleSectionToggle('shortlists')}
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3 mx-auto">
              <List className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center">{shortlistsCount}</h3>
            <p className="text-gray-600 text-center">Favorites</p>
          </div>
        )}

        {isBusiness && (
          <div 
            className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all duration-200 ${
              activeSection === 'reviews' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
            }`}
            onClick={() => handleSectionToggle('reviews')}
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3 mx-auto">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center">
              {ratingStats ? ratingStats.totalRatings : 0}
            </h3>
            <p className="text-gray-600 text-center">Reviews</p>
          </div>
        )}
        
        <div 
          className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all duration-200 ${
            activeSection === 'connections' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
          }`}
          onClick={() => handleSectionToggle('connections')}
        >
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 mx-auto">
            <MessageSquare className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 text-center">{connections.length}</h3>
          <p className="text-gray-600 text-center">Connections</p>
        </div>

        {/* Only show Posts section if not a business user OR if business user has posts */}
        {(!isBusiness || userPostsCount > 0) && (
          <div 
            className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all duration-200 ${
              activeSection === 'posts' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
            }`}
            onClick={() => handleSectionToggle('posts')}
          >
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3 mx-auto">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center">{userPostsCount}</h3>
            <p className="text-gray-600 text-center">Posts</p>
          </div>
        )}
      </div>

      {/* Business Reviews Section */}
      {isBusiness && activeSection === 'reviews' && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Customer Reviews</h2>
          </div>
          <BusinessReviews businessId={profile.id} />
        </div>
      )}

      {activeSection === 'connections' && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">My Connections</h2>
          </div>
          <UserConnections connections={connections} />
        </div>
      )}

      {(isOwner || isBusiness) && activeSection === 'properties' && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">My Properties</h2>
          </div>
          <UserProperties ownerId={profile.id} />
        </div>
      )}

      {isSeeker && activeSection === 'shortlists' && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">My Favorites</h2>
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Favorites List</span>
            </Button>
          </div>
          <div className="p-6">
            {/* Pending Invitations Section */}
            {invitations.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Pending Invitations</h3>
                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-blue-900">{invitation.shortlist?.name}</h4>
                          <p className="text-sm text-blue-700 mb-1">
                            Invited by {invitation.inviter_name}
                          </p>
                          {invitation.shortlist?.description && (
                            <p className="text-sm text-blue-600 mb-2">
                              {invitation.shortlist.description}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => respondToInvitation(invitation.id, true)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => respondToInvitation(invitation.id, false)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User's Own Shortlists */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shortlists.map((shortlist) => (
                <div key={shortlist.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{shortlist.name}</h3>
                      {shortlist.description && (
                        <p className="text-gray-600 text-sm mb-2">{shortlist.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mb-3">
                        {shortlist.property_count || 0} properties
                      </p>
                    </div>
                    {shortlist.is_shared && (
                      <div className="flex items-center text-blue-600 ml-2">
                        <Share2 className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => handleViewProperties(shortlist.id)}
                      className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-3xl text-sm hover:bg-primary/90 transition-colors"
                    >
                      View Properties
                    </button>
                    
                    <button
                      onClick={() => handleShareShortlist(shortlist)}
                      className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-3xl text-sm hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'posts' && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">My Posts</h2>
          </div>
          <UserPosts userId={profile.id} />
        </div>
      )}

      {/* Properties Popup */}
      {viewingShortlistProperties && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">Shortlist Properties</h2>
              <button
                onClick={() => setViewingShortlistProperties(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {shortlistProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shortlistProperties.map((property) => (
                    <div key={property.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 
                            className="font-semibold text-lg cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => setSelectedProperty(property)}
                          >
                            {property.title}
                          </h3>
                          <p className="text-gray-600 text-sm">{property.location}</p>
                          <p className="text-xl font-bold text-blue-600 mt-2">
                            €{property.price?.toLocaleString()}
                            {property.type === 'rent' && <span className="text-sm text-gray-500">/month</span>}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-x-2">
                          {property.images && property.images[0] && (
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="w-20 h-20 object-cover rounded-lg cursor-pointer"
                              onClick={() => setSelectedProperty(property)}
                            />
                          )}
                          <button
                            onClick={() => handleRemovePropertyFromShortlist(property.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center">
                          <Square className="h-4 w-4 mr-1" />
                          <span>{property.area}m²</span>
                        </div>
                      </div>
                      <p 
                        className="text-gray-600 text-sm line-clamp-2 cursor-pointer hover:text-gray-800"
                        onClick={() => setSelectedProperty(property)}
                      >
                        {property.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No properties in this shortlist</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Shortlist Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share "{selectedShortlistForShare?.name}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Share Link */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Share Link</label>
              <div className="flex items-center space-x-2">
                <Input
                  value={`${window.location.origin}/shortlist/shared/${selectedShortlistForShare?.share_token}`}
                  readOnly
                  className="flex-1 text-sm"
                />
                <Button
                  size="sm"
                  onClick={() => copyShareLink(selectedShortlistForShare?.share_token)}
                  className="flex items-center space-x-1"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Anyone with this link can view the shortlist
              </p>
            </div>

            {/* Share with Connections */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Share with Connections</label>
              {connections.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {connections.map((connection) => (
                    <div
                      key={connection.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={connection.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${connection.name}`}
                          alt={connection.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-sm">{connection.name}</p>
                          <p className="text-xs text-gray-600">{connection.location}</p>
                        </div>
                      </div>
                      {getButtonContent(connection.id)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  No connections available to share with
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Shortlist Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
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

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          isOpen={!!selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      <EditProfileModal
        user={profile}
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        onSave={handleProfileUpdate}
      />
    </div>
  );
};

export default Profile;
