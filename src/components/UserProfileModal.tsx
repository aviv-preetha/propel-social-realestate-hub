
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, MessageCircle, Star, Check, Clock, MapPin } from 'lucide-react';
import UserBadge from './UserBadge';
import StarRating from './StarRating';
import { useConnections } from '@/hooks/useConnections';
import { useBusinessRatings } from '@/hooks/useBusinessRatings';
import { useProfile } from '@/hooks/useProfile';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user }) => {
  const { profile } = useProfile();
  const { 
    connections, 
    connect, 
    acceptConnection, 
    disconnect, 
    getConnectionStatus, 
    getPendingConnectionId 
  } = useConnections();
  const { getRatingStats } = useBusinessRatings();
  const [mutualConnections, setMutualConnections] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && profile && user) {
      // Find mutual connections
      const mutual = connections.filter(connection => 
        connection.id !== user.id && connection.id !== profile.id
      );
      setMutualConnections(mutual.slice(0, 3)); // Show max 3 mutual connections
    }
  }, [isOpen, connections, user?.id, profile]);

  // Handle the case where user is not provided
  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-left">User Profile</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="text-gray-500">No user data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const ratingStats = user.badge === 'business' ? getRatingStats(user.id) : null;

  const renderConnectionButton = () => {
    const status = getConnectionStatus(user.id);
    
    switch (status) {
      case 'connected':
        return (
          <Button
            onClick={() => disconnect(user.id)}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Disconnect
          </Button>
        );
      
      case 'pending':
        return (
          <Button disabled variant="outline" className="cursor-not-allowed">
            <Clock className="h-4 w-4 mr-2" />
            Pending
          </Button>
        );
      
      case 'received':
        return (
          <Button
            onClick={() => {
              const connectionId = getPendingConnectionId(user.id);
              if (connectionId) acceptConnection(connectionId);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="h-4 w-4 mr-2" />
            Accept Request
          </Button>
        );
      
      default:
        return (
          <Button
            onClick={() => connect(user.id)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Connect
          </Button>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left">User Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Header */}
          <div className="flex items-start space-x-4">
            <img
              src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <UserBadge badge={user.badge} />
              </div>
              
              {ratingStats && ratingStats.totalRatings > 0 && (
                <div className="flex items-center space-x-1 mb-2">
                  <StarRating rating={ratingStats.averageRating} readonly size="sm" />
                  <span className="text-sm text-gray-500">({ratingStats.totalRatings} reviews)</span>
                </div>
              )}
              
              {user.location && (
                <div className="flex items-center space-x-1 mb-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{user.location}</span>
                </div>
              )}
              
              {user.description && (
                <p className="text-gray-700 mb-3">{user.description}</p>
              )}
              
              <div className="flex space-x-2">
                {renderConnectionButton()}
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </div>

          {/* Mutual Connections */}
          {mutualConnections.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {mutualConnections.length} mutual connection{mutualConnections.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex space-x-2">
                {mutualConnections.map((connection) => (
                  <div key={connection.id} className="flex items-center space-x-1">
                    <img
                      src={connection.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${connection.name}`}
                      alt={connection.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs text-gray-600">{connection.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
