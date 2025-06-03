
import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Heart, Building, Bed, Bath, Square } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { useProfile } from '@/hooks/useProfile';
import PropertyModal from './PropertyModal';

const Properties: React.FC = () => {
  const { properties, loading, toggleShortlist, isShortlisted } = useProperties();
  const { profile } = useProfile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [filteredProperties, setFilteredProperties] = useState(properties);

  useEffect(() => {
    let filtered = properties;

    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(property => property.type === selectedType);
    }

    setFilteredProperties(filtered);
  }, [properties, searchTerm, selectedType]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const isBusiness = profile?.badge === 'business';

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
            <p className="text-gray-600">Discover your next home</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Types</option>
                <option value="rent">For Rent</option>
                <option value="sale">For Sale</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No properties found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={property.images[0] || '/placeholder.svg'}
                  alt={property.title}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => setSelectedProperty(property)}
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    property.type === 'rent' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    For {property.type === 'rent' ? 'Rent' : 'Sale'}
                  </span>
                </div>
                {!isBusiness && (
                  <button
                    onClick={() => toggleShortlist(property.id)}
                    className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                      isShortlisted(property.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <Heart className="h-4 w-4" fill={isShortlisted(property.id) ? 'currentColor' : 'none'} />
                  </button>
                )}
              </div>
              
              <div className="p-6">
                <h3 
                  className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => setSelectedProperty(property)}
                >
                  {property.title}
                </h3>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{property.location}</span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPrice(property.price)}
                    {property.type === 'rent' && <span className="text-sm text-gray-500">/month</span>}
                  </div>
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
            </div>
          ))}
        </div>
      )}

      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          isOpen={!!selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
};

export default Properties;
