
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
    toggleLike,
    addComment,
    refetch: fetchPosts
  };
}
