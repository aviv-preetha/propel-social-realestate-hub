
import React, { useState } from 'react';
import { Heart, MessageCircle, Share, Send } from 'lucide-react';
import { mockPosts, mockUsers, mockProperties } from '../data/mockData';
import { Post } from '../types';
import UserBadge from './UserBadge';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState(mockPosts);
  const [newPost, setNewPost] = useState('');

  const currentUser = mockUsers[0]; // Simulating logged-in user

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likes.includes(currentUser.id);
        return {
          ...post,
          likes: isLiked 
            ? post.likes.filter(id => id !== currentUser.id)
            : [...post.likes, currentUser.id]
        };
      }
      return post;
    }));
  };

  const handleComment = (postId: string, content: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newComment = {
          id: Date.now().toString(),
          userId: currentUser.id,
          content,
          timestamp: new Date()
        };
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));
  };

  const handleCreatePost = () => {
    if (newPost.trim()) {
      const post: Post = {
        id: Date.now().toString(),
        userId: currentUser.id,
        content: newPost,
        timestamp: new Date(),
        likes: [],
        comments: []
      };
      setPosts([post, ...posts]);
      setNewPost('');
    }
  };

  const getUser = (userId: string) => mockUsers.find(user => user.id === userId);
  const getProperty = (propertyId: string) => mockProperties.find(property => property.id === propertyId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-start space-x-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share something with your network..."
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex justify-end mt-3">
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
      {posts.map((post) => {
        const user = getUser(post.userId);
        const property = post.propertyId ? getProperty(post.propertyId) : null;
        
        if (!user) return null;

        return (
          <div key={post.id} className="bg-white rounded-xl shadow-sm border">
            {/* Post Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start space-x-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <UserBadge badge={user.badge} />
                  </div>
                  <p className="text-sm text-gray-600">{user.location}</p>
                  <p className="text-xs text-gray-400">
                    {post.timestamp.toLocaleDateString()} at {post.timestamp.toLocaleTimeString()}
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

            {/* Property Card */}
            {property && (
              <div className="mx-6 mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex space-x-4">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{property.title}</h4>
                    <p className="text-sm text-gray-600">{property.location}</p>
                    <p className="text-lg font-bold text-blue-600">
                      €{property.price.toLocaleString()}{property.type === 'rent' ? '/month' : ''}
                    </p>
                  </div>
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
                      post.likes.includes(currentUser.id)
                        ? 'text-red-600'
                        : 'text-gray-600 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${post.likes.includes(currentUser.id) ? 'fill-current' : ''}`} />
                    <span>{post.likes.length}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                    <MessageCircle className="h-5 w-5" />
                    <span>{post.comments.length}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">
                    <Share className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Comments */}
            {post.comments.length > 0 && (
              <div className="px-6 pb-4 space-y-3">
                {post.comments.map((comment) => {
                  const commentUser = getUser(comment.userId);
                  if (!commentUser) return null;
                  
                  return (
                    <div key={comment.id} className="flex space-x-3">
                      <img
                        src={commentUser.avatar}
                        alt={commentUser.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{commentUser.name}</span>
                          <UserBadge badge={commentUser.badge} size="sm" />
                        </div>
                        <p className="text-sm text-gray-900 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Comment */}
            <div className="px-6 pb-6">
              <div className="flex space-x-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 flex space-x-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        handleComment(post.id, e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <button className="text-blue-600 hover:text-blue-700">
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Feed;
