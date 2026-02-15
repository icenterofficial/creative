import React, { useState, useEffect, useRef } from 'react';
import PageOverlay from './PageOverlay';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { Users, Lightbulb, Heart, Target, Sparkles, Award, Zap, Fingerprint, ArrowRight, ChevronRight } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';
import { MemberDetailModal, AuthorArticlesModal, ArticleDetailModal } from './TeamModals';
import { TeamMember, Post } from '../types';

interface AboutProps {
  onClose: () => void;
}

// Internal CountUp Component
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

// --- Updated Team Stack Component ---
interface TeamStackProps {
    onMemberSelect: (member: TeamMember) => void;
}

const TeamStack: React.FC<TeamStackProps> = ({ onMemberSelect }) => {
    const { team = [] } = useData();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMemberClick = (memberId: string) => {
        const member = team.find(m => m.id === memberId || m.slug === memberId);
        if (member) {
            onMemberSelect(member);
            setIsOpen(false);
        }
    };

    if (team.length === 0) return null;

    const visibleCount = 4;
    const visibleMembers = team.slice(0, visibleCount);
    // Get only the members that are NOT visible for the dropdown
    const hiddenMembers = team.slice(visibleCount);
    const remainingCount = team.length - visibleCount;

    return (
        <div className="relative inline-flex items-center z-[50]" ref={dropdownRef}>
            <div className="flex -space-x-4 hover:space-x-1 transition-all duration-300">
                {visibleMembers.map((member) => (
                    <div 
                        key={member.id}
                        onClick={() => handleMemberClick(member.id)}
                        className="relative w-12 h-12 rounded-full border-2 border-gray-900 overflow-hidden cursor-pointer hover:scale-110 hover:z-20 hover:border-indigo-500 transition-all duration-300 bg-gray-800"
                        title={member.name}
                    >
                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                ))}
                
                {remainingCount > 0 && (
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className={`relative w-12 h-12 rounded-full border-2 border-gray-900 bg-gray-800 text-white text-xs font-bold flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-400 hover:scale-110 hover:z-20 transition-all duration-300 cursor-pointer ${isOpen ? 'bg-indigo-600 border-indigo-400 z-30' : ''}`}
                    >
                        +{remainingCount}
                    </button>
                )}
            </div>

            {/* Dropdown Menu - High Z-Index to float above everything */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl overflow-hidden z-[9999] animate-fade-in border border-gray-200">
                    <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">More Members</span>
                        <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">{hiddenMembers.length}</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {/* Only map hidden members */}
                        {hiddenMembers.map((member) => (
                            <button
                                key={member.id}
                                onClick={() => handleMemberClick(member.id)}
                                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-indigo-50 transition-colors group text-left"
                            >
                                <img src={member.image} alt={member.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate group-hover:text-indigo-700">{member.name}</p>
                                    <p className="text-[10px] text-gray-500 truncate">{member.role}</p>
                                </div>
                                <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-400" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
            `}</style>
        </div>
    );
};


const About: React.FC<AboutProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const { team = [], insights = [] } = useData();

  // Local State for Modals (nested within About)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [authorPosts, setAuthorPosts] = useState<Post[] | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handleShowArticles = (member: TeamMember) => {
    if (!insights) return;
    const posts = insights.filter(p => p.authorId === member.id);
    setAuthorPosts(posts);
  };

  return (
    <PageOverlay title={t("The Vision", "ចក្ខុវិស័យ")} bgText="ABOUT" onClose={onClose}>
        {/* Main Content Wrapper with Blur Effect */}
        <div className={`transition-all duration-500 ease-in-out ${selectedMember || selectedPost ? 'blur-md brightness-50 pointer-events-none select-none' : ''}`}>
            <div className="max-w-7xl mx-auto pb-20">
                
                {/* 1. Hero Section: Big Typography & Gradient */}
                <div className="relative py-20 mb-20 text-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
                    
                    <RevealOnScroll variant="zoom-in" duration={800}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-bold tracking-wider mb-6 backdrop-blur-md">
                            <Sparkles size={14} /> 
                            <span className="font-khmer">{t("Since 2020", "បង្កើតឡើងតាំងពីឆ្នាំ ២០២០")}</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 font-khmer">
                            WE DON'T JUST <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">DESIGN.</span> WE <br />
                            <span className="relative inline-block">
                                DEFINE.
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-indigo-500" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                                </svg>
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-khmer">
                            {t(
                                "Ponloe Creative is a digital alchemy lab where code meets art, and imagination becomes infrastructure.",
                                "Ponloe Creative គឺជាមន្ទីរពិសោធន៍គីមីសាស្ត្រឌីជីថល ដែលកូដជួបជាមួយសិល្បៈ ហើយការស្រមើលស្រមៃក្លាយជាហេដ្ឋារចនាសម្ព័ន្ធពិតប្រាកដ។"
                            )}
                        </p>
                    </RevealOnScroll>
                </div>

                {/* 2. Bento Grid Layout for "Who We Are" */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
                    {/* Card 1: Main Story (Large) */}
                    <RevealOnScroll variant="fade-up" delay={100} className="md:col-span-2 row-span-2">
                        <div className="h-full bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-12 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-500">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] group-hover:bg-purple-500/20 transition-all"></div>
                            <Fingerprint size={48} className="text-white mb-6 relative z-10" />
                            <h2 className="text-3xl font-bold text-white mb-6 font-khmer">{t("Our Identity", "អត្តសញ្ញាណរបស់យើង")}</h2>
                            <div className="space-y-6 text-gray-400 text-lg leading-relaxed font-khmer relative z-10">
                                <p>
                                    {t(
                                        "Born in the vibrant heart of Phnom Penh, we saw a digital landscape waiting to be painted. We aren't just a service provider; we are partners in your legacy.",
                                        "កើតនៅក្នុងបេះដូងដ៏រស់រវើកនៃរាជធានីភ្នំពេញ យើងបានឃើញទេសភាពឌីជីថលដែលរង់ចាំការកែច្នៃ។ យើងមិនមែនគ្រាន់តែជាអ្នកផ្តល់សេវាកម្មនោះទេ យើងគឺជាដៃគូក្នុងកេរដំណែលរបស់អ្នក។"
                                    )}
                                </p>
                                <p>
                                    {t(
                                        "Our team is a fusion of architects, developers, and artists who believe that every pixel matters and every line of code should have a purpose.",
                                        "ក្រុមរបស់យើងគឺជាការរួមបញ្ចូលគ្នានៃស្ថាបត្យករ អ្នកអភិវឌ្ឍន៍ និងសិល្បករ ដែលជឿជាក់ថារាល់ភីកសែលសុទ្ធតែសំខាន់ ហើយរាល់បន្ទាត់កូដគួរតែមានគោលបំណងច្បាស់លាស់។"
                                    )}
                                </p>
                            </div>
                            {/* Decorative Line */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    </RevealOnScroll>

                    {/* Card 2: Stat 1 */}
                    <RevealOnScroll variant="slide-left" delay={200} className="md:col-span-1">
                        <div className="h-full bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[32px] p-8 text-white flex flex-col justify-center relative overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            <Award size={32} className="mb-4 text-white/80" />
                            <h3 className="text-5xl font-black mb-2"><CountUp end={50} duration={2000} suffix="+" /></h3>
                            <p className="font-bold opacity-80 uppercase tracking-wider text-sm font-khmer">{t("Projects Delivered", "គម្រោងបានបញ្ចប់")}</p>
                        </div>
                    </RevealOnScroll>

                    {/* Card 3: Creative Experts (Updated with TeamStack) */}
                    <RevealOnScroll variant="slide-left" delay={300} className="md:col-span-1">
                        <div className="h-full bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 flex flex-col justify-between group hover:bg-white/5 transition-all">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-4xl font-black text-white mb-1"><CountUp end={team.length} duration={2000} suffix="+" /></h3>
                                    <p className="text-gray-400 font-bold uppercase tracking-wider text-xs font-khmer">{t("Experts", "អ្នកជំនាញ")}</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-full text-pink-400">
                                    <Users size={20} />
                                </div>
                            </div>
                            
                            {/* Interactive Avatar Stack with High Z-Index Parent */}
                            <div className="pt-6 relative z-[50]">
                                <TeamStack onMemberSelect={(member) => setSelectedMember(member)} />
                                <p className="text-gray-500 text-[10px] mt-3 font-khmer relative z-[40]">
                                    {t("Meet the visionaries behind the magic.", "ជួបជាមួយអ្នកបង្កើតភាពអស្ចារ្យ។")}
                                </p>
                            </div>
                        </div>
                    </RevealOnScroll>
                </div>

                {/* 3. The "DNA" Section (Values) */}
                <div className="mb-24">
                    <RevealOnScroll>
                        <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-8">
                            <div>
                                <span className="text-indigo-400 font-bold tracking-widest uppercase text-xs mb-2 block font-khmer">{t("Our DNA", "DNA របស់យើង")}</span>
                                <h2 className="text-4xl font-bold text-white font-khmer">{t("Core Values", "គុណតម្លៃស្នូល")}</h2>
                            </div>
                            <div className="hidden md:block text-right">
                                <p className="text-gray-400 text-sm max-w-xs">{t("Principles that guide every decision we make.", "គោលការណ៍ដែលដឹកនាំរាល់ការសម្រេចចិត្តរបស់យើង។")}</p>
                            </div>
                        </div>
                    </RevealOnScroll>

                    <div className="grid md:grid-cols-4 gap-4">
                        {[
                            { icon: <Zap />, title: "Speed", desc: "Fast execution without compromising quality.", color: "text-yellow-400" },
                            { icon: <Heart />, title: "Passion", desc: "We truly love what we build.", color: "text-red-400" },
                            { icon: <Target />, title: "Precision", desc: "Attention to the smallest detail.", color: "text-green-400" },
                            { icon: <Lightbulb />, title: "Innovation", desc: "Always exploring what's next.", color: "text-blue-400" }
                        ].map((val, idx) => (
                            <RevealOnScroll key={idx} delay={idx * 100} variant="fade-up">
                                <div className="group h-64 bg-gray-900 border border-white/5 hover:border-white/20 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                                    <div className={`absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-150 duration-500 ${val.color}`}>
                                        {React.cloneElement(val.icon as React.ReactElement<any>, { size: 120 })}
                                    </div>
                                    <div className={`p-3 bg-white/5 w-fit rounded-xl ${val.color}`}>
                                        {val.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">{val.title}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">{val.desc}</p>
                                    </div>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>

                {/* 4. Visual Strip / Gallery */}
                <RevealOnScroll variant="grow-x" duration={1000}>
                    <div className="h-64 md:h-80 w-full rounded-[32px] overflow-hidden relative mb-24 group">
                        <img 
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2000" 
                            alt="Team Culture" 
                            className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-indigo-900/60 mix-blend-multiply"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">CULTURE</h2>
                                <p className="text-indigo-200 font-mono tracking-widest uppercase text-sm">Phnom Penh, Cambodia</p>
                            </div>
                        </div>
                    </div>
                </RevealOnScroll>

                {/* 5. CTA Footer */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-8 font-khmer">{t("Ready to make history?", "ត្រៀមខ្លួនបង្កើតប្រវត្តិសាស្ត្រហើយឬនៅ?")}</h2>
                    <button 
                        onClick={() => { onClose(); window.location.hash = '#contact'; }}
                        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-all overflow-hidden"
                    >
                        <span className="relative z-10 font-khmer">{t("Start Your Project", "ចាប់ផ្តើមគម្រោងរបស់អ្នក")}</span>
                        <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    </button>
                </div>
            </div>
        </div>

        {/* Nested Modals */}
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
             onSelectPost={(post) => setSelectedPost(post)}
          />
        )}

        {selectedPost && (
          <ArticleDetailModal 
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
          />
        )}
    </PageOverlay>
  );
};

export default About;
