import React from 'react';

interface ImagePreviewProps {
  imageUrl: string | null;
  fallbackText?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const sizeClasses = {
  small: 'h-12 w-12',
  medium: 'h-24 w-24',
  large: 'h-32 w-32',
};

const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  fallbackText = 'No image',
  size = 'medium',
  className = '',
}) => {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt="Preview"
        className={`${sizeClasses[size]} rounded-lg object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-lg bg-white/5 text-xs text-muted ${className}`}
    >
      {fallbackText}
    </div>
  );
};

export default ImagePreview;
