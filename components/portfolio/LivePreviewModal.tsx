
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, RotateCcw, ChevronLeft, ChevronRight, ExternalLink, Globe, ArrowRight, ShieldCheck } from 'lucide-react';
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
  const [isInputFocused, setIsInputFocused] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync initial URL when modal opens or url prop changes
  useEffect(() => {
    setInputValue(url);
    setCurrentUrl(url);
  }, [url]);

  // High-frequency URL Tracker
  useEffect(() => {
    const checkUrl = () => {
      // Don't override if user is typing manually
      if (isInputFocused) return;

      try {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          const iframeLoc = iframeRef.current.contentWindow.location.href;
          
          // Only sync if the URL is valid and actually changed
          if (iframeLoc && iframeLoc !== 'about:blank' && iframeLoc !== inputValue) {
            setInputValue(iframeLoc);
            // We also update currentUrl to keep things consistent for the Refresh button
            setCurrentUrl(iframeLoc);
          }
        }
      } catch (e) {
        // This catch block will trigger if the domain is different (Cross-Origin)
        // Since you are previewing creative.ponloe.org, it should work fine if hosted on the same domain or subdomain.
      }
    };

    // Use a faster interval (200ms) for snappy address bar updates
    const intervalId = setInterval(checkUrl, 200);
    return () => clearInterval(intervalId);
  }, [isInputFocused, inputValue]);

  const handleRefresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      // Force reload the current internal URL
      iframeRef.current.src = inputValue; 
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

  // Back/Forward buttons logic
  const goBack = () => {
    try {
      if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.history.back();
    } catch(e) {}
  };

  const goForward = () => {
    try {
      if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.history.forward();
    } catch(e) {}
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
            <button onClick={goBack} className="p-2 text-gray-400 hover:text-white transition-colors" title="Back"><ChevronLeft size={18} /></button>
            <button onClick={goForward} className="p-2 text-gray-400 hover:text-white transition-colors" title="Forward"><ChevronRight size={18} /></button>
            <button 
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-white transition-all rounded-lg active:rotate-180 duration-500"
                title="Reload"
            >
                <RotateCcw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Real-time Address Bar */}
          <form 
            onSubmit={handleNavigate}
            className="flex-1 bg-black/40 border border-white/5 rounded-xl h-10 flex items-center px-4 gap-3 transition-all focus-within:border-indigo-500/50 focus-within:bg-black/60 group"
          >
            <ShieldCheck size={14} className={isLoading ? "text-indigo-400 animate-pulse" : "text-green-500"} />
            <input 
                type="text"
                value={inputValue}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-transparent text-[13px] text-gray-300 outline-none w-full font-mono tracking-tight selection:bg-indigo-500/30"
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
                href={inputValue} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 text-gray-400 hover:text-indigo-400 hover:bg-white/5 rounded-xl transition-all"
                title="Open in new tab"
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

        {/* Content Area */}
        <div className="flex-1 bg-white relative">
          {isLoading && (
            <div className="absolute inset-0 bg-[#0f1115] z-20 flex flex-col items-center justify-center animate-fade-in">
               <div className="w-12 h-12 relative">
                  <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
               </div>
               <p className="mt-4 text-[11px] text-gray-500 font-mono tracking-[0.3em] uppercase animate-pulse">Syncing Engine...</p>
            </div>
          )}
          
          <iframe 
            ref={iframeRef}
            src={currentUrl} 
            className={`w-full h-full border-none transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsLoading(false)}
            title={title}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            loading="eager"
          />
        </div>

        {/* Status Bar */}
        <div className="h-8 bg-[#2d2d2d] border-t border-black/20 flex items-center px-4 justify-between shrink-0">
            <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-indigo-500 animate-ping' : 'bg-green-500'}`}></div>
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                    {isLoading ? 'Tracking Navigation' : 'Live Sync Active'}
                </span>
            </div>
            <div className="flex items-center gap-3">
                 <span className="text-[9px] text-gray-600 font-mono">PONLOE RENDER ENGINE V2.6</span>
                 <div className="w-px h-3 bg-white/5"></div>
                 <span className="text-[9px] text-indigo-500/50 font-bold uppercase tracking-tighter">SECURE STREAM</span>
            </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LivePreviewModal;
