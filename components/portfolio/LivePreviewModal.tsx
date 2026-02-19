
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, RotateCcw, ChevronLeft, ChevronRight, ExternalLink, Globe, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface LivePreviewModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

const LivePreviewModal: React.FC<LivePreviewModalProps> = ({ url, title, onClose }) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [inputValue, setInputValue] = useState(url);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync when initial URL prop changes
  useEffect(() => {
    setInputValue(url);
    setCurrentUrl(url);
  }, [url]);

  // Function to sync URL from Iframe
  const syncIframeUrl = () => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const newUrl = iframeRef.current.contentWindow.location.href;
        if (newUrl && newUrl !== 'about:blank' && newUrl !== currentUrl) {
          setInputValue(newUrl);
          setCurrentUrl(newUrl);
        }
      }
    } catch (e) {
      // Cross-origin error: We cannot read the URL of an external domain
      // In this case, we keep the last known URL to avoid breaking the UI
      console.log("Cross-origin restriction: cannot read internal URL.");
    }
    setIsLoading(false);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl;
    }
  };

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let target = inputValue.trim();
    if (!target.startsWith('http')) {
      target = 'https://' + target;
    }
    setIsLoading(true);
    setCurrentUrl(target);
    setInputValue(target);
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 md:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-950/90 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        style={{ animationDuration: '200ms' }}
      />

      {/* Browser Window */}
      <div className="relative w-full max-w-7xl h-[95vh] bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col animate-scale-up" style={{ animationDuration: '250ms' }}>
        
        {/* Browser Top Bar */}
        <div className="h-14 bg-[#2d2d2d] border-b border-black/20 flex items-center px-4 gap-3 shrink-0">
          {/* Traffic Lights */}
          <div className="flex gap-2 mr-2">
            <button onClick={onClose} className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] hover:brightness-110 transition-all shadow-inner" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] shadow-inner" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f] shadow-inner" />
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-0.5">
            <button className="p-2 text-gray-500 hover:text-white transition-colors"><ChevronLeft size={18} /></button>
            <button className="p-2 text-gray-500 hover:text-white transition-colors"><ChevronRight size={18} /></button>
            <button 
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-white transition-all rounded-lg active:rotate-180 duration-500"
            >
                <RotateCcw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Functional URL Bar */}
          <form 
            onSubmit={handleNavigate}
            className="flex-1 bg-black/40 border border-white/5 rounded-xl h-10 flex items-center px-4 gap-3 transition-all focus-within:border-indigo-500/50 focus-within:bg-black/60 group"
          >
            <ShieldCheck size={14} className={isLoading ? "text-indigo-400 animate-pulse" : "text-green-500"} />
            <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-transparent text-[13px] text-gray-300 outline-none w-full font-mono tracking-tight"
                spellCheck={false}
            />
            {inputValue !== currentUrl && (
                <button type="submit" className="text-indigo-400 hover:text-white p-1 animate-fade-in">
                    <ArrowRight size={16} />
                </button>
            )}
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1">
             <a 
                href={currentUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 text-gray-400 hover:text-indigo-400 hover:bg-white/5 rounded-xl transition-all"
                title="Open original site"
             >
                <ExternalLink size={18} />
             </a>
             <button 
                onClick={onClose}
                className="p-2.5 text-gray-400 hover:text-white md:hidden"
             >
                <X size={20} />
             </button>
          </div>
        </div>

        {/* Browser Content */}
        <div className="flex-1 bg-white relative">
          {/* Super Fast Minimal Loader */}
          {isLoading && (
            <div className="absolute inset-0 bg-[#121212] z-20 flex flex-col items-center justify-center animate-fade-in">
               <div className="w-12 h-12 relative">
                  <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
               </div>
               <p className="mt-4 text-[11px] text-gray-500 font-mono tracking-[0.3em] uppercase animate-pulse">Rendering Live...</p>
            </div>
          )}
          
          <iframe 
            ref={iframeRef}
            src={currentUrl} 
            className={`w-full h-full border-none transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={syncIframeUrl}
            title={title}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            loading="eager"
          />
        </div>

        {/* Minimal Bottom Bar */}
        <div className="h-8 bg-[#2d2d2d] border-t border-black/20 flex items-center px-4 justify-between shrink-0">
            <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-indigo-500 animate-ping' : 'bg-green-500'}`}></div>
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                    {isLoading ? 'Requesting Stream' : 'Live Preview Active'}
                </span>
            </div>
            <div className="flex items-center gap-3">
                 <span className="text-[9px] text-gray-600 font-mono">1280 x 800</span>
                 <div className="w-px h-3 bg-white/5"></div>
                 <span className="text-[9px] text-indigo-500/50 font-bold uppercase tracking-tighter">Ponloe Engine v2.4</span>
            </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LivePreviewModal;
