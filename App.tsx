import React, { useEffect, useState, Suspense } from 'react';
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
import FloatingChat from './components/FloatingChat'; 
import Preloader from './components/Preloader';
import SplashScreen from './components/SplashScreen';
import OfflinePage from './components/OfflinePage';
import InstallPrompt from './components/InstallPrompt';
import { Lock, ArrowRight, X } from 'lucide-react';
import { useAdminRouter } from './hooks/useRouter';

// Pages
import About from './components/About';
import Careers from './components/Careers';
import PrivacyPolicy from './components/PrivacyPolicy';

// Lazy Load Heavy Components
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const CostEstimator = React.lazy(() => import('./components/CostEstimator'));

const ComponentFallback: React.FC = () => (
  <div className="w-full h-screen flex items-center justify-center bg-gray-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-gray-400 text-sm font-khmer">Loading...</p>
    </div>
  </div>
);

function AppContent() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isViewingSite, setIsViewingSite] = useState(false);
  const [activePage, setActivePage] = useState<string | null>(null);
  const [shouldShowPortfolioPopup, setShouldShowPortfolioPopup] = useState(false);
  
  const { currentUser, logout, login } = useAuth();
  const { isAdminOpen, closeAdmin } = useAdminRouter();
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState(false);
  const { team } = useData();

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // --- ROUTING LOGIC ---
  useEffect(() => {
    const handleRouteChange = () => {
        const pathname = window.location.pathname;
        const hash = window.location.hash;
        
        // Regex to match /portfolio or /en/portfolio or /km/portfolio (including nested /portfolio/slug)
        const portfolioMatch = /\/(en|km|fr|ja|ko|de|zh-CN|es|ar)?\/portfolio(?:\/([^/]+))?/.exec(pathname);
        
        if (portfolioMatch) {
            // If path contains /portfolio, show the portfolio popup
            setShouldShowPortfolioPopup(true);
            setActivePage(null);
        } else if (hash === '#about') {
            setActivePage('about');
            setShouldShowPortfolioPopup(false);
        } else if (hash === '#careers') {
            setActivePage('careers');
            setShouldShowPortfolioPopup(false);
        } else if (hash === '#privacy') {
            setActivePage('privacy');
            setShouldShowPortfolioPopup(false);
        } else {
            // Default home state
            if (!['#about', '#careers', '#privacy'].includes(hash)) setActivePage(null);
            setShouldShowPortfolioPopup(false);
        }
    };
    
    handleRouteChange();
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
        window.removeEventListener('hashchange', handleRouteChange);
        window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (pin === '1234') {
          login({ role: 'admin', name: 'Super Admin' });
          closeAdmin(); setPin(''); setIsViewingSite(false);
          return;
      } 
      const foundMember = team.find(m => m.pinCode === pin);
      if (foundMember) {
          login({ role: 'member', id: foundMember.id, name: foundMember.name });
          closeAdmin(); setPin(''); setIsViewingSite(false);
          return;
      }
      setLoginError(true); setPin('');
      setTimeout(() => setLoginError(false), 500);
  };

  if (currentUser && !isViewingSite) {
      return (
        <Suspense fallback={<ComponentFallback />}>
          <AdminDashboard currentUser={currentUser} onLogout={logout} onViewSite={() => setIsViewingSite(true)} />
        </Suspense>
      );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden selection:bg-indigo-500 selection:text-white relative">
      <Preloader />
      <SplashScreen />
      <OfflinePage />
      <InstallPrompt />
      
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 opacity-50"
        style={{ background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.1), transparent 40%)` }}
      />
      
      <Header />
      
      <main className="relative z-10">
        <Hero />
        <Partners />
        <Services />
        <Suspense fallback={<div className="h-96 bg-gray-900/50" />}>
          <CostEstimator />
        </Suspense>
        <Process />
        
        {/* Portfolio Component with Path Routing Enabled */}
        <Portfolio 
            showPopupOnMount={shouldShowPortfolioPopup} 
            onPopupClose={() => setShouldShowPortfolioPopup(false)} 
            usePathRouting={true} 
        />
        
        <Testimonials />
        <Team />
        <Insights />
        <Contact />
      </main>
      
      <Footer />
      <FloatingChat />
      <ScrollButton />
      
      {/* Overlay Pages */}
      {activePage === 'about' && <About onClose={() => window.location.hash = ''} />}
      {activePage === 'careers' && <Careers onClose={() => window.location.hash = ''} />}
      {activePage === 'privacy' && <PrivacyPolicy onClose={() => window.location.hash = ''} />}
      
      {/* Admin Login Modal */}
      {isAdminOpen && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md">
              <div className="bg-gray-900 border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-sm relative">
                  <button onClick={closeAdmin} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
                  <div className="flex flex-col items-center mb-6">
                      <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 text-indigo-400"><Lock size={32} /></div>
                      <h3 className="text-2xl font-bold text-white font-khmer">Access Control</h3>
                  </div>
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} autoFocus className={`w-full bg-gray-800 border ${loginError ? 'border-red-500 animate-shake' : 'border-white/10'} rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`} placeholder="••••" maxLength={6} />
                      <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">Verify Identity <ArrowRight size={18} /></button>
                  </form>
              </div>
          </div>
      )}
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
