
import React from 'react';
import { Heart, MessageSquare, AtSign } from 'lucide-react';
import { Notification } from '@/hooks/useNotifications';
import { useProfiles } from '@/hooks/useProfiles';
import UserBadge from './UserBadge';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onShowPost: (postId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onShowPost
}) => {
  const { getProfile } = useProfiles();
  const relatedUser = getProfile(notification.related_user_id);

  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" fill="currentColor" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'mention':
        return <AtSign className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getMessage = () => {
    const userName = relatedUser?.name || 'Someone';
    switch (notification.type) {
      case 'like':
        return `${userName} liked your post`;
      case 'comment':
        return `${userName} commented on your post`;
      case 'mention':
        return `${userName} mentioned you in a post`;
      default:
        return 'New notification';
    }
  };

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    onShowPost(notification.post_id);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b cursor-pointer transition-colors hover:bg-gray-50 ${
        !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
              {getMessage()}
            </p>
            {relatedUser && (
              <UserBadge badge={relatedUser.badge} size="sm" />
            )}
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </p>
            {!notification.is_read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
