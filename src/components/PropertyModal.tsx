
import React from 'react';
import { X, MapPin, Bed, Bath, Square, Heart } from 'lucide-react';
import { Property } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface PropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onShortlist?: (propertyId: string) => void;
  isShortlisted?: boolean;
}

const PropertyModal: React.FC<PropertyModalProps> = ({ 
  property, 
  isOpen, 
  onClose, 
  onShortlist,
  isShortlisted 
}) => {
  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{property.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {property.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${property.title} - ${index + 1}`}
                className="w-full h-64 object-cover rounded-lg"
              />
            ))}
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    property.type === 'rent' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    For {property.type}
                  </span>
                </div>
                {onShortlist && (
                  <button
                    onClick={() => onShortlist(property.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Heart className={`h-5 w-5 ${isShortlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    <span>{isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}</span>
                  </button>
                )}
              </div>

              <div className="text-3xl font-bold text-blue-600 mb-4">
                €{property.price.toLocaleString()}
                {property.type === 'rent' && <span className="text-lg text-gray-500">/month</span>}
              </div>

              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                <span className="text-lg">{property.location}</span>
              </div>

              <div className="flex items-center space-x-6 text-gray-600 mb-6">
                <div className="flex items-center">
                  <Bed className="h-5 w-5 mr-2" />
                  <span>{property.bedrooms} bedroom{property.bedrooms !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-5 w-5 mr-2" />
                  <span>{property.bathrooms} bathroom{property.bathrooms !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center">
                  <Square className="h-5 w-5 mr-2" />
                  <span>{property.area}m²</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed mb-6">{property.description}</p>

              <h3 className="text-lg font-semibold mb-3">Features</h3>
              <div className="flex flex-wrap gap-2">
                {property.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyModal;
