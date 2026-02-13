import React from 'react';

const Footer: React.FC = () => {
  const handleAdminClick = (e: React.MouseEvent) => {
      e.preventDefault();
      // Dispatch custom event to open modal in App.tsx
      window.dispatchEvent(new Event('open-admin-login'));
  };

  return (
    <footer className="bg-gray-950 text-white border-t border-white/10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
             <a href="#" className="flex items-center gap-2 mb-6">
                 <div className="h-8 w-8 rounded bg-indigo-600 flex items-center justify-center font-bold">P</div>
                <span className="text-2xl font-bold">ponloe.creative</span>
             </a>
             <p className="text-gray-400 text-lg leading-relaxed max-w-md">
               Pioneering the future of digital design and architectural innovation in Cambodia. We build brands that matter.
             </p>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-white">Services</h4>
            <ul className="space-y-4 text-gray-500">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Web Development</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">App Development</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Graphic Design</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Architecture</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-white">Company</h4>
             <ul className="space-y-4 text-gray-500">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li>
                    <button 
                        onClick={handleAdminClick} 
                        className="hover:text-indigo-400 transition-colors text-left"
                    >
                        Admin Login
                    </button>
                </li>
            </ul>
          </div>
        </div>
        
        {/* Big Text */}
        <div className="border-t border-white/10 pt-10">
             <h1 className="text-[12vw] leading-none font-bold text-white/5 text-center select-none pointer-events-none">
                CREATIVE
             </h1>
        </div>

        <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p>© 2025 Ponloe Creative. All Rights Reserved.</p>
            <div className="flex gap-6">
                <a href="#" className="hover:text-white transition-colors">Facebook</a>
                <a href="#" className="hover:text-white transition-colors">Telegram</a>
                <a href="#" className="hover:text-white transition-colors">Instagram</a>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;