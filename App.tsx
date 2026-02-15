import React, { useEffect, useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { DataProvider, useData } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import { Lock, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { useAdminRouter } from './hooks/useRouter';
import { CurrentUser } from './types';

// Pages
import About from './components/About';
import Careers from './components/Careers';
import PrivacyPolicy from './components/PrivacyPolicy';

function AppContent() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isViewingSite, setIsViewingSite] = useState(false);
  const [activePage, setActivePage] = useState<string | null>(null);
  
  // Auth from Context
  const { currentUser, login, logout } = useAuth();
  
  // Admin Login States
  const { isAdminOpen, closeAdmin } = useAdminRouter();
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  // Data for login verification
  const { team } = useData();

  // MAPPING: Specific PINs for specific users
  const MEMBER_PINS: Record<string, string> = {
      '1111': 't1', // Youshow
      '2222': 't2', // Samry
      '3333': 't3', // Sreyneang
      '4444': 't4', // Faisol
      '5555': 't5', // Adib Gazaly
      '6666': 't6', // Sait Abdulvasea
  };

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

  // Handle Page Routing via Hash
  useEffect(() => {
    const handleHashChange = () => {
        const hash = window.location.hash;
        if (hash === '#about') setActivePage('about');
        else if (hash === '#careers') setActivePage('careers');
        else if (hash === '#privacy') setActivePage('privacy');
        else {
            // Only clear active page if it's NOT a section link like #team or #portfolio
            // AND not a deep link like #team/1
            // Actually, we want to clear the overlay if we navigate away to a normal section
            if (!['#about', '#careers', '#privacy'].includes(hash)) {
                setActivePage(null);
            }
        }
    };
    
    // Initial check
    handleHashChange();
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const closePage = () => {
      // Clear hash to close page
      // Using history.pushState to remove hash without jump if possible, or just empty hash
      window.location.hash = ''; 
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // 1. SUPER ADMIN CHECK
      if (pin === '1234') {
          login({ role: 'admin', name: 'Super Admin' });
          closeAdmin();
          setPin('');
          setIsViewingSite(false); // Go to Dashboard
      } 
      // 2. SPECIFIC MEMBER CHECK
      else if (MEMBER_PINS[pin]) {
          const memberId = MEMBER_PINS[pin];
          const member = team.find(m => m.id === memberId);
          
          if (member) {
              login({ role: 'member', id: member.id, name: member.name });
              closeAdmin();
              setPin('');
              setIsViewingSite(false); // Go to Dashboard
          } else {
              setLoginError(true);
              setPin('');
              setTimeout(() => setLoginError(false), 500);
          }
      } 
      else {
          setLoginError(true);
          setPin('');
          setTimeout(() => setLoginError(false), 500);
      }
  };

  const closeLogin = () => {
      closeAdmin();
      setPin('');
  };

  // Render Admin Dashboard if logged in and NOT viewing site
  if (currentUser && !isViewingSite) {
      return (
          <LanguageProvider>
              <AdminDashboard 
                currentUser={currentUser} 
                onLogout={logout} 
                onViewSite={() => setIsViewingSite(true)}
              />
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
      
      {/* Admin Floating Button when viewing site */}
      {currentUser && (
         <button 
           onClick={() => setIsViewingSite(false)}
           className="fixed bottom-6 left-6 z-[99999] px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-lg flex items-center gap-2 animate-bounce hover:animate-none transition-all"
         >
            <ShieldCheck size={18} /> Back to Dashboard
         </button>
      )}

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
      
      {/* Full Screen Page Overlays */}
      {activePage === 'about' && <About onClose={closePage} />}
      {activePage === 'careers' && <Careers onClose={closePage} />}
      {activePage === 'privacy' && <PrivacyPolicy onClose={closePage} />}
      
      {/* Admin Login Modal */}
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
                      <h3 className="text-2xl font-bold text-white font-khmer">
                          Access Control
                      </h3>
                      <p className="text-gray-400 text-sm">
                          Enter your personal or admin PIN
                      </p>
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
                          Verify Identity <ArrowRight size={18} />
                      </button>
                  </form>
                  
                  {/* Hint for Demo */}
                  <div className="mt-6 pt-6 border-t border-white/5 text-xs text-gray-600 text-center">
                      <p>Super Admin: 1234</p>
                      <p>Members: 1111, 2222, 3333, 4444...</p>
                  </div>
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
        <AuthProvider>
           <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </DataProvider>
  );
}
