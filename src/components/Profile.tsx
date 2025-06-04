import React, { useState, useEffect } from 'react';
import { Edit, MapPin, Heart, Star, Building, Camera, MessageSquare, FileText } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useConnections } from '@/hooks/useConnections';
import { useProperties } from '@/hooks/useProperties';
import { useBusinessRatings } from '@/hooks/useBusinessRatings';
import { usePosts } from '@/hooks/usePosts';
import AvatarWithBadge from './AvatarWithBadge';
import UserBadge from './UserBadge';
import StarRating from './StarRating';
import ImageUpload from './ImageUpload';
import EditProfileModal from './EditProfileModal';
import BusinessReviews from './BusinessReviews';
import UserConnections from './UserConnections';
import UserProperties from './UserProperties';
import ShortlistedProperties from './ShortlistedProperties';
import UserPosts from './UserPosts';
import { useToast } from '@/hooks/use-toast';

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
  const { properties, shortlistedProperties } = useProperties();
  const { fetchBusinessRatings, getRatingStats } = useBusinessRatings();
  const { posts } = usePosts();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [activeSection, setActiveSection] = useState<'reviews' | 'connections' | 'properties' | 'shortlisted' | 'posts' | null>(null);
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

  const handleSectionToggle = (section: 'reviews' | 'connections' | 'properties' | 'shortlisted' | 'posts') => {
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

  // Parse listing preferences for seeker users
  const listingPreferences = isSeeker ? parseListingPreference(profile.listing_preference) : null;

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              activeSection === 'shortlisted' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
            }`}
            onClick={() => handleSectionToggle('shortlisted')}
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 mx-auto">
              <Heart className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center">{shortlistedProperties.length}</h3>
            <p className="text-gray-600 text-center">Shortlisted</p>
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

      {isSeeker && activeSection === 'shortlisted' && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Shortlisted Properties</h2>
          </div>
          <ShortlistedProperties />
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
