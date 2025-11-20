import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'rounded', 
  width, 
  height 
}) => {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-700";
  
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-md",
  };

  const style = {
    width: width,
    height: height,
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`} 
      style={style}
    />
  );
};

// Composants spécialisés pour nos besoins fréquents
export const SkeletonCard: React.FC = () => (
  <div className="w-full p-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-sm space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton width="40%" height={24} />
      <Skeleton variant="circular" width={32} height={32} />
    </div>
    <Skeleton width="80%" height={16} />
    <div className="flex gap-2 mt-4">
      <Skeleton width={60} height={24} />
      <Skeleton width={60} height={24} />
    </div>
  </div>
);

export const SkeletonProfileHeader: React.FC = () => (
  <div className="flex items-center gap-3 p-4">
    <Skeleton variant="circular" width={40} height={40} />
    <div className="space-y-2">
      <Skeleton width={120} height={20} />
      <Skeleton width={80} height={16} />
    </div>
  </div>
);

export const SkeletonDashboard: React.FC = () => (
  <div className="p-4 space-y-6">
    {/* Header area */}
    <div className="flex justify-between items-center mb-6">
      <div className="space-y-2">
        <Skeleton width={150} height={28} />
        <Skeleton width={200} height={20} />
      </div>
      <Skeleton variant="circular" width={40} height={40} />
    </div>

    {/* Main Carousel Area */}
    <div className="space-y-3">
      <Skeleton width={100} height={20} />
      <div className="flex gap-4 overflow-hidden">
        <div className="min-w-[85%]">
          <SkeletonCard />
        </div>
        <div className="min-w-[85%] opacity-50">
          <SkeletonCard />
        </div>
      </div>
    </div>

    {/* Secondary Area (e.g. Records) */}
    <div className="space-y-3 pt-4">
      <Skeleton width={120} height={20} />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton height={80} />
        <Skeleton height={80} />
      </div>
    </div>
  </div>
);
