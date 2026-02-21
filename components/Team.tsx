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
  
  // Use Router Hook: Section 'team', No prefix
  const { activeId, openItem, closeItem } = useRouter('team');
  
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [authorPosts, setAuthorPosts] = useState<Post[] | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Sync Router Active ID with Data
  useEffect(() => {
      if (activeId) {
          const found = team.find(m => m.slug === activeId || m.id === activeId);
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {team.map((member) => {
              const postCount = getPostCount(member.id);
              return (
                <div 
                  key={member.id} 
                  className="group relative bg-gray-900 rounded-3xl overflow-hidden border border-white/10 hover:border-indigo-500/50 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
                  onClick={() => openItem(member.slug || member.id)}
                >
                  {/* Cover Image Section */}
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-indigo-600/20 to-purple-600/20">
                    {member.coverImage ? (
                      <img 
                        src={member.coverImage} 
                        alt={`${member.name} cover`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20" />
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

                    {/* Info Icon */}
                    <div className="absolute top-4 right-4 text-gray-400 group-hover:text-indigo-400 transition-colors z-10">
                      <Info size={20} />
                    </div>
                  </div>

                  {/* Content Section - Horizontal Layout */}
                  <div className="relative px-6 py-6 flex gap-6">
                    {/* Profile Image */}
                    <div className="flex-shrink-0 -mt-20">
                      <div className="w-28 h-28 rounded-full border-4 border-gray-900 overflow-hidden bg-gray-800 group-hover:border-indigo-500 transition-colors shadow-lg">
                        <img 
                          src={member.image} 
                          alt={member.name}
                          className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                      </div>
                    </div>

                    {/* Member Info - Right Side */}
                    <div className="flex-1 flex flex-col justify-start pt-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight">{member.name}</h3>
                      <p className="text-indigo-400 text-sm font-khmer mb-3 line-clamp-2">{t(member.role, member.roleKm)}</p>
                      
                      {postCount > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-900/50 border border-indigo-500/30 text-indigo-200 text-[11px] font-bold uppercase tracking-wider shadow-sm w-fit">
                          <FileText size={11} /> {postCount} {t('Articles', 'អត្ថបទ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Social Links - Bottom */}
                  <div className="px-6 pb-6 flex gap-3 pt-4 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
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
             onSelectPost={(post) => setSelectedPost(post)}
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
