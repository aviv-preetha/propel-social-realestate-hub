
import React from 'react';
import { MessageSquare, Users } from 'lucide-react';
import UserBadge from './UserBadge';
import StarRating from './StarRating';
import { useBusinessRatings } from '@/hooks/useBusinessRatings';

interface Connection {
  id: string;
  name: string;
  avatar_url?: string;
  badge: 'owner' | 'seeker' | 'business';
  location?: string;
  description?: string;
}

interface UserConnectionsProps {
  connections: Connection[];
}

const UserConnections: React.FC<UserConnectionsProps> = ({ connections }) => {
  const { getRatingStats } = useBusinessRatings();

  if (connections.length === 0) {
    return (
      <div className="p-8 text-center">
        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No connections yet</h3>
        <p className="text-gray-500">Start connecting with people in the real estate industry</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-4">
        {connections.map((connection) => {
          const ratingStats = connection.badge === 'business' ? getRatingStats(connection.id) : null;
          
          return (
            <div key={connection.id} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <img
                src={connection.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${connection.name}`}
                alt={connection.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 text-left">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-gray-900 text-left">{connection.name}</h4>
                  <UserBadge badge={connection.badge} size="sm" />
                </div>
                {ratingStats && ratingStats.totalRatings > 0 && (
                  <div className="flex items-center space-x-1 mb-1">
                    <StarRating rating={ratingStats.averageRating} readonly size="sm" />
                    <span className="text-xs text-gray-500">({ratingStats.totalRatings})</span>
                  </div>
                )}
                {connection.location && (
                  <p className="text-sm text-gray-600 mb-1 text-left">{connection.location}</p>
                )}
                {connection.description && (
                  <p className="text-sm text-gray-700 text-left">{connection.description}</p>
                )}
              </div>
              <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                <MessageSquare className="h-4 w-4" />
                <span>Message</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserConnections;
