
import React from 'react';
import { Crown, Search, Building } from 'lucide-react';

interface AvatarWithBadgeProps {
  src: string;
  alt: string;
  badge: 'owner' | 'seeker' | 'business';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AvatarWithBadge: React.FC<AvatarWithBadgeProps> = ({
  src,
  alt,
  badge,
  size = 'md',
  className = '',
}) => {
  const badgeConfig = {
    owner: {
      icon: Crown,
      className: 'bg-amber-500 text-white'
    },
    seeker: {
      icon: Search,
      className: 'bg-green-500 text-white'
    },
    business: {
      icon: Building,
      className: 'bg-blue-500 text-white'
    }
  };

  const sizeConfig = {
    sm: {
      avatar: 'w-8 h-8',
      badge: 'w-5 h-5 -bottom-1 -right-1',
      icon: 'w-2.5 h-2.5'
    },
    md: {
      avatar: 'w-12 h-12',
      badge: 'w-6 h-6 -bottom-1 -right-1',
      icon: 'w-3 h-3'
    },
    lg: {
      avatar: 'w-16 h-16',
      badge: 'w-8 h-8 -bottom-2 -right-2',
      icon: 'w-4 h-4'
    }
  };

  const config = badgeConfig[badge];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div className={`relative inline-block ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`${sizes.avatar} rounded-full object-cover border-2 border-white`}
      />
      <div
        className={`absolute ${sizes.badge} ${config.className} rounded-full flex items-center justify-center border-2 border-white shadow-sm`}
      >
        <Icon className={sizes.icon} />
      </div>
    </div>
  );
};

export default AvatarWithBadge;
