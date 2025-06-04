
import React, { useState } from 'react';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { FormItem, FormLabel, FormControl } from './ui/form';

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
  const [sizeRange, setSizeRange] = useState([preferences.minSize, preferences.maxSize]);
  const [priceRange, setPriceRange] = useState([preferences.minPrice, preferences.maxPrice]);

  const handleTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked 
      ? [...preferences.types, type]
      : preferences.types.filter(t => t !== type);
    
    onChange({
      ...preferences,
      types: newTypes
    });
  };

  const handleSizeRangeChange = (values: number[]) => {
    setSizeRange(values);
    onChange({
      ...preferences,
      minSize: values[0],
      maxSize: values[1]
    });
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
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
      <FormItem>
        <FormLabel>Property Type</FormLabel>
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rent"
              checked={preferences.types.includes('rent')}
              onCheckedChange={(checked) => handleTypeChange('rent', checked as boolean)}
            />
            <label htmlFor="rent" className="text-sm font-medium">For Rent</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sale"
              checked={preferences.types.includes('sale')}
              onCheckedChange={(checked) => handleTypeChange('sale', checked as boolean)}
            />
            <label htmlFor="sale" className="text-sm font-medium">For Sale</label>
          </div>
        </div>
      </FormItem>

      <FormItem>
        <FormLabel>Property Size (m²)</FormLabel>
        <div className="px-3">
          <Slider
            value={sizeRange}
            onValueChange={handleSizeRangeChange}
            min={10}
            max={500}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>{sizeRange[0]} m²</span>
            <span>{sizeRange[1]} m²</span>
          </div>
        </div>
      </FormItem>

      <FormItem>
        <FormLabel>Price Range</FormLabel>
        <div className="px-3">
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            min={500}
            max={2000000}
            step={1000}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </FormItem>

      <FormItem>
        <FormLabel>Preferred Location</FormLabel>
        <FormControl>
          <Input
            type="text"
            value={preferences.location}
            onChange={(e) => handleLocationChange(e.target.value)}
            placeholder="e.g., Paris, London, New York..."
            className="w-full"
          />
        </FormControl>
      </FormItem>
    </div>
  );
};

export default ListingPreferencesForm;
