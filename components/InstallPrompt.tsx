import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    });
  }, []);
  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      setShow(false);
    }
  };
  if (!show) return null;
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-gray-900 border border-white/10 p-6 rounded-3xl shadow-2xl max-w-md mx-auto flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold">P</div>
        <div>
          <h4 className="text-white font-bold font-khmer">ដំឡើងកម្មវិធី</h4>
          <p className="text-gray-400 text-xs font-khmer">ទទួលបានបទពិសោធន៍កាន់តែប្រសើរ</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setShow(false)} className="p-2 text-gray-500"><X size={20} /></button>
        <button onClick={handleInstall} className="bg-indigo-600 p-3 rounded-xl text-white"><Download size={20} /></button>
      </div>
    </div>
  );
};
export default InstallPrompt;
