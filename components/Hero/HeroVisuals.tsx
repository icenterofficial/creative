
import React, { useState, useRef, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { TeamMember } from '../../types';

interface HeroVisualsProps {
    team: TeamMember[];
    onMemberClick: (member: TeamMember) => void;
}

const HeroVisuals: React.FC<HeroVisualsProps> = ({ team, onMemberClick }) => {
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);
  
  const animationRef = useRef<number>(0);
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

  // Handle Real-time Mouse Tracking (Parallax Effect)
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
                rotateY(${x * 3}deg)
                rotateX(${-y * 3}deg)
                translateX(${x * 5}px)
                translateY(${y * 5}px)
            `;
        }

        requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Helper to calculate dynamic positions
  const getDynamicPosition = (index: number, total: number, currentRotation: number) => {
      const angle = (index / total) * 2 * Math.PI - (Math.PI / 2) + currentRotation;
      const radiusBase = 38; 
      const radiusVar = (index % 2 === 0 ? 4 : -4); // Zigzag slightly
      const radius = radiusBase + radiusVar;

      const left = 50 + radius * Math.cos(angle);
      const top = 50 + radius * Math.sin(angle);

      const sizes = ['w-14 h-14', 'w-16 h-16', 'w-20 h-20'];
      const size = sizes[index % 3];
      const speed = 1 + (index % 3) * 0.5;

      return { left: `${left}%`, top: `${top}%`, size, speed };
  };

  return (
    <div className="relative hidden lg:block h-[600px] w-full" style={{ perspective: '1000px' }}>
        <div 
            ref={constellationRef}
            className="relative w-full h-full flex items-center justify-center transition-transform duration-100 ease-out preserve-3d"
            style={{ transformStyle: 'preserve-3d' }}
        >
            {/* --- 1. CENTER CORE (PONLOE) --- */}
            <div 
                className="absolute z-10 cursor-pointer group/core"
                style={{ transform: 'translateZ(20px)' }}
                onClick={() => setIsOrbiting(!isOrbiting)}
            >
                {/* Outer Glow Pulse */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[60px] transition-all duration-1000 ${isOrbiting ? 'scale-125 opacity-80' : 'scale-100 opacity-40 animate-pulse'}`}></div>
                
                {/* Core Circle */}
                <div className={`relative w-28 h-28 bg-gray-950/80 backdrop-blur-xl border-2 ${isOrbiting ? 'border-indigo-400 shadow-[0_0_50px_rgba(99,102,241,0.6)]' : 'border-white/10'} rounded-full flex flex-col items-center justify-center z-20 animate-float transition-all duration-500`}>
                    <Zap size={32} className={`text-white transition-all duration-700 ${isOrbiting ? 'fill-indigo-400 text-indigo-400 scale-125 drop-shadow-[0_0_10px_rgba(99,102,241,1)]' : 'fill-white/20'}`} />
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white mt-2 drop-shadow-md">Ponloe</span>
                    
                    {/* Spinning Core Ring */}
                    <div className="absolute inset-0 rounded-full border-t border-r border-indigo-500/50 w-full h-full animate-spin-slow" style={{ animationDuration: '3s' }}></div>
                </div>
            </div>

            {/* --- 2. BACKGROUND ORBITS & NETWORK --- */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ transform: 'translateZ(10px)' }}>
                <defs>
                    <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(99, 102, 241, 0.8)" />
                        <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                {/* Circles */}
                <circle cx="50%" cy="50%" r="35%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" fill="none" className={isOrbiting ? "animate-spin-slow" : ""} />
                <circle cx="50%" cy="50%" r="50%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" fill="none" />
                <circle cx="50%" cy="50%" r="60%" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1" strokeDasharray="4 8" fill="none" className="animate-spin-slow" style={{ animationDuration: '60s' }} />

                {/* Connecting Lines */}
                {team.map((member, index) => {
                    const pos = getDynamicPosition(index, team.length, rotationAngle);
                    const isHovered = hoveredMemberId === member.id;
                    return (
                        <line 
                            key={`line-${member.id}`}
                            x1="50%" y1="50%" 
                            x2={pos.left} y2={pos.top} 
                            stroke={isHovered ? "url(#beamGradient)" : "rgba(255, 255, 255, 0.05)"}
                            strokeWidth={isHovered ? "2" : "1"}
                            className="transition-all duration-300"
                            style={{ filter: isHovered ? 'url(#glow)' : 'none' }}
                        />
                    );
                })}
            </svg>

            {/* --- 3. TEAM NODES & ENERGY PACKETS --- */}
            {team.map((member, index) => {
                const pos = getDynamicPosition(index, team.length, rotationAngle);
                const delay = index * 0.8; // Stagger animation
                const isHovered = hoveredMemberId === member.id;
                
                return (
                    <React.Fragment key={member.id}>
                        {/* --- ENERGY PACKET (The Light) --- */}
                        <div 
                            className="packet-container"
                            style={{
                                '--target-left': pos.left,
                                '--target-top': pos.top,
                                animationDelay: `${delay}s`
                            } as React.CSSProperties}
                        >
                            <div className="packet-head"></div>
                            <div className="packet-tail"></div>
                        </div>

                        {/* --- NODE WRAPPER --- */}
                        <div
                            className="absolute z-20 cursor-pointer"
                            style={{ 
                                top: pos.top,
                                left: pos.left,
                                transform: `translate(-50%, -50%) translateZ(${pos.speed * 20}px)`,
                            }}
                            onMouseEnter={() => setHoveredMemberId(member.id)}
                            onMouseLeave={() => setHoveredMemberId(null)}
                            onClick={() => onMemberClick(member)}
                        >
                            {/* Main Node Card */}
                            <div className={`
                                relative rounded-full p-[2px] transition-all duration-500 group
                                ${isHovered ? 'scale-125' : 'scale-100'}
                            `}>
                                {/* Rotating Ring (Only visible on hover) */}
                                <div className={`
                                    absolute -inset-4 rounded-full border-t-2 border-l-2 border-indigo-400/0
                                    transition-all duration-500
                                    ${isHovered ? 'border-indigo-400/80 opacity-100 animate-spin' : 'opacity-0'}
                                `} style={{ animationDuration: '3s' }}></div>

                                {/* Reverse Rotating Ring (Only visible on hover) */}
                                <div className={`
                                    absolute -inset-2 rounded-full border-b-2 border-r-2 border-purple-400/0
                                    transition-all duration-500
                                    ${isHovered ? 'border-purple-400/80 opacity-100 animate-spin reverse' : 'opacity-0'}
                                `} style={{ animationDuration: '5s' }}></div>

                                {/* Impact Ripple (The "Reaction" to light) */}
                                <div 
                                    className="absolute inset-0 rounded-full border border-indigo-400 opacity-0 ripple-effect"
                                    style={{ animationDelay: `${delay + 2.5}s` }} 
                                ></div>

                                {/* Image Container */}
                                <div className={`
                                    relative overflow-hidden rounded-full border-2 bg-gray-900
                                    ${isHovered ? 'border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.5)]' : 'border-white/20 shadow-lg'}
                                    transition-all duration-500
                                    ${pos.size}
                                `}>
                                    <img 
                                        src={member.image} 
                                        alt={member.name} 
                                        className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'grayscale-0 scale-110' : 'grayscale scale-100'}`} 
                                    />
                                    
                                    {/* Flash Effect on Image when Packet Hits */}
                                    <div 
                                        className="absolute inset-0 bg-indigo-500/0 mix-blend-overlay flash-effect"
                                        style={{ animationDelay: `${delay + 2.5}s` }}
                                    ></div>
                                </div>

                                {/* Name Tooltip (Always visible slightly, fully on hover) */}
                                <div className={`
                                    absolute left-1/2 -translate-x-1/2 -bottom-8 
                                    transition-all duration-300 transform
                                    ${isHovered ? 'opacity-100 translate-y-0 scale-110' : 'opacity-60 translate-y-[-5px] scale-90'}
                                `}>
                                    <span className={`
                                        text-[10px] font-bold tracking-wider uppercase whitespace-nowrap px-2 py-1 rounded bg-black/50 backdrop-blur-md border border-white/10
                                        ${isHovered ? 'text-indigo-300 border-indigo-500/50' : 'text-gray-400'}
                                    `}>
                                        {member.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>

        <style>{`
            /* 1. Energy Packet Animation (Comet style) */
            @keyframes travel {
                0% { left: 50%; top: 50%; opacity: 0; transform: rotate(var(--angle)) translateX(0) scale(0.5); }
                10% { opacity: 1; transform: rotate(var(--angle)) translateX(20px) scale(1); }
                80% { opacity: 1; transform: scale(1); }
                90% { opacity: 1; }
                100% { left: var(--target-left); top: var(--target-top); opacity: 0; transform: scale(0.2); }
            }

            .packet-container {
                position: absolute;
                width: 4px; 
                height: 4px;
                animation: travel 4s infinite ease-in-out;
                pointer-events: none;
                z-index: 15;
            }

            .packet-head {
                width: 6px;
                height: 6px;
                background: white;
                border-radius: 50%;
                box-shadow: 0 0 10px #fff, 0 0 20px #6366f1, 0 0 30px #a855f7;
                position: absolute;
                top: 0; left: 0;
            }
            
            .packet-tail {
                position: absolute;
                top: 2px; left: 2px;
                width: 40px; /* Tail length */
                height: 2px;
                background: linear-gradient(to left, rgba(99, 102, 241, 0.8), transparent);
                transform-origin: left center;
                transform: rotate(calc(atan2(var(--target-top) - 50%, var(--target-left) - 50%) * 1rad + 180deg));
                opacity: 0.6;
            }

            /* 2. Ripple Effect (Node receiving energy) */
            @keyframes ripple {
                0% { transform: scale(1); opacity: 0; border-width: 0px; }
                10% { opacity: 1; border-width: 2px; border-color: #fff; }
                100% { transform: scale(1.5); opacity: 0; border-width: 0px; border-color: #6366f1; }
            }
            .ripple-effect {
                animation: ripple 4s infinite ease-out; /* Sync with travel duration */
            }

            /* 3. Flash Effect (Node lighting up inside) */
            @keyframes flash {
                0%, 90% { background-color: rgba(99, 102, 241, 0); }
                95% { background-color: rgba(255, 255, 255, 0.5); }
                100% { background-color: rgba(99, 102, 241, 0); }
            }
            .flash-effect {
                animation: flash 4s infinite ease-in-out; /* Sync with travel duration */
            }
        `}</style>
    </div>
  );
};

export default HeroVisuals;
