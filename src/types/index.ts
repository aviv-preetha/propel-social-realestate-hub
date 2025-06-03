
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  description: string;
  badge: 'owner' | 'seeker' | 'business';
  location: string;
  listingPreference?: string;
  connections: string[];
  shortlistedProperties: string[];
}

export interface Property {
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
  owner_id: string; // Changed from ownerId to match database
  features: string[];
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  images?: string[];
  propertyId?: string;
  timestamp: Date;
  likes: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
}

export interface BusinessRating {
  id: string;
  businessId: string;
  userId: string;
  rating: number;
  review: string;
  timestamp: Date;
}
