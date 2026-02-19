
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface ProjectGalleryProps {
  images: string[];
  title: string;
}

const ProjectGallery: React.FC<ProjectGalleryProps> = ({ images, title }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isUiVisible, setIsUiVisible] = useState(true);
  
  // Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const handleNextImage = () => {
      setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
      setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // --- SWIPE HANDLERS ---
  const onTouchStart = (e: React.TouchEvent) => {
      setTouchEnd(null); 
      setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe) {
          handleNextImage();
      } else if (isRightSwipe) {
          handlePrevImage();
      }
  };

  const handleImageClick = () => {
      // Prevent toggle if it was a swipe
      if (touchStart && touchEnd && Math.abs(touchStart - touchEnd) > 10) return;
      setIsUiVisible(!isUiVisible);
  };

  if (images.length === 0) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-2 bg-gray-900">
            <ImageIcon size={32} />
            <span>No Image Available</span>
        </div>
      );
  }

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex items-center justify-center bg-black cursor-pointer group/gallery"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={handleImageClick}
    >
        {/* Main Image */}
        <div className="w-full h-full relative">
            <img 
              key={activeImageIndex}
              src={images[activeImageIndex]} 
              alt={title} 
              className="w-full h-full object-contain animate-fade-in bg-black select-none pointer-events-none"
            />
            
            {/* Navigation Buttons (Only if > 1 image) */}
            {images.length > 1 && (
                <div className={`transition-opacity duration-300 ${isUiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-black transition-all shadow-lg z-20 hover:scale-110"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-black transition-all shadow-lg z-20 hover:scale-110"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            )}

            {/* Thumbnails Overlay */}
            {images.length > 1 && (
                <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-3 bg-black/60 backdrop-blur-lg rounded-2xl border border-white/20 max-w-[95%] overflow-x-auto scrollbar-hide z-20 shadow-2xl transition-opacity duration-300 ${isUiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    {images.map((img, idx) => (
                        <button 
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setActiveImageIndex(idx); }}
                            className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${activeImageIndex === idx ? 'border-indigo-500 scale-110 shadow-lg shadow-indigo-500/50' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                        >
                            <img src={img} className="w-full h-full object-cover" alt="" />
                        </button>
                    ))}
                </div>
            )}
        </div>
        
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent opacity-50 pointer-events-none" />
    </div>
  );
};

export default ProjectGallery;
