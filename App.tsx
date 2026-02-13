import React, { useEffect, useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { DataProvider } from './contexts/DataContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Partners from './components/Partners';
import Services from './components/Services';
import Process from './components/Process';
import Portfolio from './components/Portfolio';
import Testimonials from './components/Testimonials';
import Team from './components/Team';
import Insights from './components/Insights';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ScrollButton from './components/ScrollButton';
import Preloader from './components/Preloader';
import AdminDashboard from './components/AdminDashboard';
import { Lock, ArrowRight, X } from 'lucide-react';
import { useAdminRouter } from './hooks/useRouter';

function AppContent() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Admin Login States
  const { isAdminOpen, closeAdmin } = useAdminRouter();
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (pin === '1234') {
          setIsAdminMode(true);
          closeAdmin(); // Ensure hash is cleared
          setPin('');
      } else {
          setLoginError(true);
          setPin('');
          setTimeout(() => setLoginError(false), 500);
      }
  };

  const closeLogin = () => {
      closeAdmin();
      setPin('');
  };

  if (isAdminMode) {
      return (
          <LanguageProvider>
              <AdminDashboard onLogout={() => setIsAdminMode(false)} />
          </LanguageProvider>
      );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden selection:bg-indigo-500 selection:text-white relative">
      <Preloader />
      
      {/* Global Mouse Spotlight */}
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 opacity-50"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.1), transparent 40%)`
        }}
      />

      <div className="fixed inset-0 z-[-1]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
      </div>
      <Header />
      <main className="relative z-10">
        <Hero />
        <Partners />
        <Services />
        <Process />
        <Portfolio />
        <Testimonials />
        <Team />
        <Insights />
        <Contact />
      </main>
      <Footer />
      <ScrollButton />
      
      {/* Admin Login Modal - Very High Z-Index to beat Cursor and Preloader */}
      {isAdminOpen && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-fade-in">
              <div className="bg-gray-900 border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-sm relative animate-scale-up">
                  <button 
                    onClick={closeLogin}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                  >
                      <X size={20} />
                  </button>
                  
                  <div className="flex flex-col items-center mb-6">
                      <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 text-indigo-400">
                          <Lock size={32} />
                      </div>
                      <h3 className="text-2xl font-bold text-white font-khmer">Admin Access</h3>
                      <p className="text-gray-400 text-sm">Enter PIN to continue</p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div className="relative">
                          <input 
                              type="password" 
                              value={pin}
                              onChange={(e) => setPin(e.target.value)}
                              autoFocus
                              className={`w-full bg-gray-800 border ${loginError ? 'border-red-500 animate-shake' : 'border-white/10'} rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
                              placeholder="••••"
                              maxLength={4}
                          />
                      </div>
                      <button 
                          type="submit" 
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                          Login <ArrowRight size={18} />
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* Hidden Trigger for Desktop Double Click (Optional Backup) */}
      <div 
        className="fixed bottom-0 left-0 w-10 h-10 z-[99999] opacity-0 cursor-default"
        onDoubleClick={() => window.location.hash = 'admin'}
      />

      <style>{`
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        .animate-shake {
            animation: shake 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </DataProvider>
  );
}
