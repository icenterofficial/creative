
import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, Star, Zap, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { MemberDetailModal, AuthorArticlesModal, ArticleDetailModal } from './TeamModals';
import { TeamMember, Post } from '../types';

// --- Count Up Component ---
const CountUp: React.FC<{ end: number, duration: number, suffix?: string }> = ({ end, duration, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
};

// --- Scramble / Decode Text Effect (Matrix Style) ---
const ScrambleText: React.FC<{ text: string, className?: string }> = ({ text, className }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(prev => 
        text
          .split("")
          .map((letter, index) => {
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 3; 
    }, 30);

    return () => clearInterval(interval);
  }, [text, isHovered]); // Re-run on text change or hover

  return (
    <span 
        className={`inline-block ${className}`}
        onMouseEnter={() => setIsHovered(!isHovered)} // Re-trigger on hover for fun
    >
      {displayText}
    </span>
  );
};

// --- Magnetic Button Component ---
const MagneticButton: React.FC<{ children: React.ReactNode, className?: string, href?: string }> = ({ children, className, href }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.3; 
    const y = (clientY - (top + height / 2)) * 0.3;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <a
      href={href}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      className={`relative inline-block transition-transform duration-200 ease-out ${className}`}
    >
      {children}
    </a>
  );
};

const Hero: React.FC = () => {
  const { t } = useLanguage();
  const { team = [], insights = [] } = useData(); 
  
  // Modal States
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [authorPosts, setAuthorPosts] = useState<Post[] | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Rotation Animation States
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const animationRef = useRef<number>(0);

  // Parallax Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const constellationRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const mouse = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });

  // Handle Rotation Logic
  useEffect(() => {
    const animateRotation = () => {
        if (isOrbiting) {
            setRotationAngle(prev => prev + 0.003); 
            animationRef.current = requestAnimationFrame(animateRotation);
        }
    };

    if (isOrbiting) {
        animationRef.current = requestAnimationFrame(animateRotation);
    } else {
        cancelAnimationFrame(animationRef.current);
    }

    return () => cancelAnimationFrame(animationRef.current);
  }, [isOrbiting]);

  // Handle Real-time Mouse Tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        mouse.current = {
            x: (e.clientX / window.innerWidth) * 2 - 1,
            y: (e.clientY / window.innerHeight) * 2 - 1
        };
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
        smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * 0.05;
        smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * 0.05;

        if (constellationRef.current) {
            const x = smoothMouse.current.x;
            const y = smoothMouse.current.y;

            constellationRef.current.style.transform = `
                perspective(1000px)
                rotateY(${x * 5}deg)
                rotateX(${-y * 5}deg)
                translateX(${x * 10}px)
                translateY(${y * 10}px)
            `;

            constellationRef.current.style.setProperty('--mouse-x', x.toString());
            constellationRef.current.style.setProperty('--mouse-y', y.toString());
        }

        requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Lock body scroll
  useEffect(() => {
    if (selectedMember || authorPosts || selectedPost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedMember, authorPosts, selectedPost]);

  const handleShowArticles = (member: TeamMember) => {
      if (!insights) return;
      const posts = insights.filter(p => p.authorId === member.id);
      setAuthorPosts(posts);
  };

  // Helper to calculate dynamic positions
  const getDynamicPosition = (index: number, total: number, currentRotation: number) => {
      const angle = (index / total) * 2 * Math.PI - (Math.PI / 2) + currentRotation;
      const radiusBase = 40; 
      const radiusVar = (index % 2 === 0 ? 5 : -5);
      const radius = radiusBase + radiusVar;

      const left = 50 + radius * Math.cos(angle);
      const top = 50 + radius * Math.sin(angle);

      const sizes = ['w-14 h-14', 'w-16 h-16', 'w-20 h-20'];
      const size = sizes[index % 3];
      const speed = 1 + (index % 3) * 0.5;

      return { left: `${left}%`, top: `${top}%`, size, speed };
  };

  return (
    <section ref={containerRef} id="home" className="relative min-h-screen flex items-center pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden perspective-1000">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div 
            className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] transition-transform duration-700 ease-out"
            style={{ transform: `translate(calc(var(--mouse-x, 0) * -20px), calc(var(--mouse-y, 0) * -20px))` }}
        />
        <div 
            className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] transition-transform duration-700 ease-out"
            style={{ transform: `translate(calc(var(--mouse-x, 0) * 20px), calc(var(--mouse-y, 0) * 20px))` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Content - Typography & CTA */}
          <div className="space-y-8 text-center lg:text-left relative z-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-fade-in group hover:bg-white/10 transition-colors cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-bold text-indigo-300 tracking-widest uppercase font-khmer">
                  {t('Open for new projects', 'ទទួលគម្រោងថ្មីៗ')}
              </span>
            </div>
            
            {/* Main Headline */}
            <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight text-white font-khmer">
                    {t('We Craft', 'យើងបង្កើត')} <br />
                    
                    {/* English: Scramble Effect (Futuristic) */}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-lg">
                        <ScrambleText text="Digital Perfection" className="pb-2" />
                    </span>
                </h1>

                {/* Khmer: Clean, Readable, Glowing (NO CLIP) */}
                <h2 className="text-2xl md:text-3xl font-bold font-khmer text-white/90 leading-relaxed mt-2" style={{ textShadow: '0 0 20px rgba(168, 85, 247, 0.4)' }}>
                    {t(
                        'Transforming ideas into reality.',
                        'ភាពល្អឥតខ្ចោះនៃឌីជីថល' 
                    )}
                </h2>
            </div>
            
            <p className="text-lg text-gray-400 leading-relaxed font-khmer max-w-xl mx-auto lg:mx-0">
              {t(
                  'We are a team of architects, developers, and artists building the future of Cambodia\'s digital landscape.',
                  'ក្រុមការងារស្ថាបត្យករ អ្នកអភិវឌ្ឍន៍ និងសិល្បករ ដែលកំពុងកសាងអនាគតនៃវិស័យឌីជីថលនៅកម្ពុជា។'
              )}
            </p>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <MagneticButton 
                href="#portfolio"
                className="group px-8 py-4 rounded-full bg-white text-gray-950 font-bold text-lg shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 font-khmer w-full sm:w-auto"
              >
                {t('View Our Work', 'មើលស្នាដៃ')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </MagneticButton>
              <MagneticButton 
                href="#contact"
                className="px-8 py-4 rounded-full bg-white/5 text-white font-bold text-lg border border-white/10 hover:bg-white/10 hover:border-white/20 flex items-center justify-center gap-2 backdrop-blur-sm font-khmer w-full sm:w-auto"
              >
                {t('Contact Us', 'ទាក់ទងយើង')} <ChevronRight size={20} className="opacity-50" />
              </MagneticButton>
            </div>

            {/* Stats */}
            <div className="pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-8 border-t border-white/5">
                <div className="text-center lg:text-left">
                    <h4 className="text-3xl font-black text-white"><CountUp end={50} duration={2000} suffix="+" /></h4>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold font-khmer">{t('Projects', 'គម្រោង')}</p>
                </div>
                 <div className="text-center lg:text-left">
                    <h4 className="text-3xl font-black text-white"><CountUp end={99} duration={2000} suffix="%" /></h4>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold font-khmer">{t('Satisfaction', 'ការពេញចិត្ត')}</p>
                </div>
                <div className="flex items-center gap-1 w-full justify-center lg:w-auto pl-4 border-l border-white/5">
                   <div className="flex -space-x-2">
                       {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-900" />)}
                   </div>
                   <div className="ml-3">
                       <div className="flex text-yellow-400"><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /></div>
                       <span className="text-[10px] text-gray-400 font-bold">Trust by Partners</span>
                   </div>
                </div>
            </div>
          </div>
          
          {/* Right Content - Interactive 3D Constellation */}
          <div className="relative hidden lg:block h-[600px] w-full" style={{ perspective: '1000px' }}>
             <div 
                ref={constellationRef}
                className="relative w-full h-full flex items-center justify-center transition-transform duration-100 ease-out preserve-3d"
                style={{ transformStyle: 'preserve-3d' }}
             >
                {/* Central Core */}
                <div 
                    className="absolute z-10 cursor-pointer group/core"
                    style={{ transform: 'translateZ(20px)' }}
                    onClick={() => setIsOrbiting(!isOrbiting)}
                >
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] transition-all duration-1000 ${isOrbiting ? 'scale-110 opacity-60' : 'scale-100 opacity-20'}`}></div>
                    
                    <div className={`relative w-32 h-32 bg-gray-900/80 backdrop-blur-xl border ${isOrbiting ? 'border-indigo-400 shadow-[0_0_60px_rgba(99,102,241,0.5)]' : 'border-white/10'} rounded-full flex flex-col items-center justify-center z-20 animate-float transition-all duration-500`}>
                        <Zap size={32} className={`text-white transition-all duration-700 ${isOrbiting ? 'fill-indigo-400 text-indigo-400 scale-110' : ''}`} />
                        <span className="text-[10px] font-bold tracking-widest uppercase text-white mt-2">Ponloe</span>
                    </div>
                </div>

                {/* Orbit Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ transform: 'translateZ(10px)' }}>
                   <circle cx="50%" cy="50%" r="35%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" fill="none" className={isOrbiting ? "animate-spin-slow" : ""} />
                   <circle cx="50%" cy="50%" r="50%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" fill="none" className={isOrbiting ? "animate-spin-slow reverse" : ""} style={{ animationDirection: 'reverse', animationDuration: '20s' }} />
                   
                   {/* Connecting Lines */}
                   {team.map((member, index) => {
                       const pos = getDynamicPosition(index, team.length, rotationAngle);
                       return (
                           <line 
                               key={`line-${member.id}`}
                               x1="50%" y1="50%" 
                               x2={pos.left} y2={pos.top} 
                               stroke="url(#lineGradient)" 
                               strokeWidth="1"
                               className="opacity-30"
                           />
                       );
                   })}
                   <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(99, 102, 241, 0)" />
                        <stop offset="50%" stopColor="rgba(99, 102, 241, 0.5)" />
                        <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                      </linearGradient>
                   </defs>
                </svg>

                {/* Team Nodes */}
                {team.map((member, index) => {
                   const pos = getDynamicPosition(index, team.length, rotationAngle);
                   
                   return (
                     <div
                        key={member.id}
                        className="absolute z-20 cursor-pointer"
                        style={{ 
                            top: pos.top,
                            left: pos.left,
                            marginLeft: `-${parseInt(pos.size.split(' ')[0].replace('w-', '')) * 2}px`, 
                            marginTop: `-${parseInt(pos.size.split(' ')[1].replace('h-', '')) * 2}px`,
                            transform: `translateZ(${pos.speed * 30}px)`
                        }}
                        onClick={() => setSelectedMember(member)}
                     >
                        <div className={`relative ${pos.size} rounded-2xl overflow-hidden border border-white/20 shadow-lg transition-all duration-300 hover:scale-125 group bg-gray-900 ${isOrbiting ? 'border-indigo-500/50 shadow-indigo-500/30' : ''}`}>
                           <img 
                                src={member.image} 
                                alt={member.name} 
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                           />
                           
                           {/* Tooltip */}
                           <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/90 border border-white/10 px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-30 pointer-events-none translate-y-2 group-hover:translate-y-0">
                              <span className="text-[10px] text-white font-bold block">{member.name}</span>
                           </div>
                        </div>
                     </div>
                   );
                })}
             </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedMember && (
          <MemberDetailModal 
            member={selectedMember} 
            onClose={() => setSelectedMember(null)}
            onShowArticles={handleShowArticles}
          />
      )}

      {authorPosts && selectedMember && (
          <AuthorArticlesModal 
             author={selectedMember}
             posts={authorPosts}
             onClose={() => setAuthorPosts(null)}
             onSelectPost={setSelectedPost}
          />
      )}

      {selectedPost && (
          <ArticleDetailModal 
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
          />
      )}

    </section>
  );
};

export default Hero;
