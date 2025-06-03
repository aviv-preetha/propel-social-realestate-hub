
import React, { useState } from 'react';
import { Edit, MapPin, Heart, Star, Building, Camera } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useConnections } from '@/hooks/useConnections';
import { useProperties } from '@/hooks/useProperties';
import AvatarWithBadge from './AvatarWithBadge';
import UserBadge from './UserBadge';
import ImageUpload from './ImageUpload';
import EditProfileModal from './EditProfileModal';
import { useToast } from '@/hooks/use-toast';

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { connections } = useConnections();
  const { shortlistedProperties } = useProperties();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const { toast } = useToast();

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

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="flex items-start space-x-8">
          <div className="relative">
            {isUploadingAvatar ? (
              <div className="w-40 h-40 rounded-full bg-gray-200 border-4 border-white flex items-center justify-center">
                <p className="text-sm text-gray-500">Uploading...</p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`}
                  alt={profile.name}
                  className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div className="absolute bottom-2 right-2">
                  <ImageUpload
                    bucket="avatars"
                    onUpload={handleAvatarUpload}
                    isAvatar={true}
                    className="w-10 h-10 bg-white rounded-full shadow-lg border-2 border-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Camera className="h-5 w-5 text-gray-600" />
                  </ImageUpload>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                  <UserBadge badge={profile.badge} size="md" />
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{profile.location || 'Location not set'}</span>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {profile.description || 'No description provided'}
                </p>
                {profile.listing_preference && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 font-medium text-sm">Listing Preference:</p>
                    <p className="text-blue-700 text-sm">{profile.listing_preference}</p>
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
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors"
                >
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">0</h3>
          <p className="text-gray-600">Properties Listed</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Heart className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{shortlistedProperties.length}</h3>
          <p className="text-gray-600">Shortlisted</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{connections.length}</h3>
          <p className="text-gray-600">Connections</p>
        </div>
      </div>

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
