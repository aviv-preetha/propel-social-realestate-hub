
import React, { useState } from 'react';
import { Profile } from '@/hooks/useProfile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import ListingPreferencesForm from './ListingPreferencesForm';

interface EditProfileModalProps {
  user: Profile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: Partial<Profile>) => void;
}

interface ListingPreferences {
  types: string[];
  minSize: number;
  maxSize: number;
  minPrice: number;
  maxPrice: number;
  location: string;
}

const parseListingPreference = (preference: string | undefined): ListingPreferences => {
  if (!preference) {
    return {
      types: [],
      minSize: 10,
      maxSize: 200,
      minPrice: 500,
      maxPrice: 5000,
      location: ''
    };
  }

  try {
    return JSON.parse(preference);
  } catch {
    // Fallback for old text-based preferences
    return {
      types: [],
      minSize: 10,
      maxSize: 200,
      minPrice: 500,
      maxPrice: 5000,
      location: preference
    };
  }
};

const EditProfileModal: React.FC<EditProfileModalProps> = ({ 
  user, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    name: user.name,
    description: user.description || '',
    location: user.location || '',
    badge: user.badge,
    listing_preference: user.listing_preference || ''
  });

  const [listingPreferences, setListingPreferences] = useState<ListingPreferences>(
    parseListingPreference(user.listing_preference)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedData = {
      ...formData,
      listing_preference: user.badge === 'seeker' 
        ? JSON.stringify(listingPreferences)
        : formData.listing_preference
    };

    onSave(updatedData);
    onClose();
  };

  const isSeeker = user.badge === 'seeker';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Badge Type
            </label>
            <select
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value as 'owner' | 'seeker' | 'business' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="owner">Owner</option>
              <option value="seeker">Seeker</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {isSeeker && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Listing Preferences
              </label>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <ListingPreferencesForm
                  preferences={listingPreferences}
                  onChange={setListingPreferences}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
