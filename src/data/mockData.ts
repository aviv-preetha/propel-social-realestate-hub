
import { User, Property, Post } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Marie Dubois',
    email: 'marie@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
    description: 'Experienced real estate agent specializing in luxury properties in Paris',
    badge: 'business',
    location: 'Paris, France',
    connections: ['2', '3'],
    shortlistedProperties: []
  },
  {
    id: '2',
    name: 'Pierre Martin',
    email: 'pierre@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    description: 'Property owner with multiple apartments for rent in Lyon',
    badge: 'owner',
    location: 'Lyon, France',
    listingPreference: 'Rent out properties',
    connections: ['1'],
    shortlistedProperties: []
  },
  {
    id: '3',
    name: 'Sophie Laurent',
    email: 'sophie@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    description: 'Looking for a cozy apartment in Marseille for my family',
    badge: 'seeker',
    location: 'Marseille, France',
    listingPreference: '2-3 bedrooms, near schools',
    connections: ['1'],
    shortlistedProperties: ['1', '3']
  },
  {
    id: '4',
    name: 'Thomas Rousseau',
    email: 'thomas@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    description: 'Real estate developer focusing on sustainable housing',
    badge: 'business',
    location: 'Nice, France',
    connections: [],
    shortlistedProperties: []
  }
];

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Charming 2BR Apartment in Montmartre',
    description: 'Beautiful apartment with stunning views of Paris. Recently renovated with modern amenities while maintaining classic Parisian charm.',
    price: 2800,
    type: 'rent',
    location: 'Montmartre, Paris',
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    images: [
      'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop'
    ],
    owner_id: '2',
    features: ['Balcony', 'Elevator', 'Pet Friendly', 'Furnished']
  },
  {
    id: '2',
    title: 'Luxury Villa for Sale in Cannes',
    description: 'Stunning villa with panoramic sea views, private pool, and premium finishes throughout.',
    price: 1250000,
    type: 'sale',
    location: 'Cannes, French Riviera',
    bedrooms: 4,
    bathrooms: 3,
    area: 280,
    images: [
      'https://images.unsplash.com/photo-1524230572899-a752b3835840?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=800&h=600&fit=crop'
    ],
    owner_id: '1',
    features: ['Pool', 'Sea View', 'Garden', 'Garage', 'Security System']
  },
  {
    id: '3',
    title: 'Modern Studio in Lyon Center',
    description: 'Bright and modern studio apartment in the heart of Lyon, perfect for young professionals.',
    price: 890,
    type: 'rent',
    location: 'Lyon Center, Lyon',
    bedrooms: 1,
    bathrooms: 1,
    area: 35,
    images: [
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&h=600&fit=crop'
    ],
    owner_id: '2',
    features: ['Furnished', 'High-speed Internet', 'Near Metro']
  },
  {
    id: '4',
    title: 'Family House with Garden in Bordeaux',
    description: 'Spacious family home with large garden, perfect for families with children.',
    price: 485000,
    type: 'sale',
    location: 'Bordeaux, France',
    bedrooms: 4,
    bathrooms: 2,
    area: 180,
    images: [
      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop'
    ],
    owner_id: '4',
    features: ['Garden', 'Garage', 'Near Schools', 'Quiet Neighborhood']
  }
];

export const mockPosts: Post[] = [
  {
    id: '1',
    userId: '1',
    content: 'Just listed this beautiful apartment in Montmartre! Perfect for those looking for authentic Parisian living. The views from the balcony are absolutely breathtaking. 🏠✨',
    images: ['https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop'],
    propertyId: '1',
    timestamp: new Date('2024-06-01T10:30:00'),
    likes: ['2', '3'],
    comments: [
      {
        id: '1',
        userId: '3',
        content: 'This looks amazing! Is it still available?',
        timestamp: new Date('2024-06-01T11:00:00')
      }
    ]
  },
  {
    id: '2',
    userId: '2',
    content: 'The French real estate market is showing interesting trends this quarter. As a property owner, I\'m seeing increased demand for sustainable and energy-efficient homes. What are your thoughts? 📈',
    timestamp: new Date('2024-06-02T14:15:00'),
    likes: ['1', '4'],
    comments: [
      {
        id: '2',
        userId: '1',
        content: 'Absolutely agree! Buyers are becoming more conscious about energy efficiency.',
        timestamp: new Date('2024-06-02T15:00:00')
      }
    ]
  },
  {
    id: '3',
    userId: '4',
    content: 'Excited to announce our new sustainable housing project in Nice! We\'re incorporating the latest green technologies and eco-friendly materials. Building the future of real estate! 🌱🏗️',
    images: ['https://images.unsplash.com/photo-1524230572899-a752b3835840?w=800&h=600&fit=crop'],
    timestamp: new Date('2024-06-03T09:45:00'),
    likes: ['1', '2', '3'],
    comments: []
  }
];
