
import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, Play, Star, Zap, Power } from 'lucide-react';
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

  useEffect(() => {
    // Character sets for different scripts
    const khmerChars = "កខគឃងចឆជឈញដឋឌឍណតថទធនបផពភមយរលវសហឡអ០១២៣៤៥៦៧៨៩";
    const latinChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

    // Detect if the target text contains Khmer characters
    const isKhmer = /[\u1780-\u17FF]/.test(text);
    
    // Select the appropriate character set based on the text content
    const chars = isKhmer ? khmerChars : latinChars;

    let iterations = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((letter, index) => {
            if (index < iterations) {
              return text[index];
            }
            // Add a check to keep spaces as spaces during animation for better readability
            if (letter === " ") return " ";
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

  return <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 font-khmer">{displayText}</span>;
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
  const { team = [], insights = [] } = useData(); // Safe defaults
  
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
            setRotationAngle(prev => prev + 0.003); // Adjust speed here (Lower is slower/smoother)
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
        smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * 0.05;
        smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * 0.05;

        if (constellationRef.current) {
            const x = smoothMouse.current.x;
            const y = smoothMouse.current.y;

            // Apply 3D Tilt and Parallax
            constellationRef.current.style.transform = `
                perspective(1000px)
                rotateY(${x * 10}deg)
                rotateX(${-y * 10}deg)
                translateX(${x * 20}px)
                translateY(${y * 20}px)
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
      if (!insights) return;
      const posts = insights.filter(p => p.authorId === member.id);
      setAuthorPosts(posts);
  };

  // Helper to calculate dynamic positions based on ANY number of team members + Rotation
  const getDynamicPosition = (index: number, total: number, currentRotation: number) => {
      // Distribute evenly around a circle (360 degrees)
      // Start from -PI/2 (Top) + currentRotation
      const angle = (index / total) * 2 * Math.PI - (Math.PI / 2) + currentRotation;
      
      // Radius: 35-45% of container. Add slight variance for "organic" feel
      const radiusBase = 40; 
      const radiusVar = (index % 2 === 0 ? 5 : -5); // Zigzag slightly
      const radius = radiusBase + radiusVar;

      // Center is 50%, 50%
      const left = 50 + radius * Math.cos(angle);
      const top = 50 + radius * Math.sin(angle);

      // Sizes: Rotate between 3 sizes
      const sizes = ['w-14 h-14', 'w-16 h-16', 'w-20 h-20'];
      const size = sizes[index % 3];

      // Speed: Parallax speed multiplier
      const speed = 1 + (index % 3) * 0.5;

      return { left: `${left}%`, top: `${top}%`, size, speed };
  };

  return (
    <section ref={containerRef} id="home" className="relative min-h-screen flex items-center pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden perspective-1000">
      
      {/* Dynamic Background - Parallax Layer 1 (Deepest) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        {/* Mobile Specific Central Glow to replace constrained constellation */}
        <div className="lg:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[80px] animate-pulse" />

        <div 
            className="absolute top-[20%] left-[10%] w-72 h-72 bg-blue-600/30 rounded-full blur-[100px] transition-transform duration-75 ease-out opacity-50 lg:opacity-100"
            style={{ transform: `translate(calc(var(--mouse-x, 0) * -30px), calc(var(--mouse-y, 0) * -30px))` }}
        />
        <div 
            className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] transition-transform duration-75 ease-out opacity-50 lg:opacity-100"
            style={{ transform: `translate(calc(var(--mouse-x, 0) * 30px), calc(var(--mouse-y, 0) * 30px))` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          
          {/* Left Content */}
          <div className="space-y-6 md:space-y-8 text-center lg:text-left relative z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-fade-in">
              <span className="flex h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-[10px] md:text-xs font-medium text-gray-300 uppercase tracking-widest font-khmer">
                  {t('Available for new projects', 'ទទួលគម្រោងថ្មីៗ')}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] font-khmer tracking-tight">
              {t('Crafting', 'បង្កើត')} <br />
              <ScrambleText text={t('Digital Perfection', 'ភាពល្អឥតខ្ចោះនៃឌីជីថល')} />
            </h1>
            
            <p className="text-base md:text-lg lg:text-xl text-gray-400 leading-relaxed font-khmer max-w-xl mx-auto lg:mx-0">
              {t(
                  'Transform your brand with world-class design and engineering.',
                  'បំប្លែងគំនិតច្នៃប្រឌិតរបស់អ្នក អោយក្លាយជាការពិតដ៏អស្ចារ្យ។'
              )}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2 md:pt-4">
              <MagneticButton 
                href="#portfolio"
                className="group px-6 py-3 md:px-8 md:py-4 rounded-full bg-white text-gray-950 font-bold text-base md:text-lg shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 font-khmer w-full sm:w-auto"
              >
                {t('View Our Work', 'មើលស្នាដៃរបស់យើង')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </MagneticButton>
              <MagneticButton 
                href="#contact"
                className="px-6 py-3 md:px-8 md:py-4 rounded-full bg-white/5 text-white font-bold text-base md:text-lg border border-white/10 hover:bg-white/10 hover:border-white/20 flex items-center justify-center gap-2 backdrop-blur-sm font-khmer w-full sm:w-auto"
              >
                {t('Contact Us', 'ទាក់ទងយើង')}
              </MagneticButton>
            </div>

            <div className="pt-6 md:pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 md:gap-8 border-t border-white/5">
                <div className="text-center lg:text-left">
                    <h4 className="text-xl md:text-2xl font-bold text-white">
                        <CountUp end={50} duration={2000} suffix="+" />
                    </h4>
                    <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wider font-khmer">{t('Projects', 'គម្រោង')}</p>
                </div>
                 <div className="text-center lg:text-left">
                    <h4 className="text-xl md:text-2xl font-bold text-white">
                        <CountUp end={99} duration={2000} suffix="%" />
                    </h4>
                    <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wider font-khmer">{t('Satisfaction', 'ការពេញចិត្ត')}</p>
                </div>
                <div className="flex items-center gap-1 w-full justify-center lg:w-auto">
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

                {/* Central Core: The Brain/Hub (INTERACTIVE BUTTON) */}
                <div 
                    className="absolute z-10 cursor-pointer group/core"
                    style={{ transform: 'translateZ(20px)' }}
                    onClick={() => setIsOrbiting(!isOrbiting)}
                    title={isOrbiting ? "Stop Rotation" : "Activate Orbit"}
                >
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full blur-[90px] transition-opacity duration-1000 ${isOrbiting ? 'opacity-50 animate-pulse' : 'opacity-20'}`}></div>
                    
                    {/* Ripple Effect Ring when active */}
                    <div className={`absolute inset-0 rounded-full border border-indigo-500/30 scale-100 transition-all duration-1000 ${isOrbiting ? 'animate-ping opacity-30' : 'opacity-0'}`}></div>

                    <div className={`relative w-40 h-40 bg-gray-900/60 backdrop-blur-3xl border ${isOrbiting ? 'border-indigo-400 shadow-[0_0_80px_rgba(99,102,241,0.6)]' : 'border-white/20 shadow-[0_0_50px_rgba(99,102,241,0.3)]'} rounded-full flex flex-col items-center justify-center z-20 animate-float transition-all duration-500 group-hover/core:scale-105`}>
                        <div className={`w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-2 shadow-lg transition-transform duration-700 ${isOrbiting ? 'rotate-180' : ''}`}>
                            <Zap size={40} className="text-white fill-white" />
                        </div>
                        <span className={`text-xs font-bold tracking-widest uppercase transition-colors ${isOrbiting ? 'text-indigo-300' : 'text-white'}`}>Ponloe</span>
                        
                        {/* Status Dot */}
                        <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${isOrbiting ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-red-500/50'}`}></div>
                    </div>
                </div>

                {/* ANIMATED CONNECTION LINES (SVG LAYER) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ transform: 'translateZ(15px)' }}>
                   <defs>
                      <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(99, 102, 241, 0)" />
                        <stop offset="50%" stopColor="rgba(99, 102, 241, 0.8)" />
                        <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
                      </linearGradient>
                   </defs>
                   
                   {/* Background Orbit Ring */}
                   <circle cx="50%" cy="50%" r="40%" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" className={isOrbiting ? "animate-spin-slow" : ""} />

                   {/* Dynamic Lines connecting to Team Members */}
                   {team.map((member, index) => {
                       const pos = getDynamicPosition(index, team.length, rotationAngle);
                       return (
                           <g key={`line-${member.id}`}>
                               {/* Base Faint Line (Structure) */}
                               <line 
                                   x1="50%" y1="50%" 
                                   x2={pos.left} y2={pos.top} 
                                   stroke="rgba(255, 255, 255, 0.05)" 
                                   strokeWidth="1" 
                               />
                               
                               {/* Energy Beam Line (Pulse Effect) */}
                               <line 
                                   x1="50%" y1="50%" 
                                   x2={pos.left} y2={pos.top} 
                                   stroke="url(#beamGradient)" 
                                   strokeWidth="2"
                                   strokeDasharray="10 150" 
                                   strokeLinecap="round"
                                   className="opacity-60"
                                   style={{
                                       animation: `flowLine ${isOrbiting ? 1.5 : 4}s linear infinite`,
                                       animationDelay: `${index * 0.5}s`
                                   }}
                               />
                           </g>
                       );
                   })}
                </svg>

                {/* Orbiting Team Members - DYNAMIC MAPPING WITH ROTATION */}
                {team.map((member, index) => {
                   const pos = getDynamicPosition(index, team.length, rotationAngle);
                   
                   return (
                     <div
                        key={member.id}
                        className="absolute z-20 cursor-pointer"
                        style={{ 
                            top: pos.top,
                            left: pos.left,
                            // Center the element on its coordinate
                            marginLeft: `-${parseInt(pos.size.split(' ')[0].replace('w-', '')) * 2}px`, 
                            marginTop: `-${parseInt(pos.size.split(' ')[1].replace('h-', '')) * 2}px`,
                            transform: `translateZ(${pos.speed * 30}px) translate(calc(var(--mouse-x) * ${-20 * pos.speed}px), calc(var(--mouse-y) * ${-20 * pos.speed}px))`
                        }}
                        onClick={() => setSelectedMember(member)}
                     >
                        <div
                          className={`relative ${pos.size} rounded-2xl overflow-hidden border border-white/20 shadow-lg shadow-indigo-500/10 transition-all duration-300 hover:scale-125 group hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] bg-gray-900 ${isOrbiting ? 'border-indigo-500/50' : ''}`}
                        >
                           <div className="absolute inset-0 bg-gray-900 transition-colors duration-300">
                              <img 
                                src={member.image} 
                                alt={member.name} 
                                className={`w-full h-full object-cover transition-all duration-500 ${isOrbiting ? 'grayscale-0' : 'filter grayscale group-hover:grayscale-0'}`} 
                              />
                           </div>
                           
                           {/* Hover Info Badge */}
                           <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 group-hover:-bottom-10 transition-all duration-300 whitespace-nowrap z-30 pointer-events-none">
                              <span className="text-[10px] text-white font-bold block">{member.name}</span>
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

      {/* Inline Styles for Animation */}
      <style>{`
        @keyframes flowLine {
            0% { stroke-dashoffset: 160; opacity: 0; }
            50% { opacity: 1; }
            100% { stroke-dashoffset: 0; opacity: 0; }
        }
      `}</style>

      {/* Reused Modals from Team Section */}
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
