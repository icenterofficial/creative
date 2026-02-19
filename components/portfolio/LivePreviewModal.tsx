
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, RotateCcw, ChevronLeft, ChevronRight, ExternalLink, Globe, Loader2, ArrowRight } from 'lucide-react';
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

  // Sync input when URL changes via props
  useEffect(() => {
    setInputValue(url);
    setCurrentUrl(url);
  }, [url]);

  const handleRefresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      // Direct assignment for faster re-render
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 md:p-8">
      {/* Backdrop - Faster Fade */}
      <div 
        className="absolute inset-0 bg-gray-950/90 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        style={{ animationDuration: '200ms' }}
      />

      {/* Browser Window Container */}
      <div className="relative w-full max-w-7xl h-full bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-scale-up" style={{ animationDuration: '300ms' }}>
        
        {/* Browser Header */}
        <div className="h-14 bg-[#252526] border-b border-white/5 flex items-center px-4 gap-2 md:gap-4 shrink-0">
          {/* Traffic Lights */}
          <div className="flex gap-2 mr-2 shrink-0">
            <button onClick={onClose} className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] flex items-center justify-center group">
               <X size={8} className="text-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f]" />
          </div>

          {/* Navigation Controls */}
          <div className="hidden md:flex items-center gap-1 shrink-0">
            <button className="p-1.5 text-gray-500 hover:text-white transition-colors cursor-not-allowed opacity-50"><ChevronLeft size={20} /></button>
            <button className="p-1.5 text-gray-500 hover:text-white transition-colors cursor-not-allowed opacity-50"><ChevronRight size={20} /></button>
            <button 
                onClick={handleRefresh}
                className="p-1.5 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
                title="Reload"
            >
                <RotateCcw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Real URL Input Bar */}
          <form 
            onSubmit={handleNavigate}
            className="flex-1 bg-black/40 border border-white/10 rounded-xl h-10 flex items-center px-3 gap-2 overflow-hidden transition-all focus-within:border-indigo-500/50 focus-within:bg-black/60"
          >
            <Globe size={14} className={isLoading ? "text-indigo-400 animate-pulse" : "text-gray-500"} />
            <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-transparent text-xs text-gray-300 outline-none w-full font-mono selection:bg-indigo-500/30"
                spellCheck={false}
            />
            {inputValue !== currentUrl && (
                <button type="submit" className="text-indigo-400 hover:text-white p-1">
                    <ArrowRight size={14} />
                </button>
            )}
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-1 shrink-0">
             <a 
                href={currentUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 text-gray-400 hover:text-indigo-400 transition-colors hover:bg-white/5 rounded-lg"
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

        {/* Content Area */}
        <div className="flex-1 bg-white relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-[#0f1115] flex flex-col items-center justify-center gap-4 z-10 animate-fade-in">
              <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                  <Globe size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400 animate-pulse" />
              </div>
              <p className="text-gray-400 font-khmer text-sm tracking-wide">{t('Connecting...', 'កំពុងភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើ...')}</p>
            </div>
          )}
          
          <iframe 
            ref={iframeRef}
            src={currentUrl} 
            className="w-full h-full border-none bg-white"
            onLoad={() => setIsLoading(false)}
            title={title}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            loading="eager"
          />
        </div>

        {/* Status Bar */}
        <div className="h-7 bg-[#252526] border-t border-white/5 flex items-center px-4 shrink-0 justify-between">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    {isLoading ? 'Processing' : 'Secure Connection'}
                </span>
            </div>
            <span className="text-[9px] text-gray-600 font-mono hidden sm:block">PONLOE_LIVE_RENDER_V2</span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LivePreviewModal;
