
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useProfileData } from '@/hooks/useProfileData';
import AvatarWithBadge from './AvatarWithBadge';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  images?: string[];
  likes_count?: number;
  comments_count?: number;
}

interface PostPreviewModalProps {
  postId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const PostPreviewModal: React.FC<PostPreviewModalProps> = ({
  postId,
  isOpen,
  onClose,
}) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const { profile } = useProfileData(post?.user_id || '');

  useEffect(() => {
    if (postId && isOpen) {
      fetchPost();
    }
  }, [postId, isOpen]);

  const fetchPost = async () => {
    if (!postId) return;

    setLoading(true);
    try {
      // Fetch post
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (postError) throw postError;

      // Fetch likes count
      const { count: likesCount } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      // Fetch comments count
      const { count: commentsCount } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      setPost({
        ...postData,
        likes_count: likesCount || 0,
        comments_count: commentsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Post Preview</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading post...</div>
        ) : post ? (
          <div className="space-y-4">
            {/* Post Header */}
            <div className="flex items-center space-x-3">
              <AvatarWithBadge
                src={profile?.avatar_url}
                alt={profile?.name || 'User'}
                badge={profile?.badge || 'seeker'}
                size="md"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{profile?.name || 'Unknown User'}</h3>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <div className="text-gray-900">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Post Images */}
            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {post.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            {/* Post Stats */}
            <div className="flex items-center space-x-6 pt-2 border-t">
              <div className="flex items-center space-x-2 text-gray-600">
                <Heart className="h-4 w-4" />
                <span className="text-sm">{post.likes_count || 0} likes</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{post.comments_count || 0} comments</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">Post not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PostPreviewModal;
