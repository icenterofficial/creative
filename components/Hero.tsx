import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, Play, Star, Zap } from 'lucide-react';
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

// --- Scramble Text Component ---
const ScrambleText: React.FC<{ text: string }> = ({ text }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = "!@#$%^&*()_+-=[]{}|;':,.<>/?";

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  useEffect(() => {
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((letter, index) => {
            if (index < iterations) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iterations >= text.length) {
        clearInterval(interval);
      }

      iterations += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  return <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">{displayText}</span>;
};

// --- Magnetic Button Component ---
const MagneticButton: React.FC<{ children: React.ReactNode, className?: string, href?: string }> = ({ children, className, href }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.3; // Strength of magnet
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
  const { team, insights } = useData();
  
  // Modal States
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [authorPosts, setAuthorPosts] = useState<Post[] | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Parallax Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const constellationRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const mouse = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });

  // Handle Real-time Mouse Tracking with Physics (Lerp)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        // Calculate mouse position relative to center of screen (-1 to 1)
        mouse.current = {
            x: (e.clientX / window.innerWidth) * 2 - 1,
            y: (e.clientY / window.innerHeight) * 2 - 1
        };
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
        // Linear Interpolation (Lerp) for smoothness
        // 0.05 is the easing factor (lower = smoother/slower, higher = snappier)
        smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * 0.05;
        smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * 0.05;

        if (constellationRef.current) {
            const x = smoothMouse.current.x;
            const y = smoothMouse.current.y;

            // Apply 3D Tilt and Parallax
            // Rotate the entire plane based on mouse position
            constellationRef.current.style.transform = `
                perspective(1000px)
                rotateY(${x * 10}deg)
                rotateX(${-y * 10}deg)
                translateX(${x * 20}px)
                translateY(${y * 20}px)
            `;

            // We can also update CSS variables if we want individual elements to move differently
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

  // Lock body scroll when modal is open
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
      const posts = insights.filter(p => p.authorId === member.id);
      setAuthorPosts(posts);
  };

  // Fixed positions for the constellation layout
  const teamPositions = [
    { top: '10%', left: '20%', size: 'w-16 h-16', speed: 1.5 }, // Top Left
    { top: '15%', right: '10%', size: 'w-20 h-20', speed: 1.2 }, // Top Right
    { top: '45%', left: '0%', size: 'w-14 h-14', speed: 2 },   // Middle Left
    { top: '50%', right: '0%', size: 'w-16 h-16', speed: 1.8 },   // Middle Right
    { bottom: '15%', left: '20%', size: 'w-20 h-20', speed: 1.1 }, // Bottom Left
    { bottom: '5%', right: '25%', size: 'w-14 h-14', speed: 2.2 },  // Bottom Right
  ];

  return (
    <section ref={containerRef} id="home" className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden perspective-1000">
      
      {/* Dynamic Background - Parallax Layer 1 (Deepest) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div 
            className="absolute top-[20%] left-[10%] w-72 h-72 bg-blue-600/30 rounded-full blur-[100px] transition-transform duration-75 ease-out"
            style={{ transform: `translate(calc(var(--mouse-x, 0) * -30px), calc(var(--mouse-y, 0) * -30px))` }}
        />
        <div 
            className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] transition-transform duration-75 ease-out"
            style={{ transform: `translate(calc(var(--mouse-x, 0) * 30px), calc(var(--mouse-y, 0) * 30px))` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Content - Static or Slight Parallax */}
          <div className="space-y-8 text-center lg:text-left relative z-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-xs font-medium text-gray-300 uppercase tracking-widest font-khmer">
                  {t('Available for new projects', 'ទទួលគម្រោងថ្មីៗ')}
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1] font-khmer">
              {t('Crafting', 'បង្កើត')} <br />
              <ScrambleText text={t('Digital Perfection', 'ភាពល្អឥតខ្ចោះនៃឌីជីថល')} />
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-400 leading-relaxed font-khmer max-w-xl mx-auto lg:mx-0">
              {t(
                  'Transform your brand with world-class design and engineering.',
                  'បំប្លែងគំនិតច្នៃប្រឌិតរបស់អ្នក អោយក្លាយជាការពិតដ៏អស្ចារ្យ។'
              )}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-4">
              <MagneticButton 
                href="#portfolio"
                className="group px-8 py-4 rounded-full bg-white text-gray-950 font-bold text-lg shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 font-khmer"
              >
                {t('View Our Work', 'មើលស្នាដៃរបស់យើង')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </MagneticButton>
              <MagneticButton 
                href="#contact"
                className="px-8 py-4 rounded-full bg-white/5 text-white font-bold text-lg border border-white/10 hover:bg-white/10 hover:border-white/20 flex items-center justify-center gap-2 backdrop-blur-sm font-khmer"
              >
                {t('Contact Us', 'ទាក់ទងយើង')}
              </MagneticButton>
            </div>

            <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 border-t border-white/5">
                <div className="text-left">
                    <h4 className="text-2xl font-bold text-white">
                        <CountUp end={50} duration={2000} suffix="+" />
                    </h4>
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-khmer">{t('Projects', 'គម្រោង')}</p>
                </div>
                 <div className="text-left">
                    <h4 className="text-2xl font-bold text-white">
                        <CountUp end={99} duration={2000} suffix="%" />
                    </h4>
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-khmer">{t('Satisfaction', 'ការពេញចិត្ត')}</p>
                </div>
                <div className="flex items-center gap-1">
                   {[1,2,3,4,5].map(i => <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />)}
                   <span className="text-sm text-gray-500 ml-2">5.0</span>
                </div>
            </div>
          </div>
          
          {/* Right Content - Real-time Visionary Constellation */}
          <div className="relative hidden lg:block h-[600px] w-full" style={{ perspective: '1000px' }}>
             {/* This container rotates in 3D */}
             <div 
                ref={constellationRef}
                className="relative w-full h-full flex items-center justify-center transition-transform duration-100 ease-out preserve-3d"
                style={{ transformStyle: 'preserve-3d' }}
             >

                {/* Central Core: The Brain/Hub (Moves slightly opposite to mouse) */}
                <div 
                    className="absolute z-10"
                    style={{ transform: 'translateZ(20px)' }}
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full blur-[90px] opacity-30 animate-pulse"></div>
                    <div className="relative w-40 h-40 bg-gray-900/40 backdrop-blur-3xl border border-white/20 rounded-full flex flex-col items-center justify-center z-20 shadow-[0_0_50px_rgba(99,102,241,0.3)] animate-float">
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-2 shadow-lg">
                            <Zap size={40} className="text-white fill-white" />
                        </div>
                        <span className="text-xs font-bold text-white tracking-widest uppercase">Ponloe</span>
                    </div>
                </div>

                {/* Connecting Lines (Decorative) - Move with the plane */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-30" style={{ transform: 'translateZ(10px)' }}>
                   <defs>
                      <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                   </defs>
                   {/* Coordinates approximated to connect center to team positions */}
                   <path d="M200 150 Q 300 300 300 300" stroke="url(#lineGrad)" strokeWidth="1" fill="none" className="animate-pulse" />
                   <path d="M400 150 Q 300 300 300 300" stroke="url(#lineGrad)" strokeWidth="1" fill="none" className="animate-pulse" style={{ animationDelay: '1s' }} />
                   <path d="M100 300 Q 300 300 300 300" stroke="url(#lineGrad)" strokeWidth="1" fill="none" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                   <path d="M500 320 Q 300 300 300 300" stroke="url(#lineGrad)" strokeWidth="1" fill="none" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
                   <path d="M200 450 Q 300 300 300 300" stroke="url(#lineGrad)" strokeWidth="1" fill="none" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
                   <path d="M400 480 Q 300 300 300 300" stroke="url(#lineGrad)" strokeWidth="1" fill="none" className="animate-pulse" style={{ animationDelay: '1.2s' }} />
                </svg>

                {/* Orbiting Team Members - High Parallax Effect */}
                {team.slice(0, 6).map((member, index) => {
                   const pos = teamPositions[index] || { top: '50%', left: '50%', size: 'w-16 h-16', speed: 1 };
                   
                   return (
                     <div
                        key={member.id}
                        className="absolute z-20 cursor-pointer"
                        style={{ 
                            top: pos.top,
                            left: pos.left,
                            right: pos.right,
                            bottom: pos.bottom,
                            // Each member moves differently based on "speed" prop for depth effect
                            transform: `translateZ(${pos.speed * 30}px) translate(calc(var(--mouse-x) * ${-20 * pos.speed}px), calc(var(--mouse-y) * ${-20 * pos.speed}px))`
                        }}
                        onClick={() => setSelectedMember(member)}
                     >
                        <div
                          className={`relative ${pos.size} rounded-2xl overflow-hidden border border-white/20 shadow-lg shadow-indigo-500/10 transition-all duration-300 hover:scale-125 group hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] bg-gray-900`}
                        >
                           <div className="absolute inset-0 bg-gray-900 transition-colors duration-300">
                              <img 
                                src={member.image} 
                                alt={member.name} 
                                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300" 
                              />
                           </div>
                           
                           {/* Hover Info Badge */}
                           <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 group-hover:-bottom-10 transition-all duration-300 whitespace-nowrap z-30 pointer-events-none">
                              <span className="text-[10px] text-white font-bold block">{member.name}</span>
                              <span className="text-[8px] text-indigo-300 block text-center">Click to view</span>
                           </div>

                           {/* Active Ring */}
                           <div className="absolute inset-0 border-2 border-indigo-500/0 group-hover:border-indigo-500 transition-colors duration-300 rounded-2xl"></div>
                        </div>
                     </div>
                   );
                })}

             </div>
          </div>
        </div>
      </div>

      {/* Reused Modals from Team Section for seamless experience */}
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