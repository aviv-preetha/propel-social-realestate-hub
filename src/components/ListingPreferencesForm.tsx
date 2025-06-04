
import React from 'react';
import { Input } from './ui/input';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

interface ListingPreferences {
  types: string[];
  minSize: number;
  maxSize: number;
  minPrice: number;
  maxPrice: number;
  location: string;
}

interface ListingPreferencesFormProps {
  preferences: ListingPreferences;
  onChange: (preferences: ListingPreferences) => void;
}

const ListingPreferencesForm: React.FC<ListingPreferencesFormProps> = ({
  preferences,
  onChange
}) => {
  const handleTypeChange = (types: string[]) => {
    onChange({
      ...preferences,
      types
    });
  };

  const handleMinSizeChange = (value: string) => {
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    onChange({
      ...preferences,
      minSize: numValue
    });
  };

  const handleMaxSizeChange = (value: string) => {
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    onChange({
      ...preferences,
      maxSize: numValue
    });
  };

  const handleMinPriceChange = (value: string) => {
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    onChange({
      ...preferences,
      minPrice: numValue
    });
  };

  const handleMaxPriceChange = (value: string) => {
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    onChange({
      ...preferences,
      maxPrice: numValue
    });
  };

  const handleLocationChange = (location: string) => {
    onChange({
      ...preferences,
      location
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Property Type</label>
        <ToggleGroup 
          type="multiple" 
          value={preferences.types}
          onValueChange={handleTypeChange}
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

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Property Size (m²)</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Min Size</label>
            <Input
              type="number"
              value={preferences.minSize === 0 ? '' : preferences.minSize}
              onChange={(e) => handleMinSizeChange(e.target.value)}
              placeholder="Min m²"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Max Size</label>
            <Input
              type="number"
              value={preferences.maxSize === 0 ? '' : preferences.maxSize}
              onChange={(e) => handleMaxSizeChange(e.target.value)}
              placeholder="Max m²"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Price Range (€)</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Min Price</label>
            <Input
              type="number"
              value={preferences.minPrice === 0 ? '' : preferences.minPrice}
              onChange={(e) => handleMinPriceChange(e.target.value)}
              placeholder="Min €"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Max Price</label>
            <Input
              type="number"
              value={preferences.maxPrice === 0 ? '' : preferences.maxPrice}
              onChange={(e) => handleMaxPriceChange(e.target.value)}
              placeholder="Max €"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Preferred Location</label>
        <Input
          type="text"
          value={preferences.location}
          onChange={(e) => handleLocationChange(e.target.value)}
          placeholder="e.g., Paris, London, New York..."
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ListingPreferencesForm;
