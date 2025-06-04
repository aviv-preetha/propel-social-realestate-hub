
import React, { useState } from 'react';
import { MessageCircle, Heart } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import PropertyModal from './PropertyModal';
import { useProperties } from '@/hooks/useProperties';

interface UserPostsProps {
  userId: string;
}

const UserPosts: React.FC<UserPostsProps> = ({ userId }) => {
  const { posts } = usePosts();
  const { properties } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  // Filter posts by the user
  const userPosts = posts.filter(post => post.userId === userId);

  if (userPosts.length === 0) {
    return (
      <div className="p-8 text-center">
        <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No posts yet</h3>
        <p className="text-gray-500">This user hasn't shared any posts</p>
      </div>
    );
  }

  const handlePropertyClick = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setSelectedProperty(property);
    }
  };

  return (
    <>
      <div className="p-6">
        <div className="space-y-4">
          {userPosts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4 bg-white">
              <p className="text-gray-800 mb-3">{post.content}</p>
              
              {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {post.images.slice(0, 4).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                  ))}
                  {post.images.length > 4 && (
                    <div className="relative">
                      <img
                        src={post.images[3]}
                        alt="Post image"
                        className="w-full h-32 object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                        <span className="text-white font-medium">+{post.images.length - 3} more</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {post.propertyId && (
                <div className="mb-3">
                  <button
                    onClick={() => handlePropertyClick(post.propertyId!)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View attached property →
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{post.timestamp.toLocaleDateString()}</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{post.likes.length}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments.length}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          isOpen={!!selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </>
  );
};

export default UserPosts;
