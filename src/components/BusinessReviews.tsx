
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Star, MessageCircle } from 'lucide-react';
import StarRating from './StarRating';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  rater: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

interface BusinessReviewsProps {
  businessId: string;
}

const BusinessReviews: React.FC<BusinessReviewsProps> = ({ businessId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [businessId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('business_ratings')
        .select(`
          id,
          rating,
          comment,
          created_at,
          rater:profiles!business_ratings_rater_id_fkey (
            id,
            name,
            avatar_url
          )
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="p-8 text-center">
        <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No reviews yet</h3>
        <p className="text-gray-500">Be the first to receive a review from your customers!</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
            <div className="flex items-start space-x-4">
              <img
                src={review.rater.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.rater.name}`}
                alt={review.rater.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 text-left">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900 text-left">{review.rater.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <StarRating rating={review.rating} readonly size="sm" />
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-700 leading-relaxed text-left">{review.comment}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessReviews;
