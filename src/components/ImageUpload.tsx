
import React, { useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  bucket: string;
  onUpload: (url: string) => void;
  className?: string;
  currentImage?: string;
  isAvatar?: boolean;
  children?: React.ReactNode;
  isOverlay?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  bucket,
  onUpload,
  className = '',
  currentImage,
  isAvatar = false,
  children,
  isOverlay = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadImage = async (file: File) => {
    if (!user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      
      onUpload(data.publicUrl);
      toast({
        title: "Success!",
        description: "Image uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed ${
          isOverlay ? 'z-10' : ''
        }`}
        id={`image-upload-${bucket}`}
      />
      <label
        htmlFor={`image-upload-${bucket}`}
        className={`flex items-center justify-center cursor-pointer ${
          uploading ? 'opacity-50 cursor-not-allowed' : ''
        } ${!children ? `border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors ${
          isAvatar ? 'w-32 h-32 rounded-full' : 'h-32'
        }` : ''} ${isOverlay ? 'w-full h-full' : ''}`}
      >
        {children ? (
          children
        ) : currentImage ? (
          <img
            src={currentImage}
            alt="Current"
            className={`w-full h-full object-cover ${isAvatar ? 'rounded-full' : 'rounded-lg'}`}
          />
        ) : (
          <div className="text-center">
            {isAvatar ? (
              <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            ) : (
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            )}
            <p className="text-sm text-gray-500">
              {uploading ? 'Uploading...' : isAvatar ? 'Upload avatar' : 'Upload image'}
            </p>
          </div>
        )}
      </label>
    </div>
  );
};

export default ImageUpload;
