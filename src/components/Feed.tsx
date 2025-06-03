import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share, Send, MoreHorizontal } from 'lucide-react';
import UserBadge from './UserBadge';
import UserMention from './UserMention';
import ImageUpload from './ImageUpload';
import { usePosts } from '@/hooks/usePosts';
import { useProfile } from '@/hooks/useProfile';
import { useConnections } from '@/hooks/useConnections';
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
  const { connections } = useConnections();
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<File[]>([]);
  const [profileCache, setProfileCache] = useState<Record<string, ProfileData>>({});
  const [taggedUsers, setTaggedUsers] = useState<Record<string, string[]>>({});
  const [postTaggedUsers, setPostTaggedUsers] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setTaggedUsers(prev => ({ ...prev, [postId]: [] }));
  };

  const handleCreatePost = async () => {
    const content = newPostContent.trim();
    if (!content) return;

    await createPost(content, newPostImages.length > 0 ? newPostImages : undefined);
    setNewPostContent('');
    setNewPostImages([]);
    setUploadingImages([]);
    setPostTaggedUsers([]);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Add to uploading images for immediate preview
    setUploadingImages(prev => [...prev, file]);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading file:', error);
        // Remove from uploading images on error
        setUploadingImages(prev => prev.filter(f => f !== file));
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      setNewPostImages(prev => [...prev, publicUrl]);
      // Remove from uploading images after successful upload
      setUploadingImages(prev => prev.filter(f => f !== file));
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadingImages(prev => prev.filter(f => f !== file));
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setNewPostImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveUploadingImage = (index: number) => {
    setUploadingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePostTagUser = (userId: string) => {
    setPostTaggedUsers(prev => [...prev, userId]);
  };

  const handleCommentTagUser = (postId: string, userId: string) => {
    setTaggedUsers(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), userId]
    }));
  };

  const renderTextWithMentions = (text: string) => {
    // Updated regex to match @ followed by names (first and last name), stopping at word boundaries
    const mentionRegex = /@([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add the mention with highlighting
      parts.push(
        <span key={match.index} className="text-blue-600 font-medium bg-blue-50 px-1 rounded">
          @{match[1]}
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
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
              <UserMention
                value={newPostContent}
                onChange={setNewPostContent}
                onTagUser={handlePostTagUser}
                placeholder="What's on your mind about real estate?"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
              />
              
              {/* Image Preview Section */}
              {(newPostImages.length > 0 || uploadingImages.length > 0) && (
                <div className="mt-3">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Uploading images with loading state */}
                    {uploadingImages.map((file, index) => (
                      <div key={`uploading-${index}`} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Uploading ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg opacity-50"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-25 rounded-lg">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                        <button
                          onClick={() => handleRemoveUploadingImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {/* Uploaded images */}
                    {newPostImages.map((image, index) => (
                      <div key={`uploaded-${index}`} className="relative">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-3">
                <div className="flex space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button 
                    onClick={handlePhotoClick}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
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
                    <span className="text-gray-500 text-sm">•</span>
                    <p className="text-gray-500 text-sm">{formatTimestamp(post.timestamp)}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-6 pb-4">
              <p className="text-gray-800 leading-relaxed text-left">{renderTextWithMentions(post.content)}</p>
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
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(comment.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800 text-left">{renderTextWithMentions(comment.content)}</p>
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
                    <div className="flex-1">
                      <UserMention
                        value={newComments[post.id] || ''}
                        onChange={(value) => setNewComments(prev => ({ 
                          ...prev, 
                          [post.id]: value 
                        }))}
                        onTagUser={(userId) => handleCommentTagUser(post.id, userId)}
                        placeholder="Write a comment..."
                        className="w-full px-3 py-1 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left min-h-[32px]"
                      />
                    </div>
                    <button
                      onClick={() => handleCommentSubmit(post.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors h-8 flex items-center justify-center"
                    >
                      <Send className="h-3 w-3" />
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
