import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Heart, Building, Bed, Bath, Square, Settings, ChevronDown } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import PropertyModal from './PropertyModal';
import PropertyCard from './PropertyCard';

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
  const { properties, loading } = useProperties();
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [filteredProperties, setFilteredProperties] = useState(properties);
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
      setFiltersOpen(false);
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

  const hasFilteredResults = filteredProperties.length > 0;
  const showRecommendations = hasFilteredResults || filteredProperties.length === 0;

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
            
            {/* Filters Popup Button */}
            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-6" align="end">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                  </div>

                  {/* Search and Location Row */}
                  <div className="grid grid-cols-1 gap-4">
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
                      <Button
                        onClick={saveFiltersAsPreferences}
                        className="flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        Save as My Preferences
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {hasFilteredResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onPropertyClick={setSelectedProperty}
            />
          ))}
        </div>
      )}

      {/* Separator and Recommendations */}
      {hasFilteredResults && showRecommendations && (
        <>
          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <div className="bg-blue-50 rounded-xl border border-blue-200 px-6 py-4">
              <div className="text-center">
                <Building className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <h3 className="text-md font-medium text-blue-900 mb-1">More recommendations for you:</h3>
              </div>
            </div>
            <Separator className="flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onPropertyClick={setSelectedProperty}
              />
            ))}
          </div>
        </>
      )}

      {/* No properties found case */}
      {!hasFilteredResults && properties.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No properties found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}

      {/* No filtered results but properties exist - show recommendations only */}
      {!hasFilteredResults && properties.length > 0 && (
        <>
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <div className="text-center">
              <Building className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-blue-900 mb-1">Nothing specific found for user preferences.</h3>
              <p className="text-blue-700">Here are some recommendations:</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onPropertyClick={setSelectedProperty}
              />
            ))}
          </div>
        </>
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
