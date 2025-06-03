
import React, { useState } from 'react';
import { Edit, MapPin, Heart, Star, Building } from 'lucide-react';
import { mockUsers, mockProperties } from '../data/mockData';
import UserBadge from './UserBadge';
import PropertyCard from './PropertyCard';
import EditProfileModal from './EditProfileModal';
import PropertyModal from './PropertyModal';
import { Property, User } from '../types';

const Profile: React.FC = () => {
  const [user, setUser] = useState(mockUsers[0]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  const userProperties = mockProperties.filter(property => property.ownerId === user.id);
  const shortlistedProperties = mockProperties.filter(property => 
    user.shortlistedProperties.includes(property.id)
  );

  const handleProfileUpdate = (updatedData: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleShortlist = (propertyId: string) => {
    setUser(prev => ({
      ...prev,
      shortlistedProperties: prev.shortlistedProperties.includes(propertyId)
        ? prev.shortlistedProperties.filter(id => id !== propertyId)
        : [...prev.shortlistedProperties, propertyId]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-700"></div>
        <div className="px-6 pb-6">
          <div className="flex items-start space-x-6 -mt-16">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white bg-white"
              />
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 pt-16">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                    <UserBadge badge={user.badge} size="md" />
                  </div>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{user.location}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">{user.description}</p>
                  {user.listingPreference && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-800 font-medium text-sm">Listing Preference:</p>
                      <p className="text-blue-700 text-sm">{user.listingPreference}</p>
                    </div>
                  )}
                </div>
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
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{userProperties.length}</h3>
          <p className="text-gray-600">Properties Listed</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Heart className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{user.shortlistedProperties.length}</h3>
          <p className="text-gray-600">Shortlisted</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{user.connections.length}</h3>
          <p className="text-gray-600">Connections</p>
        </div>
      </div>

      {/* My Properties */}
      {userProperties.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">My Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userProperties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property}
                onPropertyClick={handlePropertyClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Shortlisted Properties */}
      {shortlistedProperties.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Shortlisted Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortlistedProperties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property}
                onShortlist={handleShortlist}
                onPropertyClick={handlePropertyClick}
                isShortlisted={true}
              />
            ))}
          </div>
        </div>
      )}

      <EditProfileModal
        user={user}
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        onSave={handleProfileUpdate}
      />

      <PropertyModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onShortlist={handleShortlist}
        isShortlisted={selectedProperty ? user.shortlistedProperties.includes(selectedProperty.id) : false}
      />
    </div>
  );
};

export default Profile;
