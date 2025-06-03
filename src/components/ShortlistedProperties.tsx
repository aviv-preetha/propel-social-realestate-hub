
import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Bed, Bath, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProperties, Property } from '@/hooks/useProperties';
import { useProfile } from '@/hooks/useProfile';
import PropertyModal from './PropertyModal';

const ShortlistedProperties: React.FC = () => {
  const { properties, shortlistedProperties, toggleShortlist } = useProperties();
  const { profile } = useProfile();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [shortlistedProperties]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Get the actual property objects for shortlisted property IDs
  const shortlistedPropertyObjects = properties.filter(property => 
    shortlistedProperties.includes(property.id)
  );

  const handleRemoveFromShortlist = async (propertyId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await toggleShortlist(propertyId);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex space-x-4">
                <div className="w-24 h-16 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (shortlistedPropertyObjects.length === 0) {
    return (
      <div className="p-8 text-center">
        <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No shortlisted properties yet</h3>
        <p className="text-gray-500">Start browsing properties and add them to your shortlist</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="space-y-4">
          {shortlistedPropertyObjects.map((property) => (
            <div key={property.id} className="flex space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <img
                src={property.images[0] || '/placeholder.svg'}
                alt={property.title}
                className="w-24 h-16 object-cover rounded-lg cursor-pointer"
                onClick={() => setSelectedProperty(property)}
              />
              <div className="flex-1 text-left">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 
                      className="font-medium text-gray-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => setSelectedProperty(property)}
                    >
                      {property.title}
                    </h4>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        <span>{property.bedrooms} bed</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        <span>{property.bathrooms} bath</span>
                      </div>
                      <div className="flex items-center">
                        <Square className="h-4 w-4 mr-1" />
                        <span>{property.area} sqft</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="text-lg font-bold text-blue-600 mb-1">
                      {formatPrice(property.price)}
                      {property.type === 'rent' && <span className="text-sm text-gray-500">/month</span>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        property.type === 'rent' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        For {property.type === 'rent' ? 'Rent' : 'Sale'}
                      </span>
                      <button
                        onClick={(e) => handleRemoveFromShortlist(property.id, e)}
                        className="p-1 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove from shortlist"
                      >
                        <Heart className="h-4 w-4" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          isOpen={!!selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </>
  );
};

export default ShortlistedProperties;
