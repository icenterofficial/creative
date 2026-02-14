import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Calendar, Tag, X, User, FileText, Code, Briefcase } from 'lucide-react';
import { Post, TeamMember } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import ScrollBackgroundText from './ScrollBackgroundText';
import RevealOnScroll from './RevealOnScroll';
import { AuthorArticlesModal, ArticleDetailModal, MemberDetailModal } from './TeamModals';
import { useRouter } from '../hooks/useRouter';

const Insights: React.FC = () => {
  const { t } = useLanguage();
  const { insights, team } = useData();

  // Use Router Hook for Posts: Section 'insights', No prefix
  const { activeId, openItem, closeItem } = useRouter('insights');
  
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<TeamMember | null>(null);
  const [authorPosts, setAuthorPosts] = useState<Post[] | null>(null);
  
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  // Sync Router Active ID with Data (Support finding by ID or Slug)
  useEffect(() => {
      if (activeId) {
          const found = insights.find(p => p.slug === activeId || p.id === activeId);
          setSelectedPost(found || null);
      } else {
          setSelectedPost(null);
      }
  }, [activeId, insights]);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (selectedPost || isViewAllOpen || selectedAuthor || authorPosts) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPost, isViewAllOpen, selectedAuthor, authorPosts]);

  const handleAuthorClick = (authorId: string) => {
    const author = team.find(t => t.id === authorId);
    if (author) {
      setSelectedAuthor(author);
    }
  };

  const getAuthorName = (authorId: string) => {
    const author = team.find(t => t.id === authorId);
    return author ? author.name : 'Ponloe Team';
  };
  
  const handleShowArticles = (member: TeamMember) => {
      const posts = insights.filter(p => p.authorId === member.id);
      setAuthorPosts(posts);
  };

  return (
    <section id="insights" className="py-24 bg-gray-950 relative overflow-hidden">
        {/* Background Decorative Blob */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Background Text */}
        <ScrollBackgroundText text="JOURNAL" className="top-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll>
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
             <div className="max-w-2xl">
                <span className="text-indigo-400 font-bold tracking-wider uppercase text-sm mb-4 block font-khmer">{t('Our Journal', 'អត្ថបទរបស់យើង')}</span>
                <h2 className="text-4xl md:text-5xl font-bold text-white font-khmer">
                  {t('Insights &', 'ចំណេះដឹង &')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{t('Articles', 'អត្ថបទ')}</span>
                </h2>
                <p className="mt-4 text-gray-400 text-lg font-khmer">
                    {t('Sharing knowledge, technology, and creative ideas.', 'ចែករំលែកចំណេះដឹង បច្ចេកវិទ្យា និងគំនិតច្នៃប្រឌិត។')}
                </p>
             </div>
             
             <button 
               onClick={() => setIsViewAllOpen(true)}
               className="hidden md:flex items-center gap-2 text-white hover:text-indigo-400 transition-colors font-bold group font-khmer cursor-pointer"
             >
                {t('View All Posts', 'មើលអត្ថបទទាំងអស់')} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>

          {/* Display only first 3 items on the main page */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {insights.slice(0, 3).map((post) => (
              <article 
                key={post.id} 
                className="group flex flex-col h-full bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                onClick={() => openItem(post.slug || post.id)}
              >
                {/* Image Container */}
                <div className="relative h-60 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-indigo-600/80 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-white/10">
                      <Tag size={12} /> {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-3 font-mono">
                    <Calendar size={12} />
                    <span>{post.date}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2 font-khmer">
                    {t(post.title, post.titleKm)}
                  </h3>
                  
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-1 font-khmer">
                    {post.excerpt}
                  </p>

                  <div className="pt-6 border-t border-white/5">
                     <button 
                       onClick={(e) => { e.stopPropagation(); openItem(post.slug || post.id); }}
                       className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-indigo-400 transition-colors font-khmer"
                     >
                       {t('Read Article', 'អានអត្ថបទ')} <ArrowRight size={16} />
                     </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 md:hidden text-center">
               <button 
                  onClick={() => setIsViewAllOpen(true)}
                  className="inline-flex items-center gap-2 text-white hover:text-indigo-400 transition-colors font-bold font-khmer cursor-pointer"
               >
                {t('View All Posts', 'មើលអត្ថបទទាំងអស់')} <ArrowRight />
             </button>
          </div>
        </RevealOnScroll>
      </div>

      {/* "View All Posts" Modal */}
      {isViewAllOpen && createPortal(
         <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-gray-950/95 backdrop-blur-md animate-fade-in"
                onClick={() => setIsViewAllOpen(false)}
            />
             <div className="relative w-full max-w-7xl h-full md:h-[90vh] bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scale-up flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 md:p-8 border-b border-white/10 bg-gray-900 z-10">
                    <div>
                        <h3 className="text-2xl font-bold text-white font-khmer">{t('All Articles', 'អត្ថបទទាំងអស់')}</h3>
                        <p className="text-gray-400 text-sm font-khmer">{t('Explore our latest thoughts and updates', 'ស្វែងរកគំនិត និងព័ត៌មានថ្មីៗរបស់យើង')}</p>
                    </div>
                    <button 
                        onClick={() => setIsViewAllOpen(false)}
                        className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/5"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Grid Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-hide">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {insights.map((post) => (
                             <article 
                                key={post.id} 
                                className="group flex flex-col bg-white/5 border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                onClick={() => openItem(post.slug || post.id)}
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img 
                                        src={post.image} 
                                        alt={post.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <span className="px-2 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-white/10">
                                            <Tag size={10} /> {post.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                     <div className="flex items-center gap-2 text-gray-400 text-xs mb-2 font-mono">
                                        <Calendar size={12} />
                                        <span>{post.date}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2 font-khmer">
                                        {t(post.title, post.titleKm)}
                                    </h3>
                                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 flex-1 font-khmer">
                                        {post.excerpt}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
             </div>
         </div>,
         document.body
      )}

      {/* Reused Modals from Team Section for seamless experience */}
      {selectedPost && (
          <ArticleDetailModal 
            post={selectedPost}
            onClose={closeItem}
            onAuthorClick={handleAuthorClick}
          />
      )}
      
      {selectedAuthor && (
          <MemberDetailModal 
            member={selectedAuthor} 
            onClose={() => setSelectedAuthor(null)}
            onShowArticles={handleShowArticles}
          />
      )}

      {authorPosts && selectedAuthor && (
          <AuthorArticlesModal 
             author={selectedAuthor}
             posts={authorPosts}
             onClose={() => setAuthorPosts(null)}
             onSelectPost={(post) => {
                 setAuthorPosts(null);
                 openItem(post.slug || post.id);
             }}
          />
      )}
    </section>
  );
};

export default Insights;
