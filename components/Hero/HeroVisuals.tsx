
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TeamMember } from '../../types';

interface HeroVisualsProps {
    team: TeamMember[];
    onMemberClick: (member: TeamMember) => void;
}

const HeroVisuals: React.FC<HeroVisualsProps> = ({ team, onMemberClick }) => {
  const [isOrbiting, setIsOrbiting] = useState(true);
  const [isCoreHovered, setIsCoreHovered] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);
  
  const animationRef = useRef<number>(0);
  const constellationRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const mouse = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });

  const particles = useMemo(() => {
      return Array.from({ length: 30 }).map((_, i) => ({
          x: Math.random() * 100,
          y: Math.random() * 100,
          z: Math.random() * 100 - 50,
          size: Math.random() * 3 + 1,
          duration: Math.random() * 10 + 10
      }));
  }, []);

  useEffect(() => {
    const animateRotation = () => {
        if (isOrbiting) {
            const speed = isCoreHovered ? 0.01 : 0.002;
            setRotationAngle(prev => prev + speed); 
            animationRef.current = requestAnimationFrame(animateRotation);
        }
    };

    if (isOrbiting) {
        animationRef.current = requestAnimationFrame(animateRotation);
    } else {
        cancelAnimationFrame(animationRef.current);
    }

    return () => cancelAnimationFrame(animationRef.current);
  }, [isOrbiting, isCoreHovered]);

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
        }

        requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const getDynamicPosition = (index: number, total: number, currentRotation: number) => {
      const angle = (index / total) * 2 * Math.PI - (Math.PI / 2) + currentRotation;
      const radiusBase = 38; 
      const radiusVar = (index % 2 === 0 ? 4 : -4);
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
            {particles.map((p, i) => (
                <div
                    key={i}
                    className="absolute bg-white/20 rounded-full animate-float-particle"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        transform: `translateZ(${p.z}px)`,
                        animationDuration: `${p.duration}s`,
                        boxShadow: `0 0 ${p.size * 2}px rgba(255,255,255,0.3)`
                    }}
                />
            ))}

            {/* --- 1. CENTER CORE (PONLOE LOGO) --- */}
            <div 
                className="absolute z-10 cursor-pointer group/core"
                style={{ transform: 'translateZ(30px)' }}
                onMouseEnter={() => setIsCoreHovered(true)}
                onMouseLeave={() => setIsCoreHovered(false)}
                onClick={() => setIsOrbiting(!isOrbiting)}
            >
                {/* Core Energy Field (ពន្លឺជុំវិញ) */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[60px] transition-all duration-500 ${isCoreHovered || !isOrbiting ? 'scale-150 opacity-90' : 'scale-100 opacity-40 animate-pulse'}`}></div>
                
                {/* ស្រទាប់ពន្លឺបន្ថែមពេលចុច (Active Glow) */}
                {!isOrbiting && (
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-400/30 rounded-full blur-[40px] animate-pulse"></div>
                )}

                {/* Core Physical Object */}
                <div className={`relative w-28 h-28 bg-gray-950/80 backdrop-blur-xl border-2 transition-all duration-500 rounded-full flex flex-col items-center justify-center z-20 animate-float ${isCoreHovered || !isOrbiting ? 'border-indigo-300 shadow-[0_0_80px_rgba(99,102,241,0.8)] scale-110' : 'border-white/10'}`}>
                    
                    {/* SVG LOGO ថ្មី - Increased size from w-14 to w-20 */}
                    <svg viewBox="0 0 2160 2160" className={`w-20 h-20 transition-all duration-500 ${isCoreHovered || !isOrbiting ? 'scale-115 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'opacity-70'}`}>
                        <defs>
                            <linearGradient id="core_gradient" gradientUnits="userSpaceOnUse" x1="1269.9144" y1="1075.2654" x2="892.25574" y2="1103.478">
                                <stop offset="0" stopColor="#5555F9"/><stop offset="1" stopColor="#2D86FF"/>
                            </linearGradient>
                        </defs>
                        <path fill="url(#core_gradient)" d="M1059.04 933.134C1062.61 919.977 1067.51 888.023 1076.25 880.968C1092.44 877.391 1098.51 929.642 1102.9 942.387C1114.81 976.95 1123.86 1005.88 1154.09 1030.14C1186.56 1056.2 1230.43 1067.48 1270.71 1075.99C1276.06 1077.13 1285.53 1079.41 1285.89 1086.01C1287.02 1097.14 1264.91 1099.6 1256.56 1101.5C1211.8 1111.73 1159.49 1124.78 1131.88 1164.55C1106.07 1201.74 1100.82 1241.65 1089.83 1283.86C1088.16 1290.25 1079.56 1296.05 1074.16 1289.14C1069.17 1282.31 1068.01 1269.09 1065.53 1261.18C1051.09 1201.97 1038.59 1153.13 979.073 1125.88C958.148 1115.76 937.804 1109.87 915.413 1104.41C905.678 1102.04 880.128 1098.46 874.5 1090.95C873.607 1087.93 873.481 1088.28 874.045 1085.21C874.468 1082.92 877.832 1078.88 879.831 1078.27C889.391 1075.35 900.543 1073.06 910.179 1070.54C937.237 1063.49 961.511 1056.04 986.191 1042.59C1032.25 1017.49 1045.4 980.701 1059.04 933.134ZM879.378 1088.75C879.819 1088.87 883.698 1089.61 883.798 1089.57C900.292 1083.02 917.27 1078.43 934.024 1072.79C937.349 1071.67 936.82 1071.39 937.72 1069.09C927.333 1072.15 885.541 1083.41 879.378 1088.75ZM1072.86 910.995C1074.28 905.7 1080.69 888.634 1080.67 886.444C1079.73 884.986 1079.69 884.58 1078.42 883.515C1075.68 887.219 1069.81 907.215 1071.53 911.103L1072.86 910.995Z"/>
                    </svg>
                    
                    {/* High-speed Ring (Visible on hover/click) */}
                    <div className={`absolute inset-0 rounded-full border-t-2 border-indigo-400 w-full h-full ${isCoreHovered || !isOrbiting ? 'animate-spin-super-fast opacity-100' : 'opacity-0'}`}></div>
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

                <circle cx="50%" cy="50%" r="35%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" fill="none" className={isOrbiting ? "animate-spin-slow" : ""} style={{ animationDuration: isCoreHovered ? '5s' : '20s' }} />
                <circle cx="50%" cy="50%" r="50%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" fill="none" />
                <circle cx="50%" cy="50%" r="60%" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1" strokeDasharray="4 8" fill="none" className="animate-spin-slow" style={{ animationDuration: isCoreHovered ? '10s' : '60s' }} />

                {team.map((member, index) => {
                    const pos = getDynamicPosition(index, team.length, rotationAngle);
                    const isHovered = hoveredMemberId === member.id;
                    const isCoreActive = isCoreHovered || !isOrbiting;
                    
                    return (
                        <line 
                            key={`line-${member.id}`}
                            x1="50%" y1="50%" 
                            x2={pos.left} y2={pos.top} 
                            stroke={isHovered || isCoreActive ? "url(#beamGradient)" : "rgba(255, 255, 255, 0.05)"}
                            strokeWidth={isHovered || isCoreActive ? "2" : "1"}
                            className="transition-all duration-300"
                            style={{ filter: isHovered || isCoreActive ? 'url(#glow)' : 'none' }}
                        />
                    );
                })}
            </svg>

            {/* --- 3. TEAM NODES & ENERGY PACKETS --- */}
            {team.map((member, index) => {
                const pos = getDynamicPosition(index, team.length, rotationAngle);
                const delay = index * 0.8; 
                const isHovered = hoveredMemberId === member.id;
                const tiltX = (smoothMouse.current.y * 15);
                const tiltY = -(smoothMouse.current.x * 15);

                return (
                    <React.Fragment key={member.id}>
                        <div 
                            className="packet-container"
                            style={{
                                '--target-left': pos.left,
                                '--target-top': pos.top,
                                animationDuration: isCoreHovered || !isOrbiting ? '1s' : '4s',
                                animationDelay: `${delay}s`
                            } as React.CSSProperties}
                        >
                            <div className="packet-head" style={{ boxShadow: isCoreHovered || !isOrbiting ? '0 0 15px #fff, 0 0 30px cyan' : '' }}></div>
                            <div className="packet-tail"></div>
                        </div>

                        <div
                            className="absolute z-20 cursor-pointer"
                            style={{ 
                                top: pos.top,
                                left: pos.left,
                                transform: `translate(-50%, -50%) translateZ(${pos.speed * 20}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
                                transition: 'transform 0.1s ease-out'
                            }}
                            onMouseEnter={() => setHoveredMemberId(member.id)}
                            onMouseLeave={() => setHoveredMemberId(null)}
                            onClick={() => onMemberClick(member)}
                        >
                            <div className={`
                                relative rounded-full p-[2px] transition-all duration-500 group
                                ${isHovered ? 'scale-125 z-50' : 'scale-100'}
                            `}>
                                <div className={`absolute -inset-4 rounded-full border-t-2 border-l-2 border-indigo-400/0 transition-all duration-500 ${isHovered ? 'border-indigo-400/80 opacity-100 animate-spin' : 'opacity-0'}`} style={{ animationDuration: '3s' }}></div>
                                <div className={`absolute -inset-2 rounded-full border-b-2 border-r-2 border-purple-400/0 transition-all duration-500 ${isHovered ? 'border-purple-400/80 opacity-100 animate-spin reverse' : 'opacity-0'}`} style={{ animationDuration: '5s' }}></div>

                                <div className="absolute inset-0 rounded-full border border-indigo-400 opacity-0 ripple-effect" style={{ animationDelay: `${delay + 2.5}s`, animationDuration: isCoreHovered || !isOrbiting ? '1s' : '4s' }}></div>

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
                                    <div className="absolute inset-0 bg-indigo-500/0 mix-blend-overlay flash-effect" style={{ animationDelay: `${delay + 2.5}s`, animationDuration: isCoreHovered || !isOrbiting ? '1s' : '4s' }}></div>
                                </div>

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
                width: 40px; 
                height: 2px;
                background: linear-gradient(to left, rgba(99, 102, 241, 0.8), transparent);
                transform-origin: left center;
                transform: rotate(calc(atan2(var(--target-top) - 50%, var(--target-left) - 50%) * 1rad + 180deg));
                opacity: 0.6;
            }
            @keyframes ripple {
                0% { transform: scale(1); opacity: 0; border-width: 0px; }
                10% { opacity: 1; border-width: 2px; border-color: #fff; }
                100% { transform: scale(1.5); opacity: 0; border-width: 0px; border-color: #6366f1; }
            }
            .ripple-effect {
                animation: ripple 4s infinite ease-out;
            }
            @keyframes flash {
                0%, 90% { background-color: rgba(99, 102, 241, 0); }
                95% { background-color: rgba(255, 255, 255, 0.5); }
                100% { background-color: rgba(99, 102, 241, 0); }
            }
            .flash-effect {
                animation: flash 4s infinite ease-in-out;
            }
            @keyframes spin-super-fast {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .animate-spin-super-fast {
                animation: spin-super-fast 0.5s linear infinite;
            }
            @keyframes float-particle {
                0%, 100% { transform: translateY(0) translateZ(0); opacity: 0.2; }
                50% { transform: translateY(-20px) translateZ(20px); opacity: 0.5; }
            }
            .animate-float-particle {
                animation: float-particle 10s ease-in-out infinite;
            }
        `}</style>
    </div>
  );
};

export default HeroVisuals;
