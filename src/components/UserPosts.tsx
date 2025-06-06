import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share, Send, MoreHorizontal, Edit, Trash2, Plus, Image } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useProfile } from '@/hooks/useProfile';
import { useConnections } from '@/hooks/useConnections';
import { supabase } from '@/integrations/supabase/client';
import UserBadge from './UserBadge';
import UserMention from './UserMention';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

interface UserPostsProps {
  userId: string;
}

interface ProfileData {
  id: string;
  name: string;
  avatar_url?: string;
  badge: 'owner' | 'seeker' | 'business';
}

const UserPosts: React.FC<UserPostsProps> = ({ userId }) => {
  const { posts, toggleLike, addComment, updatePost, deletePost, createPost } = usePosts();
  const { profile } = useProfile();
  const { connections } = useConnections();
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [profileCache, setProfileCache] = useState<Record<string, ProfileData>>({});
  const [taggedUsers, setTaggedUsers] = useState<Record<string, string[]>>({});
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  
  // Reuse the exact same state from Feed component for post creation
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<File[]>([]);
  const [postTaggedUsers, setPostTaggedUsers] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter posts by the user
  const userPosts = posts.filter(post => post.userId === userId);

  // Check if current user is viewing their own profile
  const isOwnProfile = profile?.id === userId;

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
    userPosts.forEach(post => {
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
  }, [userPosts, profileCache]);

  const handleCreatePost = async () => {
    const content = newPostContent.trim();
    if (!content) return;

    await createPost(content, newPostImages.length > 0 ? newPostImages : undefined);
    setNewPostContent('');
    setNewPostImages([]);
    setUploadingImages([]);
    setPostTaggedUsers([]);
    setShowCreatePost(false);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setUploadingImages(prev => [...prev, ...fileArray]);

    for (const file of fileArray) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
          .from('post-images')
          .upload(filePath, file);

        if (error) {
          console.error('Error uploading file:', error);
          setUploadingImages(prev => prev.filter(f => f !== file));
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);

        setNewPostImages(prev => [...prev, publicUrl]);
        setUploadingImages(prev => prev.filter(f => f !== file));
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadingImages(prev => prev.filter(f => f !== file));
      }
    }

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

  const handleCommentSubmit = async (postId: string) => {
    const content = newComments[postId]?.trim();
    if (!content) return;

    await addComment(postId, content);
    setNewComments(prev => ({ ...prev, [postId]: '' }));
    setTaggedUsers(prev => ({ ...prev, [postId]: [] }));
  };

  const handleEditPost = (postId: string, currentContent: string) => {
    setEditingPost(postId);
    setEditContent(currentContent);
  };

  const handleSaveEdit = async (postId: string) => {
    if (!editContent.trim()) return;
    
    await updatePost(postId, editContent.trim());
    setEditingPost(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditContent('');
  };

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
  };

  const handleCommentTagUser = (postId: string, userId: string) => {
    setTaggedUsers(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), userId]
    }));
  };

  const renderTextWithMentionsAndLinks = (text: string) => {
    // URL regex pattern
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    // Mention regex pattern
    const mentionRegex = /@([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
    
    const parts = [];
    let lastIndex = 0;
    
    // Find all URLs and mentions with their positions
    const matches = [];
    
    // Find URLs
    let urlMatch;
    while ((urlMatch = urlRegex.exec(text)) !== null) {
      matches.push({
        type: 'url',
        start: urlMatch.index,
        end: urlMatch.index + urlMatch[0].length,
        content: urlMatch[0]
      });
    }
    
    // Find mentions
    let mentionMatch;
    while ((mentionMatch = mentionRegex.exec(text)) !== null) {
      matches.push({
        type: 'mention',
        start: mentionMatch.index,
        end: mentionMatch.index + mentionMatch[0].length,
        content: mentionMatch[0],
        name: mentionMatch[1]
      });
    }
    
    // Sort matches by position
    matches.sort((a, b) => a.start - b.start);
    
    // Process matches in order
    matches.forEach((match, index) => {
      // Add text before this match
      if (match.start > lastIndex) {
        parts.push(text.substring(lastIndex, match.start));
      }
      
      // Add the match
      if (match.type === 'url') {
        parts.push(
          <a
            key={`url-${match.start}`}
            href={match.content}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {match.content}
          </a>
        );
      } else if (match.type === 'mention') {
        parts.push(
          <span key={`mention-${match.start}`} className="text-blue-600 font-medium bg-blue-50 px-1 rounded">
            @{match.name}
          </span>
        );
      }
      
      lastIndex = match.end;
    });
    
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

  const isPostEdited = (post: any) => {
    // Check if the post has been edited by comparing created_at and updated_at
    const createdAt = new Date(post.timestamp).getTime();
    const updatedAt = new Date(post.updatedAt || post.timestamp).getTime();
    return updatedAt > createdAt + 1000; // Allow 1 second difference for database timing
  };

  if (userPosts.length === 0 && !isOwnProfile) {
    return (
      <div className="p-8 text-center">
        <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No posts yet</h3>
        <p className="text-gray-500">
          {isOwnProfile ? "Share your first post!" : "This user hasn't shared any posts"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Create Post Section - Only show for own profile - REUSED FROM FEED */}
      {isOwnProfile && (
        <div className="mb-6">
          {!showCreatePost ? (
            <Card className="p-4">
              <CardContent className="p-0">
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="w-full flex items-center space-x-3 text-left text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <img
                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name}`}
                    alt={profile?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="flex-1 py-3 px-4 bg-gray-50 rounded-full">What's on your mind?</span>
                  <Plus className="h-5 w-5" />
                </button>
              </CardContent>
            </Card>
          ) : (
            /* Reuse the exact same create post interface from Feed */
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex space-x-4">
                <img
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name}`}
                  alt={profile?.name}
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
                  
                  {/* Image Preview Section - REUSED FROM FEED */}
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
                        multiple
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
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setShowCreatePost(false);
                          setNewPostContent('');
                          setNewPostImages([]);
                          setUploadingImages([]);
                        }}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
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
            </div>
          )}
        </div>
      )}

      {/* Posts List - REUSED FROM FEED */}
      {userPosts.length === 0 ? (
        <div className="p-8 text-center">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No posts yet</h3>
          <p className="text-gray-500">
            {isOwnProfile ? "Share your first post!" : "This user hasn't shared any posts"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {userPosts.map((post) => {
            const author = profileCache[post.userId];
            
            if (!author) {
              return (
                <div key={post.id} className="bg-white rounded-xl shadow-sm border p-6">
                  <p className="text-gray-500">Loading post...</p>
                </div>
              );
            }

            const isLiked = profile ? post.likes.includes(profile.id) : false;
            const isAuthor = profile?.id === post.userId;

            return (
              <div key={post.id} className="bg-white rounded-xl shadow-sm border">
                {/* Post Header - REUSED FROM FEED */}
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
                        {isPostEdited(post) && (
                          <>
                            <span className="text-gray-500 text-sm">•</span>
                            <span className="text-gray-400 text-xs italic">edited</span>
                          </>
                        )}
                      </div>
                    </div>
                    {isAuthor ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditPost(post.id, post.content)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Post</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this post? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeletePost(post.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Content - REUSED FROM FEED */}
                <div className="px-6 pb-4">
                  {editingPost === post.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left min-h-[100px]"
                        placeholder="Edit your post..."
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveEdit(post.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-800 leading-relaxed text-left">{renderTextWithMentionsAndLinks(post.content)}</p>
                  )}
                </div>

                {/* Post Images - REUSED FROM FEED */}
                {post.images && post.images.length > 0 && (
                  <div className="px-6 pb-4">
                    {post.images.length === 1 ? (
                      <img
                        src={post.images[0]}
                        alt=""
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    ) : (
                      <Carousel className="w-full">
                        <CarouselContent>
                          {post.images.map((image, index) => (
                            <CarouselItem key={index}>
                              <img
                                src={image}
                                alt=""
                                className="w-full h-64 object-cover rounded-lg"
                              />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                      </Carousel>
                    )}
                  </div>
                )}

                {/* Post Actions - REUSED FROM FEED */}
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

                {/* Comments - REUSED FROM FEED */}
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
                                <p className="text-sm text-gray-800 text-left">{renderTextWithMentionsAndLinks(comment.content)}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Comment Input - REUSED FROM FEED */}
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
        </div>
      )}
    </div>
  );
};

export default UserPosts;
