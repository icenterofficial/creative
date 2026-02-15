import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import ScrollBackgroundText from './ScrollBackgroundText';

interface PageOverlayProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  bgText?: string;
}

const PageOverlay: React.FC<PageOverlayProps> = ({ title, onClose, children, bgText }) => {
  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-gray-950 overflow-y-auto animate-fade-in">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 bg-indigo-900/10 blur-[100px]" />
        {bgText && <ScrollBackgroundText text={bgText} className="opacity-20 top-0" />}
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 bg-gray-950/80 backdrop-blur-md border-b border-white/5">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">P</div>
            <span className="text-xl font-bold text-white font-khmer">{title}</span>
         </div>
         <button 
            onClick={onClose}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors group"
         >
            <X size={24} className="group-hover:rotate-90 transition-transform" />
         </button>
      </div>

      {/* Content Container */}
      <div className="relative z-10 pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
          <div className="animate-slide-up">
            {children}
          </div>
      </div>

      <style>{`
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default PageOverlay;
