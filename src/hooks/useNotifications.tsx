
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'comment' | 'mention';
  related_user_id: string;
  post_id: string;
  comment_id?: string;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && profile?.id) {
      console.log('Fetching notifications for profile:', profile.id);
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
    }
  }, [user, profile?.id]);

  const fetchNotifications = async () => {
    if (!user || !profile?.id) {
      console.log('No user or profile, skipping notification fetch');
      return;
    }

    try {
      console.log('Fetching notifications for user_id:', profile.id);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      console.log('Notifications query result:', { data, error });

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      // Type assertion to ensure proper typing
      const typedNotifications = (data || []).map(notification => ({
        ...notification,
        type: notification.type as 'like' | 'comment' | 'mention'
      }));

      console.log('Typed notifications:', typedNotifications);
      setNotifications(typedNotifications);
      setUnreadCount(typedNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user || !profile?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
