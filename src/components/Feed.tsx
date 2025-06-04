
import React, { useState } from 'react';
import { Camera, Send } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useProfile } from '@/hooks/useProfile';
import PostCard from './PostCard';
import AvatarWithBadge from './AvatarWithBadge';
import ImageUpload from './ImageUpload';
import { useToast } from '@/hooks/use-toast';

const Feed: React.FC = () => {
  const { posts, loading, createPost } = usePosts();
  const { profile } = useProfile();
  const { toast } = useToast();
  
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postImages, setPostImages] = useState<string[]>([]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setIsPosting(true);
    try {
      await createPost(newPostContent, postImages.length > 0 ? postImages : undefined);
      setNewPostContent('');
      setPostImages([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setPostImages(prev => [...prev, url]);
  };

  const removeImage = (index: number) => {
    setPostImages(prev => prev.filter((_, i) => i !== index));
  };

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
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div className="flex space-x-4">
            {profile && (
              <AvatarWithBadge
                user={profile}
                size="md"
              />
            )}
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What's on your mind?"
              className="flex-1 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Image Upload Preview */}
          {postImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {postImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <ImageUpload
              bucket="posts"
              onUpload={handleImageUpload}
              className="text-gray-500 hover:text-gray-700"
            >
              <Camera className="h-5 w-5" />
            </ImageUpload>
            
            <button
              type="submit"
              disabled={!newPostContent.trim() || isPosting}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              <span>{isPosting ? 'Posting...' : 'Post'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <p className="text-gray-500 text-lg">No posts yet</p>
          <p className="text-gray-400 text-sm mt-2">Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
