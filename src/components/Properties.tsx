
import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Heart, Building, Bed, Bath, Square, Settings, ChevronDown } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import PropertyModal from './PropertyModal';

interface PropertyFilters {
  searchTerm: string;
  types: string[];
  minPrice: number;
  maxPrice: number;
  minSize: number;
  maxSize: number;
  location: string;
}

const Properties: React.FC = () => {
  const { properties, loading, toggleShortlist, isShortlisted } = useProperties();
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [filteredProperties, setFilteredProperties] = useState(properties);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Initialize filters with user preferences
  const initializeFilters = (): PropertyFilters => {
    const isSeeker = profile?.badge === 'seeker';
    let userPreferences = null;
    
    if (isSeeker && profile?.listing_preference) {
      try {
        const parsed = JSON.parse(profile.listing_preference);
        if (parsed.types || parsed.minSize !== undefined) {
          userPreferences = parsed;
        }
      } catch {
        // Ignore parse errors
      }
    }

    return {
      searchTerm: '',
      types: userPreferences?.types || [],
      minPrice: userPreferences?.minPrice || 0,
      maxPrice: userPreferences?.maxPrice || 0,
      minSize: userPreferences?.minSize || 0,
      maxSize: userPreferences?.maxSize || 0,
      location: userPreferences?.location || '',
    };
  };

  const [filters, setFilters] = useState<PropertyFilters>(initializeFilters());

  // Update filters when profile changes
  useEffect(() => {
    setFilters(initializeFilters());
  }, [profile]);

  useEffect(() => {
    let filtered = properties;

    // Search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filters.types.length > 0) {
      filtered = filtered.filter(property => filters.types.includes(property.type));
    }

    // Price filter
    if (filters.minPrice > 0) {
      filtered = filtered.filter(property => property.price >= filters.minPrice);
    }
    if (filters.maxPrice > 0) {
      filtered = filtered.filter(property => property.price <= filters.maxPrice);
    }

    // Size filter
    if (filters.minSize > 0) {
      filtered = filtered.filter(property => property.area >= filters.minSize);
    }
    if (filters.maxSize > 0) {
      filtered = filtered.filter(property => property.area <= filters.maxSize);
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(property =>
        property.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredProperties(filtered);
    setShowRecommendations(filtered.length === 0 && properties.length > 0);
  }, [properties, filters]);

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const saveFiltersAsPreferences = async () => {
    if (!profile || profile.badge !== 'seeker') return;

    const preferences = {
      types: filters.types,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minSize: filters.minSize,
      maxSize: filters.maxSize,
      location: filters.location,
    };

    try {
      await updateProfile({ listing_preference: JSON.stringify(preferences) });
      toast({
        title: "Success!",
        description: "Your listing preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update listing preferences.",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const isBusiness = profile?.badge === 'business';
  const isSeeker = profile?.badge === 'seeker';

  const displayProperties = showRecommendations ? properties : filteredProperties;

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
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
              <p className="text-gray-600">Discover your next home</p>
            </div>
          </div>

          {/* Collapsible Filters Section */}
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors w-full">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-6 pt-4">
              {/* Search and Location Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Properties</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search properties..."
                      value={filters.searchTerm}
                      onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <Input
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="Enter location..."
                  />
                </div>
              </div>

              {/* Property Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <ToggleGroup 
                  type="multiple" 
                  value={filters.types}
                  onValueChange={(types) => setFilters(prev => ({ ...prev, types }))}
                  className="justify-start"
                >
                  <ToggleGroupItem 
                    value="rent" 
                    aria-label="Rent" 
                    className="px-4 py-2 border border-gray-400 bg-white text-gray-800 hover:bg-gray-100 data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:border-blue-600 font-medium"
                  >
                    Rent
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="sale" 
                    aria-label="Buy" 
                    className="px-4 py-2 border border-gray-400 bg-white text-gray-800 hover:bg-gray-100 data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:border-blue-600 font-medium"
                  >
                    Buy
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range ($)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                    <Input
                      type="number"
                      value={filters.minPrice === 0 ? '' : filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                      placeholder="Min $"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Max Price</label>
                    <Input
                      type="number"
                      value={filters.maxPrice === 0 ? '' : filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                      placeholder="Max $"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Size Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Size (m²)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Min Size</label>
                    <Input
                      type="number"
                      value={filters.minSize === 0 ? '' : filters.minSize}
                      onChange={(e) => handleFilterChange('minSize', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                      placeholder="Min m²"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Max Size</label>
                    <Input
                      type="number"
                      value={filters.maxSize === 0 ? '' : filters.maxSize}
                      onChange={(e) => handleFilterChange('maxSize', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                      placeholder="Max m²"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Save Preferences Button for Seekers */}
              {isSeeker && (
                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={saveFiltersAsPreferences}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Save as My Preferences
                  </button>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Results Section */}
      {showRecommendations && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <div className="text-center">
            <Building className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-blue-900 mb-1">Nothing specific found for user preferences.</h3>
            <p className="text-blue-700">Here are some recommendations:</p>
          </div>
        </div>
      )}

      {displayProperties.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No properties found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProperties.map((property) => (
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
                    <span>{property.area} m²</span>
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
