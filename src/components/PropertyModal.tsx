
import React, { useState } from 'react';
import { X, MapPin, Bed, Bath, Square, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import ShortlistSelectionModal from './ShortlistSelectionModal';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'rent' | 'sale';
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  owner_id: string;
  features: string[];
}

interface PropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

const PropertyModal: React.FC<PropertyModalProps> = ({ 
  property, 
  isOpen, 
  onClose
}) => {
  const [showShortlistModal, setShowShortlistModal] = useState(false);

  if (!property) return null;

  // Use a placeholder image if no images are available
  const propertyImages = property.images && property.images.length > 0 
    ? property.images 
    : ['/placeholder.svg'];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{property.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Image Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {propertyImages.map((image, index) => (
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
                  <Button
                    onClick={() => setShowShortlistModal(true)}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Heart className="h-5 w-5" />
                    <span>Add to shortlist</span>
                  </Button>
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

      <ShortlistSelectionModal
        isOpen={showShortlistModal}
        onClose={() => setShowShortlistModal(false)}
        propertyId={property?.id || ''}
      />
    </>
  );
};

export default PropertyModal;
