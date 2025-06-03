
import React from 'react';
import { Crown, Search, Building } from 'lucide-react';

interface UserBadgeProps {
  badge: 'owner' | 'seeker' | 'business';
  size?: 'sm' | 'md';
}

const UserBadge: React.FC<UserBadgeProps> = ({ badge, size = 'sm' }) => {
  const badgeConfig = {
    owner: {
      icon: Crown,
      label: 'Owner',
      className: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    seeker: {
      icon: Search,
      label: 'Seeker',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    business: {
      icon: Building,
      label: 'Business',
      className: 'bg-blue-100 text-blue-800 border-blue-200'
    }
  };

  const config = badgeConfig[badge];
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${config.className} ${sizeClasses}`}>
      <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`} />
      {config.label}
    </span>
  );
};

export default UserBadge;
