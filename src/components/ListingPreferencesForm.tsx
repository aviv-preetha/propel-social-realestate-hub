
import React from 'react';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
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

  const handleSizeRangeChange = (values: number[]) => {
    onChange({
      ...preferences,
      minSize: values[0],
      maxSize: values[1]
    });
  };

  const handlePriceRangeChange = (values: number[]) => {
    onChange({
      ...preferences,
      minPrice: values[0],
      maxPrice: values[1]
    });
  };

  const handleLocationChange = (location: string) => {
    onChange({
      ...preferences,
      location
    });
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `€${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `€${(price / 1000).toFixed(0)}K`;
    }
    return `€${price}`;
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
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:border-blue-600"
          >
            Rent
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="sale" 
            aria-label="Buy" 
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:border-blue-600"
          >
            Buy
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Property Size (m²)</label>
        <div className="px-3">
          <Slider
            value={[preferences.minSize, preferences.maxSize]}
            onValueChange={handleSizeRangeChange}
            min={10}
            max={500}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>{preferences.minSize} m²</span>
            <span>{preferences.maxSize} m²</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Price Range</label>
        <div className="px-3">
          <Slider
            value={[preferences.minPrice, preferences.maxPrice]}
            onValueChange={handlePriceRangeChange}
            min={500}
            max={2000000}
            step={1000}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>{formatPrice(preferences.minPrice)}</span>
            <span>{formatPrice(preferences.maxPrice)}</span>
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
