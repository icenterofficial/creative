import React, { useEffect, useState } from 'react';

const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);
  if (!isVisible) return null;
  return (
    <div className="fixed inset-0 z-[9999] bg-gray-950 flex flex-col items-center justify-center">
      <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center animate-pulse shadow-2xl shadow-indigo-500/50">
        <span className="text-white text-4xl font-bold">P</span>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-white font-khmer">Ponloe Creative</h1>
    </div>
  );
};
export default SplashScreen;
