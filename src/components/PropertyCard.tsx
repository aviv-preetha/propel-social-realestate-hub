
import React, { useState } from 'react';
import { Heart, MapPin, Bed, Bath, Square } from 'lucide-react';
import ShortlistSelectionModal from './ShortlistSelectionModal';
import { useShortlists } from '@/hooks/useShortlists';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'rent' | 'sale';
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  owner_id: string;
  features: string[];
}

interface PropertyCardProps {
  property: Property;
  onPropertyClick?: (property: Property) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onPropertyClick
}) => {
  const [showShortlistModal, setShowShortlistModal] = useState(false);
  const { shortlists } = useShortlists();

  const handleCardClick = () => {
    if (onPropertyClick) {
      onPropertyClick(property);
    }
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShortlistModal(true);
  };

  // Check if property is in any shortlist
  const isInAnyShortlist = shortlists.some(shortlist => 
    shortlist.property_ids?.includes(property.id)
  );

  // Use a placeholder image if no images are available
  const imageUrl = property.images && property.images.length > 0 
    ? property.images[0] 
    : '/placeholder.svg';

  return (
    <>
      <div 
        className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative">
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              property.type === 'rent' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              For {property.type}
            </span>
          </div>
          <button
            onClick={handleHeartClick}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <Heart className={`h-5 w-5 ${isInAnyShortlist ? 'text-red-500 fill-red-500' : 'text-gray-600 hover:text-red-500'}`} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{property.title}</h3>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                €{property.price.toLocaleString()}
              </p>
              {property.type === 'rent' && (
                <p className="text-sm text-gray-500">/month</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{property.location}</span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
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
          
          <div className="flex flex-wrap gap-2 mb-4">
            {property.features && property.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {feature}
              </span>
            ))}
            {property.features && property.features.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                +{property.features.length - 3} more
              </span>
            )}
          </div>
          
          <p className="text-gray-600 text-sm line-clamp-2">{property.description}</p>
        </div>
      </div>

      <ShortlistSelectionModal
        isOpen={showShortlistModal}
        onClose={() => setShowShortlistModal(false)}
        propertyId={property.id}
      />
    </>
  );
};

export default PropertyCard;
