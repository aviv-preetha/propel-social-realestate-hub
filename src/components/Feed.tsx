
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import AvatarWithBadge from './AvatarWithBadge';
import UserMention from './UserMention';
import ImageUpload from './ImageUpload';
import { useToast } from '@/hooks/use-toast';

interface PostProfile {
  name: string;
  avatar_url?: string;
  badge: 'owner' | 'seeker' | 'business';
  location?: string;
}

interface PostComment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    name: string;
    avatar_url?: string;
    badge: 'owner' | 'seeker' | 'business';
  };
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  images?: string[];
  tagged_users?: string[];
  created_at: string;
  profiles: PostProfile;
  post_likes: { user_id: string }[];
  post_comments: PostComment[];
}

const Feed: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [taggedUsers, setTaggedUsers] = useState<string[]>([]);
  const [postImages, setPostImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (name, avatar_url, badge, location),
          post_likes (user_id),
          post_comments (
            id, content, created_at,
            profiles!post_comments_user_id_fkey (name, avatar_url, badge)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        // Type the data properly with null checks
        const typedPosts: Post[] = data.map(post => {
          // Handle profiles data - ensure it exists and has the right structure
          const profileData = post.profiles;
          if (!profileData || typeof profileData !== 'object') {
            throw new Error('Profile data is missing for post');
          }

          return {
            ...post,
            profiles: {
              name: profileData!!.name || 'Unknown User',
              avatar_url: profileData!!.avatar_url,
              badge: (profileData!!.badge as 'owner' | 'seeker' | 'business') || 'seeker',
              location: profileData!!.location
            },
            post_comments: (post.post_comments || []).map((comment: any) => {
              const commentProfile = comment.profiles;
              return {
                ...comment,
                profiles: {
                  name: commentProfile?.name || 'Unknown User',
                  avatar_url: commentProfile?.avatar_url,
                  badge: (commentProfile?.badge as 'owner' | 'seeker' | 'business') || 'seeker'
                }
              };
            })
          };
        });
        setPosts(typedPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user) return;

    try {
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: newPost,
        images: postImages.length > 0 ? postImages : null,
        tagged_users: taggedUsers.length > 0 ? taggedUsers : null,
      });

      if (error) throw error;

      setNewPost('');
      setTaggedUsers([]);
      setPostImages([]);
      fetchPosts();
      
      toast({
        title: "Success!",
        description: "Post created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      const isLiked = post?.post_likes.some(like => like.user_id === user.id);

      if (isLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
      }

      fetchPosts();
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleTagUser = (userId: string) => {
    if (!taggedUsers.includes(userId)) {
      setTaggedUsers([...taggedUsers, userId]);
    }
  };

  const handleImageUpload = (url: string) => {
    setPostImages([...postImages, url]);
  };

  if (!user || !profile) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <p className="text-gray-500">Please sign in to view the feed.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <p className="text-gray-500">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-start space-x-4">
          <AvatarWithBadge
            src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`}
            alt={profile.name}
            badge={profile.badge}
          />
          <div className="flex-1">
            <UserMention
              value={newPost}
              onChange={setNewPost}
              onTagUser={handleTagUser}
              placeholder="Share something with your network... Use @ to tag someone"
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {postImages.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {postImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
            
            <div className="flex justify-between items-center mt-3">
              <ImageUpload
                bucket="posts"
                onUpload={handleImageUpload}
                className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-600"
              />
              <button
                onClick={handleCreatePost}
                disabled={!newPost.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-xl shadow-sm border">
          {/* Post Header */}
          <div className="p-6 pb-4">
            <div className="flex items-start space-x-3">
              <AvatarWithBadge
                src={post.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.profiles.name}`}
                alt={post.profiles.name}
                badge={post.profiles.badge}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{post.profiles.name}</h3>
                <p className="text-sm text-gray-600">{post.profiles.location}</p>
                <p className="text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="px-6 pb-4">
            <p className="text-gray-900 leading-relaxed">{post.content}</p>
          </div>

          {/* Post Images */}
          {post.images && post.images.length > 0 && (
            <div className="px-6 pb-4">
              <div className="grid grid-cols-1 gap-2">
                {post.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Post Actions */}
          <div className="px-6 py-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex space-x-6">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                    post.post_likes.some(like => like.user_id === user.id)
                      ? 'text-red-600'
                      : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${post.post_likes.some(like => like.user_id === user.id) ? 'fill-current' : ''}`} />
                  <span>{post.post_likes.length}</span>
                </button>
                <button className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                  <MessageCircle className="h-5 w-5" />
                  <span>{post.post_comments.length}</span>
                </button>
                <button className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">
                  <Share className="h-5 w-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Comments */}
          {post.post_comments.length > 0 && (
            <div className="px-6 pb-4 space-y-3">
              {post.post_comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <AvatarWithBadge
                    src={comment.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.profiles.name}`}
                    alt={comment.profiles.name}
                    badge={comment.profiles.badge}
                    size="sm"
                  />
                  <div className="flex-1 bg-gray-50 rounded-lg p-3">
                    <span className="font-medium text-sm">{comment.profiles.name}</span>
                    <p className="text-sm text-gray-900 mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No posts yet. Be the first to share something!</p>
        </div>
      )}
    </div>
  );
};

export default Feed;
