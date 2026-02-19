
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, RotateCcw, ChevronLeft, ChevronRight, ExternalLink, Globe, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface LivePreviewModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

const LivePreviewModal: React.FC<LivePreviewModalProps> = ({ url, title, onClose }) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-950/90 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Browser Window Container */}
      <div className="relative w-full max-w-7xl h-full bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-scale-up">
        
        {/* Browser Header (macOS Style) */}
        <div className="h-14 bg-[#252526] border-b border-white/5 flex items-center px-4 gap-4 shrink-0">
          {/* Traffic Lights */}
          <div className="flex gap-2 mr-2">
            <button onClick={onClose} className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>

          {/* Navigation Controls */}
          <div className="hidden md:flex items-center gap-1">
            <button className="p-1.5 text-gray-500 hover:text-white transition-colors"><ChevronLeft size={18} /></button>
            <button className="p-1.5 text-gray-500 hover:text-white transition-colors"><ChevronRight size={18} /></button>
            <button 
                onClick={() => { setIsLoading(true); const frame = document.getElementById('preview-frame') as HTMLIFrameElement; if(frame) frame.src = url; }}
                className="p-1.5 text-gray-500 hover:text-white transition-colors"
            >
                <RotateCcw size={16} />
            </button>
          </div>

          {/* Pseudo URL Bar */}
          <div className="flex-1 bg-black/30 border border-white/10 rounded-lg h-9 flex items-center px-4 gap-2 overflow-hidden max-w-2xl mx-auto">
            <Globe size={14} className="text-gray-500 shrink-0" />
            <span className="text-xs text-gray-400 truncate select-none">{url}</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
             <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 text-gray-400 hover:text-indigo-400 transition-colors"
                title="Open in new tab"
             >
                <ExternalLink size={18} />
             </a>
             <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors md:hidden"
             >
                <X size={20} />
             </button>
          </div>
        </div>

        {/* Content Area / Iframe */}
        <div className="flex-1 bg-white relative">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center gap-4 z-10">
              <Loader2 size={40} className="animate-spin text-indigo-500" />
              <p className="text-gray-400 font-khmer text-sm animate-pulse">{t('Loading Preview...', 'កំពុងផ្ទុកការបង្ហាញ...')}</p>
            </div>
          )}
          
          <iframe 
            id="preview-frame"
            src={url} 
            className="w-full h-full border-none"
            onLoad={() => setIsLoading(false)}
            title={title}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>

        {/* Status Bar (Optional) */}
        <div className="h-6 bg-[#252526] border-t border-white/5 flex items-center px-4 shrink-0">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">ponloe creative live engine</span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LivePreviewModal;
