
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, AtSign } from 'lucide-react';
import { useProfileData } from '@/hooks/useProfileData';
import { Notification } from '@/hooks/useNotifications';
import AvatarWithBadge from './AvatarWithBadge';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onPostClick: (postId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onPostClick,
}) => {
  const { profile } = useProfileData(notification.related_user_id);
  console.log('related_user_id - ',notification.related_user_id);
  console.log('profile - ',profile);
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'mention':
        return <AtSign className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getNotificationText = () => {
    if (!profile) return '';
    
    switch (notification.type) {
      case 'like':
        return `${profile.name} liked your post`;
      case 'comment':
        return `${profile.name} commented on your post`;
      case 'mention':
        return `${profile.name} mentioned you in a post`;
      default:
        return '';
    }
  };

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    onPostClick(notification.post_id);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start space-x-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.is_read ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
      }`}
    >
      <div className="flex-shrink-0">
        <AvatarWithBadge
          src={profile?.avatar_url}
          alt={profile?.name || 'User'}
          badge={profile?.badge || 'seeker'}
          size="sm"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          {getNotificationIcon()}
          <p className="text-sm text-gray-900 font-medium">
            {getNotificationText()}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
      
      {!notification.is_read && (
        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
      )}
    </div>
  );
};

export default NotificationItem;
