
import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating?: number;
  onRatingSelect?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  onRatingSelect,
  readonly = false,
  size = 'md',
  showNumber = false
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingSelect) {
      onRatingSelect(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (!readonly) {
      setHoverRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center" onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= displayRating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:text-yellow-400'
            } transition-colors`}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
          />
        ))}
      </div>
      {showNumber && rating > 0 && (
        <span className="text-sm text-gray-600">({rating.toFixed(1)})</span>
      )}
    </div>
  );
};

export default StarRating;
