import React from 'react';

interface SkeletonCardProps {
  className?: string;
  count?: number;
}

/**
 * SkeletonCard Component
 * Shows a loading placeholder while content is being fetched
 * Provides better UX than blank space or sudden content changes
 */
const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${className} bg-gray-800 rounded-xl overflow-hidden border border-white/5 animate-pulse`}
        >
          {/* Image Skeleton */}
          <div className="w-full h-48 md:h-64 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer" />

          {/* Content Skeleton */}
          <div className="p-4 md:p-6 space-y-3">
            {/* Title Skeleton */}
            <div className="h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full w-3/4 animate-shimmer" />

            {/* Description Skeleton */}
            <div className="space-y-2">
              <div className="h-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full w-full animate-shimmer" />
              <div className="h-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full w-5/6 animate-shimmer" />
            </div>

            {/* Footer Skeleton */}
            <div className="pt-2 flex gap-2">
              <div className="h-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full w-1/4 animate-shimmer" />
              <div className="h-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full w-1/4 animate-shimmer" />
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        .animate-shimmer {
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </>
  );
};

export default SkeletonCard;
