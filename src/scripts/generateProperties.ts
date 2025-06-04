
import { supabase } from '@/integrations/supabase/client';

const propertyData = [
  // Rental Apartments
  {
    title: "Modern Studio in City Center",
    description: "Bright and modern studio apartment in the heart of the city. Perfect for young professionals. Recently renovated with high-end appliances and contemporary finishes.",
    price: 1200,
    type: "rent",
    location: "Downtown, Paris",
    bedrooms: 1,
    bathrooms: 1,
    area: 35,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"
    ],
    features: ["Furnished", "High-speed Internet", "Near Metro", "Air Conditioning", "Security System"]
  },
  {
    title: "Spacious 2BR Apartment with Balcony",
    description: "Beautiful two-bedroom apartment with stunning city views and a private balcony. Located in a quiet residential area with easy access to public transport.",
    price: 2100,
    type: "rent",
    location: "Marais District, Paris",
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop"
    ],
    features: ["Balcony", "Elevator", "Parking", "Near Schools", "Pet Friendly"]
  },
  {
    title: "Luxury 3BR Penthouse",
    description: "Exquisite penthouse with panoramic views, premium finishes, and access to building amenities including gym and rooftop terrace.",
    price: 4500,
    type: "rent",
    location: "16th Arrondissement, Paris",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"
    ],
    features: ["Luxury Finishes", "Gym Access", "Rooftop Terrace", "Concierge", "City Views", "Parking"]
  },

  // Shared Apartments
  {
    title: "Room in Shared 4BR Apartment",
    description: "Comfortable private room in a shared 4-bedroom apartment. Great for students and young professionals. Common areas include fully equipped kitchen and living room.",
    price: 650,
    type: "rent",
    location: "Latin Quarter, Paris",
    bedrooms: 1,
    bathrooms: 1,
    area: 20,
    images: [
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop"
    ],
    features: ["Shared Kitchen", "Shared Living Room", "WiFi Included", "Near University", "Furnished Room"]
  },
  {
    title: "Cozy Room in Artist Loft",
    description: "Unique room in a converted artist loft shared with creative professionals. High ceilings, lots of natural light, and inspiring atmosphere.",
    price: 800,
    type: "rent",
    location: "Montmartre, Paris",
    bedrooms: 1,
    bathrooms: 1,
    area: 25,
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"
    ],
    features: ["High Ceilings", "Natural Light", "Artist Community", "Shared Studio Space", "Flexible Lease"]
  },

  // Houses for Rent
  {
    title: "Charming 3BR House with Garden",
    description: "Beautiful family house with private garden, perfect for families with children. Quiet neighborhood with excellent schools nearby.",
    price: 2800,
    type: "rent",
    location: "Neuilly-sur-Seine, Paris Suburbs",
    bedrooms: 3,
    bathrooms: 2,
    area: 150,
    images: [
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop"
    ],
    features: ["Private Garden", "Parking", "Near Schools", "Quiet Neighborhood", "Pet Friendly"]
  },
  {
    title: "Modern 4BR Villa with Pool",
    description: "Contemporary villa with private swimming pool and landscaped gardens. Premium location with easy access to city center.",
    price: 5200,
    type: "rent",
    location: "Saint-Cloud, Paris Suburbs",
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop"
    ],
    features: ["Swimming Pool", "Garden", "Garage", "Security System", "Modern Design", "Terrace"]
  },

  // Properties for Sale - Apartments
  {
    title: "Investment Opportunity - 1BR Apartment",
    description: "Perfect investment property in up-and-coming neighborhood. Currently rented, excellent rental yield potential.",
    price: 285000,
    type: "sale",
    location: "Belleville, Paris",
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    images: [
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&h=600&fit=crop"
    ],
    features: ["Investment Property", "Currently Rented", "Good Transport Links", "Emerging Area"]
  },
  {
    title: "Elegant 2BR Haussmannian Apartment",
    description: "Classic Parisian apartment with original features including high ceilings, moldings, and hardwood floors. Renovated kitchen and bathroom.",
    price: 650000,
    type: "sale",
    location: "9th Arrondissement, Paris",
    bedrooms: 2,
    bathrooms: 1,
    area: 85,
    images: [
      "https://images.unsplash.com/photo-1505843490821-317a319b56c0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop"
    ],
    features: ["Original Features", "High Ceilings", "Hardwood Floors", "Recently Renovated", "Historic Building"]
  },
  {
    title: "Luxury 3BR Apartment with Terrace",
    description: "Exceptional apartment with private terrace overlooking the Seine. Premium finishes throughout and prime location.",
    price: 1250000,
    type: "sale",
    location: "7th Arrondissement, Paris",
    bedrooms: 3,
    bathrooms: 2,
    area: 110,
    images: [
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop"
    ],
    features: ["Private Terrace", "Seine Views", "Luxury Finishes", "Prime Location", "Elevator", "Concierge"]
  },

  // Houses for Sale
  {
    title: "Family Home with Large Garden",
    description: "Perfect family home with spacious rooms and large garden. Recently updated with modern amenities while maintaining character.",
    price: 450000,
    type: "sale",
    location: "Vincennes, Paris Suburbs",
    bedrooms: 4,
    bathrooms: 2,
    area: 180,
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&h=600&fit=crop"
    ],
    features: ["Large Garden", "Family Friendly", "Recently Updated", "Near Schools", "Garage", "Character Features"]
  },
  {
    title: "Modern Eco-Friendly House",
    description: "Contemporary eco-friendly home with solar panels, energy-efficient systems, and sustainable materials. Perfect for environmentally conscious buyers.",
    price: 620000,
    type: "sale",
    location: "Montreuil, Paris Suburbs",
    bedrooms: 3,
    bathrooms: 2,
    area: 140,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"
    ],
    features: ["Solar Panels", "Energy Efficient", "Sustainable Materials", "Modern Design", "Garden", "Eco-Friendly"]
  },
  {
    title: "Luxury Villa with Swimming Pool",
    description: "Stunning luxury villa with swimming pool, landscaped gardens, and premium finishes throughout. Perfect for entertaining.",
    price: 1850000,
    type: "sale",
    location: "Sceaux, Paris Suburbs",
    bedrooms: 5,
    bathrooms: 4,
    area: 280,
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop"
    ],
    features: ["Swimming Pool", "Landscaped Gardens", "Luxury Finishes", "Entertainment Areas", "Garage", "Security System"]
  },

  // Student Housing
  {
    title: "Student Studio Near Sorbonne",
    description: "Compact studio perfect for students, located within walking distance of major universities. Fully furnished with study area.",
    price: 900,
    type: "rent",
    location: "5th Arrondissement, Paris",
    bedrooms: 1,
    bathrooms: 1,
    area: 25,
    images: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop"
    ],
    features: ["Near Universities", "Furnished", "Study Area", "Student Friendly", "WiFi Included"]
  },

  // Unique Properties
  {
    title: "Artist Loft in Former Factory",
    description: "Unique loft space in converted factory building. High ceilings, industrial features, and plenty of natural light. Perfect for artists or creative professionals.",
    price: 380000,
    type: "sale",
    location: "Bagnolet, Paris Suburbs",
    bedrooms: 2,
    bathrooms: 1,
    area: 95,
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"
    ],
    features: ["Industrial Design", "High Ceilings", "Natural Light", "Unique Space", "Artist Friendly", "Open Plan"]
  }
];

export const generateProperties = async () => {
  try {
    // First, get some existing profile IDs to assign as owners
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(10);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.error('No profiles found. Please create some user profiles first.');
      return;
    }

    // Assign random owners to properties
    const propertiesWithOwners = propertyData.map(property => ({
      ...property,
      owner_id: profiles[Math.floor(Math.random() * profiles.length)].id
    }));

    // Insert properties into database
    const { data, error } = await supabase
      .from('properties')
      .insert(propertiesWithOwners)
      .select();

    if (error) {
      console.error('Error inserting properties:', error);
      return;
    }

    console.log(`Successfully generated ${data.length} property listings`);
    return data;
  } catch (error) {
    console.error('Error generating properties:', error);
  }
};
