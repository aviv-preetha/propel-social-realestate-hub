
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { useToast } from '@/hooks/use-toast';

export interface DatabaseProperty {
  id: string;
  title: string;
  description: string | null;
  price: number;
  type: string;
  location: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  images: string[] | null;
  owner_id: string;
  features: string[] | null;
  created_at: string | null;
  updated_at: string | null;
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
  owner_id: string;
  features: string[];
}

export function useProperties() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const mapDatabasePropertyToProperty = (dbProperty: DatabaseProperty): Property => ({
    id: dbProperty.id,
    title: dbProperty.title,
    description: dbProperty.description || '',
    price: dbProperty.price,
    type: (dbProperty.type === 'rent' || dbProperty.type === 'sale') ? dbProperty.type : 'rent',
    location: dbProperty.location,
    bedrooms: dbProperty.bedrooms || 0,
    bathrooms: dbProperty.bathrooms || 0,
    area: dbProperty.area || 0,
    images: dbProperty.images || [],
    owner_id: dbProperty.owner_id,
    features: dbProperty.features || []
  });

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedProperties = data.map(mapDatabasePropertyToProperty);
      setProperties(mappedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error",
        description: "Failed to fetch properties",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchProperties();
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    properties,
    loading,
    refetch: fetchProperties
  };
}
