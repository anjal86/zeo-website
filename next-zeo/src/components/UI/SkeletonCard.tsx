import React from 'react';


interface SkeletonCardProps {
  type?: 'tour' | 'destination' | 'blog';
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ type = 'tour' }) => {
  if (type === 'destination') {
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full animate-pulse">
        {/* Image Placeholder */}
        <div className="relative h-[400px] bg-gray-200"></div>
        {/* Content Placeholder */}
        <div className="p-6">
          <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3 mt-auto"></div>
        </div>
      </div>
    );
  }

  if (type === 'blog') {
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full animate-pulse">
        <div className="h-48 bg-gray-200"></div>
        <div className="p-6">
          <div className="flex gap-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-full mb-3"></div>
          <div className="h-6 bg-gray-200 rounded w-4/5 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  // Default to Tour
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full animate-pulse">
      {/* Image Placeholder */}
      <div className="relative h-64 bg-gray-200"></div>
      
      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1 relative">
        {/* Badge Placeholder */}
        <div className="absolute -top-5 right-6 h-10 w-24 bg-gray-200 shadow-sm"></div>
        
        {/* Title Placeholder */}
        <div className="h-7 bg-gray-200 rounded w-3/4 mt-2 mb-4"></div>
        
        {/* Meta Placeholder */}
        <div className="flex gap-4 mb-6">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        
        <div className="flex-1"></div>
        
        {/* Footer Placeholder */}
        <div className="flex justify-between items-end pt-5 border-t border-gray-100 mt-auto">
          <div className="flex flex-col gap-2">
            <div className="h-3 bg-gray-200 rounded w-12"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
