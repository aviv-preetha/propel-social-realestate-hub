
import React, { useState, useEffect } from 'react';
import { Building, MapPin, Bed, Bath, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/hooks/useProperties';

interface UserPropertiesProps {
  ownerId: string;
}

const UserProperties: React.FC<UserPropertiesProps> = ({ ownerId }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProperties();
  }, [ownerId]);

  const fetchUserProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedProperties: Property[] = data.map((dbProperty) => ({
        id: dbProperty.id,
        title: dbProperty.title,
        description: dbProperty.description || '',
        price: dbProperty.price,
        type: (dbProperty.type === 'rent' || dbProperty.type === 'sale') ? dbProperty.type : 'rent',
        location: dbProperty.location,
        bedrooms: dbProperty.bedrooms || 0,
        bathrooms: dbProperty.bathrooms || 0,
        area: dbProperty.area || 0,
        images: dbProperty.images || [],
        owner_id: dbProperty.owner_id,
        features: dbProperty.features || []
      }));

      setProperties(mappedProperties);
    } catch (error) {
      console.error('Error fetching user properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
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

  if (properties.length === 0) {
    return (
      <div className="p-8 text-center">
        <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No properties listed yet</h3>
        <p className="text-gray-500">Start by adding your first property listing</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-4">
        {properties.map((property) => (
          <div key={property.id} className="flex space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
            <img
              src={property.images[0] || '/placeholder.svg'}
              alt={property.title}
              className="w-24 h-16 object-cover rounded-lg"
            />
            <div className="flex-1 text-left">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">{property.title}</h4>
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
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600 mb-1">
                    {formatPrice(property.price)}
                    {property.type === 'rent' && <span className="text-sm text-gray-500">/month</span>}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    property.type === 'rent' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    For {property.type === 'rent' ? 'Rent' : 'Sale'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProperties;
