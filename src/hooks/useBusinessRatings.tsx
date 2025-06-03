
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BusinessRating {
  id: string;
  rater_id: string;
  business_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

interface BusinessRatingStats {
  averageRating: number;
  totalRatings: number;
}

export function useBusinessRatings() {
  const [ratings, setRatings] = useState<Record<string, BusinessRatingStats>>({});
  const [loading, setLoading] = useState(false);

  const fetchBusinessRatings = async (businessIds: string[]) => {
    if (businessIds.length === 0) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_ratings')
        .select('business_id, rating')
        .in('business_id', businessIds);

      if (error) throw error;

      // Calculate average ratings for each business
      const ratingsMap: Record<string, BusinessRatingStats> = {};
      
      businessIds.forEach(id => {
        const businessRatings = data?.filter(r => r.business_id === id) || [];
        const totalRatings = businessRatings.length;
        const averageRating = totalRatings > 0 
          ? businessRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
          : 0;
        
        ratingsMap[id] = {
          averageRating,
          totalRatings
        };
      });

      setRatings(ratingsMap);
    } catch (error) {
      console.error('Error fetching business ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserRatingForBusiness = async (businessId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return null;

      const { data, error } = await supabase
        .from('business_ratings')
        .select('rating')
        .eq('rater_id', profile.id)
        .eq('business_id', businessId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.rating || 0;
    } catch (error) {
      console.error('Error fetching user rating:', error);
      return 0;
    }
  };

  const getRatingStats = (businessId: string): BusinessRatingStats => {
    return ratings[businessId] || { averageRating: 0, totalRatings: 0 };
  };

  return {
    ratings,
    loading,
    fetchBusinessRatings,
    getUserRatingForBusiness,
    getRatingStats,
    refetchRatings: () => fetchBusinessRatings(Object.keys(ratings))
  };
}
