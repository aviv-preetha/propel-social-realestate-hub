
import React from 'react';
import { X } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import PostCard from './PostCard';

interface PostPreviewModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

const PostPreviewModal: React.FC<PostPreviewModalProps> = ({
  postId,
  isOpen,
  onClose
}) => {
  const { posts } = usePosts();
  const post = posts.find(p => p.id === postId);

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Post Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4">
          <PostCard post={post} />
        </div>
      </div>
    </div>
  );
};

export default PostPreviewModal;
