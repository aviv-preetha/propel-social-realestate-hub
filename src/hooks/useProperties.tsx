
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
  const [shortlistedProperties, setShortlistedProperties] = useState<string[]>([]);
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

  const fetchShortlistedProperties = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('shortlist_properties')
        .select('property_id')
        .eq('added_by', profile.id);

      if (error) throw error;

      setShortlistedProperties(data.map(item => item.property_id));
    } catch (error) {
      console.error('Error fetching shortlisted properties:', error);
    }
  };

  const toggleShortlist = async (propertyId: string) => {
    if (!profile?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to shortlist properties",
        variant: "destructive",
      });
      return;
    }

    try {
      const isCurrentlyShortlisted = shortlistedProperties.includes(propertyId);

      if (isCurrentlyShortlisted) {
        const { error } = await supabase
          .from('shortlist_properties')
          .delete()
          .eq('added_by', profile.id)
          .eq('property_id', propertyId);

        if (error) throw error;

        setShortlistedProperties(prev => prev.filter(id => id !== propertyId));
        toast({
          title: "Removed from shortlist",
          description: "Property has been removed from your shortlist",
        });
      } else {
        // Find user's first shortlist or create a default one
        const { data: shortlists, error: shortlistError } = await supabase
          .from('shortlists')
          .select('id')
          .eq('user_id', profile.id)
          .limit(1);

        if (shortlistError) throw shortlistError;

        let shortlistId;
        if (shortlists && shortlists.length > 0) {
          shortlistId = shortlists[0].id;
        } else {
          // Create a default shortlist if none exists
          const { data: newShortlist, error: createError } = await supabase
            .from('shortlists')
            .insert({
              name: 'My Shortlist',
              user_id: profile.id
            })
            .select('id')
            .single();

          if (createError) throw createError;
          shortlistId = newShortlist.id;
        }

        const { error } = await supabase
          .from('shortlist_properties')
          .insert({
            shortlist_id: shortlistId,
            property_id: propertyId,
            added_by: profile.id
          });

        if (error) throw error;

        setShortlistedProperties(prev => [...prev, propertyId]);
        toast({
          title: "Added to shortlist",
          description: "Property has been added to your shortlist",
        });
      }
    } catch (error) {
      console.error('Error toggling shortlist:', error);
      toast({
        title: "Error",
        description: "Failed to update shortlist",
        variant: "destructive",
      });
    }
  };

  const isShortlisted = (propertyId: string) => {
    return shortlistedProperties.includes(propertyId);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchProperties();
      if (profile?.id) {
        await fetchShortlistedProperties();
      }
      setLoading(false);
    };

    loadData();
  }, [profile?.id]);

  return {
    properties,
    shortlistedProperties,
    loading,
    toggleShortlist,
    isShortlisted,
    refetch: fetchProperties
  };
}
