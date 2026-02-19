
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
            {/* Inner Circle */}
            <circle cx="50%" cy="50%" r="35%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" fill="none" className={isOrbiting ? "animate-spin-slow" : ""} />
            {/* Middle Circle */}
            <circle cx="50%" cy="50%" r="50%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" fill="none" className={isOrbiting ? "animate-spin-slow reverse" : ""} style={{ animationDirection: 'reverse', animationDuration: '20s' }} />
            {/* NEW: Outer Network Circle */}
            <circle cx="50%" cy="50%" r="65%" stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="10 10" fill="none" className={isOrbiting ? "animate-spin-slow" : ""} style={{ animationDuration: '40s' }} />
            
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

        {/* Team Nodes & Light Packets */}
        {team.map((member, index) => {
            const pos = getDynamicPosition(index, team.length, rotationAngle);
            const delay = index * 0.5; // Stagger animation start times
            
            return (
                <React.Fragment key={member.id}>
                    {/* Light Packet (Energy Flow) */}
                    <div 
                        className="packet"
                        style={{
                            '--target-left': pos.left,
                            '--target-top': pos.top,
                            animationDelay: `${delay}s`
                        } as React.CSSProperties}
                    />

                    {/* Node */}
                    <div
                        className="absolute z-20 cursor-pointer"
                        style={{ 
                            top: pos.top,
                            left: pos.left,
                            marginLeft: `-${parseInt(pos.size.split(' ')[0].replace('w-', '')) * 2}px`, 
                            marginTop: `-${parseInt(pos.size.split(' ')[1].replace('h-', '')) * 2}px`,
                            transform: `translateZ(${pos.speed * 30}px)`
                        }}
                        onClick={() => onMemberClick(member)}
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
                </React.Fragment>
            );
        })}
        </div>

        <style>{`
            @keyframes travel {
                0% { left: 50%; top: 50%; opacity: 0; transform: scale(0.2); }
                10% { opacity: 1; transform: scale(1); }
                80% { opacity: 1; transform: scale(1); }
                100% { left: var(--target-left); top: var(--target-top); opacity: 0; transform: scale(0.2); }
            }
            .packet {
                position: absolute;
                width: 4px;
                height: 4px;
                background: #fff;
                border-radius: 50%;
                box-shadow: 0 0 8px #60A5FA, 0 0 15px #818CF8;
                animation: travel 3s infinite linear;
                pointer-events: none;
                z-index: 15;
            }
        `}</style>
    </div>
  );
};

export default HeroVisuals;
