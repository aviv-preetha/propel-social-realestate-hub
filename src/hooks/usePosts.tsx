import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { useToast } from '@/hooks/use-toast';

export interface DatabasePost {
  id: string;
  user_id: string;
  content: string;
  images: string[] | null;
  property_id: string | null;
  tagged_users: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  images?: string[];
  propertyId?: string;
  timestamp: Date;
  updatedAt?: Date;
  likes: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
}

export function usePosts() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const createNotification = async (
    userId: string,
    type: 'like' | 'comment' | 'mention',
    relatedUserId: string,
    postId: string,
    commentId?: string
  ) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          related_user_id: relatedUserId,
          post_id: postId,
          comment_id: commentId || null,
          is_read: false
        });

      if (error) {
        console.error('Error creating notification:', error);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    
    return mentions;
  };

  const fetchPosts = async () => {
    try {
      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Fetch likes for all posts
      const postIds = postsData.map(post => post.id);
      const { data: likesData, error: likesError } = await supabase
        .from('post_likes')
        .select('post_id, user_id')
        .in('post_id', postIds);

      if (likesError) throw likesError;

      // Fetch comments for all posts
      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select('*')
        .in('post_id', postIds)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Group likes by post ID
      const likesByPost = likesData.reduce((acc, like) => {
        if (!acc[like.post_id]) acc[like.post_id] = [];
        acc[like.post_id].push(like.user_id);
        return acc;
      }, {} as Record<string, string[]>);

      // Group comments by post ID
      const commentsByPost = commentsData.reduce((acc, comment) => {
        if (!acc[comment.post_id]) acc[comment.post_id] = [];
        acc[comment.post_id].push({
          id: comment.id,
          userId: comment.user_id,
          content: comment.content,
          timestamp: new Date(comment.created_at || '')
        });
        return acc;
      }, {} as Record<string, Comment[]>);

      // Map to Post interface
      const mappedPosts: Post[] = postsData.map(post => ({
        id: post.id,
        userId: post.user_id,
        content: post.content,
        images: post.images || undefined,
        propertyId: post.property_id || undefined,
        timestamp: new Date(post.created_at || ''),
        updatedAt: post.updated_at ? new Date(post.updated_at) : undefined,
        likes: likesByPost[post.id] || [],
        comments: commentsByPost[post.id] || []
      }));

      setPosts(mappedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      });
    }
  };

  const createPost = async (content: string, images?: string[], propertyId?: string) => {
    if (!user || !profile?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create posts",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: profile.id,
          content,
          images: images || null,
          property_id: propertyId || null
        })
        .select()
        .single();

      if (error) throw error;

      // Create mentions notifications
      const mentions = extractMentions(content);
      if (mentions.length > 0) {
        // Get profile IDs for mentioned usernames
        const { data: mentionedProfiles } = await supabase
          .from('profiles')
          .select('id, name')
          .in('name', mentions);

        if (mentionedProfiles) {
          for (const mentionedProfile of mentionedProfiles) {
            if (mentionedProfile.id !== profile.id) {
              await createNotification(
                mentionedProfile.id,
                'mention',
                profile.id,
                data.id
              );
            }
          }
        }
      }

      const newPost: Post = {
        id: data.id,
        userId: data.user_id,
        content: data.content,
        images: data.images || undefined,
        propertyId: data.property_id || undefined,
        timestamp: new Date(data.created_at || ''),
        updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
        likes: [],
        comments: []
      };

      setPosts(prev => [newPost, ...prev]);

      toast({
        title: "Post created!",
        description: "Your post has been shared",
      });

      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  const updatePost = async (postId: string, content: string) => {
    if (!user || !profile?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update posts",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .update({
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .eq('user_id', profile.id)
        .select()
        .single();

      if (error) throw error;

      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, content: data.content, updatedAt: new Date(data.updated_at || '') }
          : p
      ));

      toast({
        title: "Post updated!",
        description: "Your post has been updated",
      });
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
    }
  };

  const deletePost = async (postId: string) => {
    if (!user || !profile?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to delete posts",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', profile.id);

      if (error) throw error;

      setPosts(prev => prev.filter(p => p.id !== postId));

      toast({
        title: "Post deleted!",
        description: "Your post has been deleted",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user || !profile?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isLiked = post.likes.includes(profile.id);

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', profile.id);

        if (error) throw error;

        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, likes: p.likes.filter(id => id !== profile.id) }
            : p
        ));
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: profile.id
          });

        if (error) throw error;

        // Create notification for post owner (if not liking own post)
        if (post.userId !== profile.id) {
          await createNotification(
            post.userId,
            'like',
            profile.id,
            postId
          );
        }

        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, likes: [...p.likes, profile.id] }
            : p
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!user || !profile?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: profile.id,
          content
        })
        .select()
        .single();

      if (error) throw error;

      const post = posts.find(p => p.id === postId);
      
      // Create notification for post owner (if not commenting on own post)
      if (post && post.userId !== profile.id) {
        await createNotification(
          post.userId,
          'comment',
          profile.id,
          postId,
          data.id
        );
      }

      // Create mentions notifications in comments
      const mentions = extractMentions(content);
      if (mentions.length > 0) {
        const { data: mentionedProfiles } = await supabase
          .from('profiles')
          .select('id, name')
          .in('name', mentions);

        if (mentionedProfiles) {
          for (const mentionedProfile of mentionedProfiles) {
            if (mentionedProfile.id !== profile.id) {
              await createNotification(
                mentionedProfile.id,
                'mention',
                profile.id,
                postId,
                data.id
              );
            }
          }
        }
      }

      const newComment: Comment = {
        id: data.id,
        userId: data.user_id,
        content: data.content,
        timestamp: new Date(data.created_at || '')
      };

      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, comments: [...p.comments, newComment] }
          : p
      ));

      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      await fetchPosts();
      setLoading(false);
    };

    loadPosts();
  }, []);

  return {
    posts,
    loading,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    addComment,
    refetch: fetchPosts
  };
}
