import { User } from 'lucide-react';
import { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32
};

export function Avatar({ src, alt = 'Avatar', size = 'md', className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const shouldShowImage = src && !imageError && !src.includes('/api/storage/blobs');

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900 flex items-center justify-center overflow-hidden ${className}`}
    >
      {shouldShowImage ? (
        <>
          {isLoading && (
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-full h-full" />
          )}
          <img
            src={src}
            alt={alt}
            className={`w-full h-full object-cover ${isLoading ? 'hidden' : 'block'}`}
            onError={handleError}
            onLoad={handleLoad}
          />
        </>
      ) : (
        <User
          size={iconSizes[size]}
          className="text-primary-600 dark:text-primary-400"
        />
      )}
    </div>
  );
}
