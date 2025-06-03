
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { mockProperties } from '../data/mockData';
import PropertyCard from './PropertyCard';
import PropertyModal from './PropertyModal';
import { Property } from '../types';

const Properties: React.FC = () => {
  const [properties] = useState(mockProperties);
  const [filter, setFilter] = useState<'all' | 'rent' | 'sale'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [shortlistedProperties, setShortlistedProperties] = useState<string[]>([]);

  const filteredProperties = properties.filter(property => {
    const matchesFilter = filter === 'all' || property.type === filter;
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleShortlist = (propertyId: string) => {
    setShortlistedProperties(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      } else {
        return [...prev, propertyId];
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Listings</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('rent')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'rent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              For Rent
            </button>
            <button
              onClick={() => setFilter('sale')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'sale'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              For Sale
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onShortlist={handleShortlist}
            onPropertyClick={handlePropertyClick}
            isShortlisted={shortlistedProperties.includes(property.id)}
          />
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No properties found matching your criteria.</p>
        </div>
      )}

      <PropertyModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onShortlist={handleShortlist}
        isShortlisted={selectedProperty ? shortlistedProperties.includes(selectedProperty.id) : false}
      />
    </div>
  );
};

export default Properties;
