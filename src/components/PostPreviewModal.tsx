import React, { useState } from 'react';
import { X, Heart, MessageSquare } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useProfile } from '@/hooks/useProfile';
import { useProfiles } from '@/hooks/useProfiles';
import AvatarWithBadge from './AvatarWithBadge';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface PostPreviewModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

const PostPreviewModal: React.FC<PostPreviewModalProps> = ({
  postId,
  isOpen,
  onClose
}) => {
  const { posts, toggleLike, addComment } = usePosts();
  const { profile } = useProfile();
  const { getProfile } = useProfiles();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');

  const post = posts.find(p => p.id === postId);

  if (!isOpen || !post) return null;

  const postAuthor = getProfile(post.userId);
  const isLiked = profile ? post.likes.includes(profile.id) : false;

  const handleLike = async () => {
    if (!profile) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }
    await toggleLike(post.id);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    await addComment(post.id, newComment);
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Post Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Post Header */}
          <div className="flex items-center space-x-3">
            {postAuthor && (
              <AvatarWithBadge
                src={postAuthor.avatar_url || '/placeholder.svg'}
                alt={postAuthor.name}
                badge={postAuthor.badge}
                size="md"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                {postAuthor?.name || 'Unknown User'}
              </h3>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                {post.updatedAt && post.updatedAt > post.timestamp && ' (edited)'}
              </p>
            </div>
          </div>

          {/* Post Content - Center Aligned */}
          <div className="text-center">
            <p className="text-gray-800 leading-relaxed">{post.content}</p>
          </div>

          {/* Post Images with Carousel for 3+ images */}
          {post.images && post.images.length > 0 && (
            <div className="flex justify-center">
              {post.images.length <= 2 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md">
                  {post.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full max-w-md">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {post.images.map((image, index) => (
                        <CarouselItem key={index}>
                          <img
                            src={image}
                            alt={`Post image ${index + 1}`}
                            className="w-full h-64 object-cover rounded-lg"
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </div>
              )}
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-center space-x-6 pt-3 border-t">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{post.likes.length}</span>
            </button>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <MessageSquare className="h-5 w-5" />
              <span className="text-sm">{post.comments.length}</span>
            </div>
          </div>

          {/* Comments Section - Always Visible */}
          <div className="space-y-4 pt-4 border-t">
            {/* Existing Comments */}
            {post.comments.map((comment) => {
              const commentAuthor = getProfile(comment.userId);
              return (
                <div key={comment.id} className="flex space-x-3">
                  {commentAuthor && (
                    <AvatarWithBadge
                      src={commentAuthor.avatar_url || '/placeholder.svg'}
                      alt={commentAuthor.name}
                      badge={commentAuthor.badge}
                      size="sm"
                    />
                  )}
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="font-medium text-sm">{commentAuthor?.name || 'Unknown User'}</p>
                      <p className="text-gray-800">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Add Comment */}
            <form onSubmit={handleComment} className="flex space-x-3">
              {profile && (
                <AvatarWithBadge
                  src={profile.avatar_url || '/placeholder.svg'}
                  alt={profile.name}
                  badge={profile.badge}
                  size="sm"
                />
              )}
              <div className="flex-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPreviewModal;
