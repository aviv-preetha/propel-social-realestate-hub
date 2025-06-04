import React, { useState } from 'react';
import { Heart, MessageSquare, MoreHorizontal, Edit, Trash } from 'lucide-react';
import { Post } from '@/hooks/usePosts';
import { useProfile } from '@/hooks/useProfile';
import { useProfiles } from '@/hooks/useProfiles';
import { usePosts } from '@/hooks/usePosts';
import AvatarWithBadge from './AvatarWithBadge';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { profile } = useProfile();
  const { getProfile } = useProfiles();
  const { toggleLike, addComment, updatePost, deletePost } = usePosts();
  const { toast } = useToast();
  
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showMenu, setShowMenu] = useState(false);

  const postAuthor = getProfile(post.userId);
  const isLiked = profile ? post.likes.includes(profile.id) : false;
  const isOwner = profile?.id === post.userId;

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

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    
    await updatePost(post.id, editContent);
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deletePost(post.id);
      setShowMenu(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
      {/* Post Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {postAuthor && (
            <AvatarWithBadge
              user={postAuthor}
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
        
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit post
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete post
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="What's on your mind?"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(post.content);
              }}
              className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 leading-relaxed">{post.content}</p>
      )}

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {post.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Post image ${index + 1}`}
              className="w-full h-40 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 ${
              isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{post.likes.length}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm">{post.comments.length}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4 pt-4 border-t">
          {/* Existing Comments */}
          {post.comments.map((comment) => {
            const commentAuthor = getProfile(comment.userId);
            return (
              <div key={comment.id} className="flex space-x-3">
                {commentAuthor && (
                  <AvatarWithBadge
                    user={commentAuthor}
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
                user={profile}
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
      )}
    </div>
  );
};

export default PostCard;
