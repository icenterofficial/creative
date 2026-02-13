import React, { useState, useEffect } from 'react';
import { Facebook, Send, FileText, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { TeamMember, Post } from '../types';
import ScrollBackgroundText from './ScrollBackgroundText';
import { MemberDetailModal, AuthorArticlesModal, ArticleDetailModal } from './TeamModals';
import RevealOnScroll from './RevealOnScroll';
import { useRouter } from '../hooks/useRouter';

const Team: React.FC = () => {
  const { t } = useLanguage();
  const { team, insights } = useData();
  
  // Use Router Hook: Section 'team', Prefix 't' (e.g. t1 -> 1)
  const { activeId, openItem, closeItem } = useRouter('team', 't');
  
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [authorPosts, setAuthorPosts] = useState<Post[] | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Sync Router Active ID with Data
  useEffect(() => {
      if (activeId) {
          const found = team.find(m => m.id === activeId);
          setSelectedMember(found || null);
      } else {
          setSelectedMember(null);
      }
  }, [activeId, team]);

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
  
  const getPostCount = (memberId: string) => {
      return insights.filter(post => post.authorId === memberId).length;
  };

  return (
    <section id="team" className="py-24 bg-gray-950 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      
      {/* Background Text */}
      <ScrollBackgroundText text="VISIONARIES" className="top-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll>
          <div className="text-center mb-20">
            <span className="text-indigo-400 font-bold tracking-wider uppercase text-sm font-khmer">{t('The Minds', 'អ្នកដឹកនាំ')}</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white font-khmer">
              {t('Meet the', 'ជួបជាមួយ')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{t('Visionaries', 'ចក្ខុវិស័យ')}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member) => {
              const postCount = getPostCount(member.id);
              return (
                <div 
                  key={member.id} 
                  className="group relative bg-white/5 rounded-2xl p-6 border border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => openItem(member.id)}
                >
                  <div className="absolute top-4 right-4 text-gray-500 group-hover:text-indigo-400 transition-colors">
                      <Info size={20} />
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-indigo-500 transition-colors relative z-10 bg-gray-900 shrink-0">
                        <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{member.name}</h3>
                        <p className="text-gray-400 text-sm font-khmer mb-2">{t(member.role, member.roleKm)}</p>
                        
                        {postCount > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-900/50 border border-indigo-500/30 text-indigo-200 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                <FileText size={10} /> {postCount} {t('Articles', 'អត្ថបទ')}
                            </span>
                        )}
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3 pt-6 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                    {member.socials.facebook && (
                      <a href={member.socials.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-[#1877F2] hover:text-white transition-all">
                        <Facebook size={18} />
                      </a>
                    )}
                    {member.socials.telegram && (
                      <a href={member.socials.telegram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-[#229ED9] hover:text-white transition-all">
                        <Send size={18} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </RevealOnScroll>
      </div>

      {/* Modals */}
      {selectedMember && (
          <MemberDetailModal 
            member={selectedMember} 
            onClose={closeItem}
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

export default Team;
