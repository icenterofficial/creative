
import React, { useRef, useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import { MemberDetailModal, AuthorArticlesModal, ArticleDetailModal } from '../TeamModals';
import { TeamMember, Post } from '../../types';

import HeroActions from './HeroActions';
import HeroVisuals from './HeroVisuals';

const Hero: React.FC = () => {
  const { t } = useLanguage();
  const { team = [], insights = [] } = useData(); 
  
  // Modal States
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [authorPosts, setAuthorPosts] = useState<Post[] | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Parallax Refs for Background
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <section ref={containerRef} id="home" className="relative min-h-screen flex items-center pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden perspective-1000">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div 
            className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] opacity-60"
        />
        <div 
            className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] opacity-60"
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
                    
                    {/* Simplified: No more complex JS animation, just pure text for stability */}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-lg pb-2 inline-block">
                        {t('Digital Perfection', 'ភាពល្អឥតខ្ចោះ')}
                    </span>
                </h1>

                {/* Subtitle */}
                <div className="text-2xl md:text-3xl font-bold font-khmer text-white/90 leading-relaxed mt-2" style={{ textShadow: '0 0 20px rgba(168, 85, 247, 0.4)' }}>
                    {t(
                        'Transforming ideas into reality.',
                        'បំប្លែងគំនិតទៅជាការពិត' 
                    )}
                </div>
            </div>
            
            <p className="text-lg text-gray-400 leading-relaxed font-khmer max-w-xl mx-auto lg:mx-0">
              {t(
                  'We are a team of architects, developers, and artists building the future of Cambodia\'s digital landscape.',
                  'ក្រុមការងារស្ថាបត្យករ អ្នកអភិវឌ្ឍន៍ និងសិល្បករ ដែលកំពុងកសាងអនាគតនៃវិស័យឌីជីថលនៅកម្ពុជា។'
              )}
            </p>
            
            {/* Actions Component (Buttons & Stats) */}
            <HeroActions t={t} />
          </div>
          
          {/* Right Content - Visuals */}
          <HeroVisuals team={team} onMemberClick={setSelectedMember} />
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
