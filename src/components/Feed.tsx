
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share, Send, MoreHorizontal } from 'lucide-react';
import UserBadge from './UserBadge';
import { usePosts } from '@/hooks/usePosts';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  id: string;
  name: string;
  avatar_url?: string;
  badge: 'owner' | 'seeker' | 'business';
}

const Feed: React.FC = () => {
  const { posts, loading, toggleLike, addComment, createPost } = usePosts();
  const { profile } = useProfile();
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [newPostContent, setNewPostContent] = useState('');
  const [profileCache, setProfileCache] = useState<Record<string, ProfileData>>({});

  const getUserById = async (userId: string): Promise<ProfileData> => {
    // Check cache first
    if (profileCache[userId]) {
      return profileCache[userId];
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, badge')
        .eq('id', userId)
        .single();

      if (error || !data) {
        const fallbackUser = {
          id: userId,
          name: 'Unknown User',
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          badge: 'seeker' as const
        };
        setProfileCache(prev => ({ ...prev, [userId]: fallbackUser }));
        return fallbackUser;
      }

      const userData = {
        id: data.id,
        name: data.name,
        avatar_url: data.avatar_url,
        badge: data.badge as 'owner' | 'seeker' | 'business'
      };

      setProfileCache(prev => ({ ...prev, [userId]: userData }));
      return userData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const fallbackUser = {
        id: userId,
        name: 'Unknown User',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        badge: 'seeker' as const
      };
      setProfileCache(prev => ({ ...prev, [userId]: fallbackUser }));
      return fallbackUser;
    }
  };

  // Fetch all unique user IDs when posts change
  useEffect(() => {
    const userIds = new Set<string>();
    posts.forEach(post => {
      userIds.add(post.userId);
      post.comments.forEach(comment => {
        userIds.add(comment.userId);
      });
    });

    // Fetch profiles for all users that aren't cached
    Array.from(userIds).forEach(userId => {
      if (!profileCache[userId]) {
        getUserById(userId);
      }
    });
  }, [posts, profileCache]);

  const handleCommentSubmit = async (postId: string) => {
    const content = newComments[postId]?.trim();
    if (!content) return;

    await addComment(postId, content);
    setNewComments(prev => ({ ...prev, [postId]: '' }));
  };

  const handleCreatePost = async () => {
    const content = newPostContent.trim();
    if (!content) return;

    await createPost(content);
    setNewPostContent('');
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <p className="text-gray-500">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post */}
      {profile && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex space-x-4">
            <img
              src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`}
              alt={profile.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <textarea
                placeholder="What's on your mind about real estate?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex justify-between items-center mt-3">
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    📷 Photo
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    🏠 Property
                  </button>
                </div>
                <button 
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts */}
      {posts.map((post) => {
        const author = profileCache[post.userId];
        
        if (!author) {
          return (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border p-6">
              <p className="text-gray-500">Loading post...</p>
            </div>
          );
        }

        const isLiked = profile ? post.likes.includes(profile.id) : false;

        return (
          <div key={post.id} className="bg-white rounded-xl shadow-sm border">
            {/* Post Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start space-x-3">
                <img
                  src={author.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.name}`}
                  alt={author.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{author.name}</h3>
                    <UserBadge badge={author.badge} />
                  </div>
                  <p className="text-gray-500 text-sm">{formatTimestamp(post.timestamp)}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-6 pb-4">
              <p className="text-gray-800 leading-relaxed">{post.content}</p>
            </div>

            {/* Post Images */}
            {post.images && post.images.length > 0 && (
              <div className="px-6 pb-4">
                <div className="grid grid-cols-1 gap-2">
                  {post.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt=""
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Post Actions */}
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center space-x-2 ${
                      isLiked 
                        ? 'text-red-600 hover:text-red-700' 
                        : 'text-gray-600 hover:text-gray-700'
                    } transition-colors`}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{post.likes.length}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 transition-colors">
                    <MessageCircle className="h-5 w-5" />
                    <span>{post.comments.length}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 transition-colors">
                    <Share className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Comments */}
            {post.comments.length > 0 && (
              <div className="px-6 pb-4 border-t border-gray-100">
                <div className="space-y-3 mt-4">
                  {post.comments.map((comment) => {
                    const commentAuthor = profileCache[comment.userId];

                    if (!commentAuthor) return null;

                    return (
                      <div key={comment.id} className="flex space-x-3">
                        <img
                          src={commentAuthor.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${commentAuthor.name}`}
                          alt={commentAuthor.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{commentAuthor.name}</span>
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(comment.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Comment Input */}
            {profile && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="flex space-x-3 mt-4">
                  <img
                    src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`}
                    alt={profile.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 flex space-x-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={newComments[post.id] || ''}
                      onChange={(e) => setNewComments(prev => ({ 
                        ...prev, 
                        [post.id]: e.target.value 
                      }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleCommentSubmit(post.id);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => handleCommentSubmit(post.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {posts.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <p className="text-gray-500 text-lg">No posts yet</p>
          <p className="text-gray-400">Be the first to share something!</p>
        </div>
      )}
    </div>
  );
};

export default Feed;
