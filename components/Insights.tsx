import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Calendar, Tag, X, User, Share2, Facebook, Send, Copy, Check, Search, Code, Briefcase, FileText, MessageCircle, MoreHorizontal, ThumbsUp } from 'lucide-react';
import { Post, TeamMember, Comment } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import ScrollBackgroundText from './ScrollBackgroundText';
import RevealOnScroll from './RevealOnScroll';
import { MemberDetailModal, AuthorArticlesModal, ArticleDetailModal, ContentRenderer } from './TeamModals';

// Helper to count comments recursively
const getTotalCommentCount = (comments: Comment[]): number => {
  return comments.reduce((acc, comment) => {
    return acc + 1 + (comment.replies ? getTotalCommentCount(comment.replies) : 0);
  }, 0);
};

const CommentItem: React.FC<{ comment: Comment, isReply?: boolean, isLast?: boolean }> = ({ comment, isReply = false, isLast = false }) => {
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className="relative">
       {/* 
          SMART RAIL SYSTEM
          We use a "Long Spine" approach where the parent draws a continuous line 
          all the way down, and the last child "masks" the tail to create a perfect ending.
       */}

       {/* 
          1. THE PARENT RAIL (Long Spine)
          If this comment has replies, it draws a vertical line from its avatar 
          down to the bottom of the entire block (including all children).
          
          Position: left-[21px] (Shifted right by 5px from 16px)
       */}
       {hasReplies && (
          <div className="absolute left-[21px] top-[20px] bottom-0 w-[2px] bg-gray-800"></div>
       )}

       {/* 
          2. THE CHILD CONNECTOR (Elbow)
          If this is a reply, it connects to the rail.
          Calculations:
          - Indent is pl-14 (56px).
          - Rail is at 21px (parent coordinates).
          - Difference: 56 - 21 = 35px.
          - So we position left-[-35px] and width [35px].
       */}
       {isReply && (
         <>
            {/* The Elbow: Connects Rail to Avatar Center */}
            <div className="absolute left-[-35px] top-0 w-[35px] h-[20px] border-b-[2px] border-l-[2px] border-gray-800 rounded-bl-2xl"></div>

            {/* 
               3. THE TAIL MASK (For Last Child)
               If this is the last child, the Parent Rail continues past us.
               We overlay a box matching the background color to "cut" the line 
               at the center of our avatar.
               
               Width 8px.
               Position: centered on -35px -> left-[-39px]
            */}
            {isLast && (
                <div className="absolute left-[-39px] top-[20px] bottom-0 w-[8px] bg-gray-900"></div>
            )}
         </>
       )}

       {/* CONTENT BLOCK */}
       <div className="flex gap-4 relative z-10 group pb-6">
          <div className="relative shrink-0">
              <img 
                src={comment.avatar} 
                className="w-10 h-10 rounded-full border border-white/10 object-cover shadow-sm group-hover:scale-105 transition-transform bg-gray-800 relative z-10" 
                alt={comment.user} 
              />
          </div>
          <div className="flex-1 max-w-full">
             <div className="bg-white/5 border border-white/10 rounded-2xl p-4 inline-block min-w-[200px] max-w-full hover:bg-white/10 transition-colors">
                <h5 className="font-bold text-sm text-white flex items-center gap-2">
                    {comment.user}
                    <span className="text-gray-500 text-xs font-normal">• {comment.date}</span>
                </h5>
                <p className="text-gray-300 text-sm mt-1 leading-relaxed">{comment.content}</p>
             </div>
             <div className="flex items-center gap-4 mt-2 ml-2 text-xs text-gray-500 font-bold select-none">
                <button className="hover:text-white transition-colors">Like</button>
                <button className="hover:text-white transition-colors">Reply</button>
             </div>
          </div>
       </div>

       {/* RECURSIVE REPLIES */}
       {hasReplies && (
          <div className="pl-14">
             {comment.replies.map((reply, idx) => (
               <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  isReply={true} 
                  isLast={idx === (comment.replies?.length || 0) - 1} 
               />
             ))}
          </div>
       )}
    </div>
  );
}

const Insights: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<TeamMember | null>(null);
  const [authorPosts, setAuthorPosts] = useState<Post[] | null>(null);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showInlineShare, setShowInlineShare] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Comment States
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  const { t } = useLanguage();
  const { insights, team } = useData();

  // Reset comments when post changes
  useEffect(() => {
    if (selectedPost) {
        setComments(selectedPost.comments || []);
    }
  }, [selectedPost]);

  // Handle Hash Routing
  useEffect(() => {
    const handleHashChange = () => {
        const hash = window.location.hash;
        if (hash.startsWith('#insights/')) {
            const id = hash.replace('#insights/', '');
            const found = insights.find(p => p.id === id);
            if (found) setSelectedPost(found);
        } else if (hash === '#insights' && selectedPost) {
            setSelectedPost(null);
        }
    };

    // Initial check
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [insights]);

  const handleOpenPost = (post: Post) => {
      setSelectedPost(post);
      window.location.hash = `insights/${post.id}`;
  };

  const handleClosePost = () => {
      setSelectedPost(null);
      window.history.pushState(null, '', '#insights');
  };

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

  const handleShare = (platform: 'facebook' | 'telegram' | 'copy') => {
    if (!selectedPost) return;
    const url = window.location.href; // Now uses the correct URL with params
    const text = selectedPost.title;

    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      setShowShare(false);
      setShowInlineShare(false);
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
      setShowShare(false);
      setShowInlineShare(false);
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShare(false);
        setShowInlineShare(false);
      }, 1500);
    }
  };

  const scrollToComments = () => {
    const commentsSection = document.getElementById('comments-section');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAuthorClick = (authorId: string) => {
    const author = team.find(t => t.id === authorId);
    if (author) {
      setSelectedPost(null); // Close the article
      setSelectedAuthor(author); // Show author profile
      
      // Clean up URL
      window.history.pushState(null, '', '#team');
    }
  };

  const getAuthorName = (authorId: string) => {
    const author = team.find(t => t.id === authorId);
    return author ? author.name : 'Ponloe Team';
  };
  
  const getAuthorPostCount = (authorId: string) => {
      return insights.filter(p => p.authorId === authorId).length;
  };

  const handleSendComment = () => {
      if (!newCommentText.trim()) return;

      setIsSubmittingComment(true);

      // Simulate network delay
      setTimeout(() => {
          const newComment: Comment = {
              id: Date.now().toString(),
              user: "Guest User", // In a real app, this would be the logged-in user
              avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
              content: newCommentText,
              date: "Just now",
              replies: []
          };

          setComments(prev => [...prev, newComment]);
          setNewCommentText('');
          setIsSubmittingComment(false);
      }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          handleSendComment();
      }
  };

  const totalComments = getTotalCommentCount(comments);

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
                onClick={() => handleOpenPost(post)}
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
                       onClick={(e) => { e.stopPropagation(); handleOpenPost(post); }}
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
                                onClick={() => handleOpenPost(post)}
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

      {/* Post Detail Modal */}
      {selectedPost && createPortal(
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-950/90 backdrop-blur-xl animate-fade-in" 
            onClick={handleClosePost} 
          />
          <div className="relative w-full max-w-7xl h-full md:h-[90vh] bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scale-up z-10 flex flex-col">
              
              {/* Mobile Header (Close, Comment, Share) */}
              <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-4 md:hidden pointer-events-none">
                  <button 
                    onClick={handleClosePost} 
                    className="pointer-events-auto p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md border border-white/10"
                  >
                      <X size={20} />
                  </button>
                  <div className="flex gap-2">
                     <button 
                        onClick={scrollToComments} 
                        className="pointer-events-auto p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md border border-white/10"
                      >
                          <MessageCircle size={20} />
                      </button>
                       <button 
                        onClick={() => setShowShare(true)} 
                        className="pointer-events-auto p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md border border-white/10"
                      >
                          <Share2 size={20} />
                      </button>
                  </div>
              </div>

              {/* Scrollable Container */}
              <div className="overflow-y-auto scrollbar-hide h-full">
                  {/* Image Banner */}
                  <div className="relative h-64 md:h-80 w-full shrink-0">
                      <img src={selectedPost.image} className="w-full h-full object-cover" alt={selectedPost.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80" />
                      
                      {/* Desktop Close Button */}
                      <button 
                        onClick={handleClosePost} 
                        className="hidden md:block absolute top-6 right-6 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all border border-white/10 z-20"
                      >
                          <X size={24} />
                      </button>
                  </div>
                  
                  {/* Content Body */}
                  <div className="px-4 pb-12 md:px-12 md:pb-12 relative -mt-16 md:-mt-20">
                       <div className="bg-gray-900/95 backdrop-blur-xl p-6 md:p-10 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl min-h-[50vh]">
                          
                          {/* Centered Content Container */}
                          <div className="max-w-4xl mx-auto">
                              {/* Metadata Row */}
                              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                  <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-indigo-400 font-mono uppercase tracking-wider">
                                      <span className="flex items-center gap-1.5 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                                          <Tag size={12} /> {selectedPost.category}
                                      </span>
                                      <span className="flex items-center gap-1.5 text-gray-400">
                                          <Calendar size={12} /> {selectedPost.date}
                                      </span>
                                      
                                      {/* Interactive Author Button */}
                                      <button 
                                        onClick={() => handleAuthorClick(selectedPost.authorId)}
                                        className="flex items-center gap-1.5 text-gray-400 hover:text-white hover:underline decoration-indigo-500/50 underline-offset-4 transition-all"
                                      >
                                          <User size={12} /> {getAuthorName(selectedPost.authorId)}
                                      </button>
                                  </div>

                                  {/* Desktop Actions (Share & Comment) */}
                                  <div className="hidden md:flex items-center gap-4">
                                        {/* Social Icons (Show on Left of Share Button) */}
                                        {showInlineShare && (
                                            <div className="flex items-center gap-2 animate-fade-in origin-right">
                                                <button 
                                                    onClick={() => handleShare('facebook')} 
                                                    className="p-2 rounded-full bg-white/5 hover:bg-[#1877F2] text-gray-400 hover:text-white border border-white/10 transition-colors shadow-sm"
                                                    title="Share on Facebook"
                                                >
                                                    <Facebook size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleShare('telegram')} 
                                                    className="p-2 rounded-full bg-white/5 hover:bg-[#229ED9] text-gray-400 hover:text-white border border-white/10 transition-colors shadow-sm"
                                                    title="Share on Telegram"
                                                >
                                                    <Send size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleShare('copy')} 
                                                    className="p-2 rounded-full bg-white/5 hover:bg-green-500 text-gray-400 hover:text-white border border-white/10 transition-colors shadow-sm flex items-center gap-2"
                                                    title="Copy Link"
                                                >
                                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                                </button>
                                            </div>
                                        )}

                                        <button 
                                            onClick={() => setShowInlineShare(!showInlineShare)}
                                            className={`flex items-center gap-2 text-sm font-bold transition-colors cursor-pointer ${showInlineShare ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            <Share2 size={16} /> {showInlineShare ? t('Close', 'បិទ') : t('Share', 'ចែករំលែក')}
                                        </button>
                                        
                                        <div className="w-px h-4 bg-gray-700" />
                                        
                                        <button 
                                            onClick={scrollToComments}
                                            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
                                        >
                                            <MessageCircle size={16} /> 
                                            {totalComments > 0 && <span>{totalComments}</span>}
                                            {t('Comments', 'មតិ')}
                                        </button>
                                  </div>
                              </div>

                              <h2 className="text-2xl md:text-5xl font-bold text-white mb-6 leading-tight font-khmer">
                                  {t(selectedPost.title, selectedPost.titleKm)}
                              </h2>

                              <div className="border-b border-white/10 pb-8 mb-8">
                                  <ContentRenderer content={selectedPost.content || selectedPost.excerpt} />
                              </div>

                              {/* Comments Section */}
                              <div id="comments-section" className="scroll-mt-24">
                                  <div className="flex justify-between items-center mb-6">
                                      <h3 className="text-xl font-bold text-white font-khmer">
                                        {t('Comments', 'មតិយោបល់')} ({totalComments})
                                      </h3>
                                  </div>
                                  
                                  {/* Active Input */}
                                  <div className="flex gap-3 mb-8">
                                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
                                           <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover" alt="User" />
                                      </div>
                                      <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl flex items-center px-4 hover:bg-white/10 transition-colors group focus-within:ring-1 focus-within:ring-indigo-500/50">
                                          <input 
                                            type="text" 
                                            placeholder={t('Write a comment...', 'សរសេរមតិយោបល់...')} 
                                            className="bg-transparent border-none outline-none w-full text-sm text-white placeholder-gray-500 h-12 font-khmer"
                                            value={newCommentText}
                                            onChange={(e) => setNewCommentText(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            disabled={isSubmittingComment}
                                          />
                                          <button 
                                            onClick={handleSendComment}
                                            disabled={!newCommentText.trim() || isSubmittingComment}
                                            className={`p-2 rounded-full transition-all ${newCommentText.trim() ? 'text-indigo-400 hover:text-white hover:bg-indigo-500/20' : 'text-gray-600 cursor-not-allowed'}`}
                                          >
                                            <Send size={18} />
                                          </button>
                                      </div>
                                  </div>

                                  {/* Comments List */}
                                  <div className="">
                                      {comments && comments.length > 0 ? (
                                          comments.map(comment => (
                                              <CommentItem key={comment.id} comment={comment} />
                                          ))
                                      ) : (
                                          <div className="text-center py-8 text-gray-500 font-khmer">
                                              {t('No comments yet. Be the first to share your thoughts!', 'មិនទាន់មានមតិយោបល់ទេ។ ចែករំលែកមតិរបស់អ្នកមុនគេ!')}
                                          </div>
                                      )}
                                  </div>
                              </div>
                              
                              <div className="mt-8 md:mt-12 pt-8 border-t border-white/10 flex justify-between items-center">
                                  <span className="text-gray-500 text-sm hidden md:inline">Thanks for reading!</span>
                                  <button 
                                    onClick={handleClosePost}
                                    className="w-full md:w-auto px-6 py-3 bg-white text-gray-950 rounded-full font-bold hover:bg-indigo-500 hover:text-white transition-all font-khmer"
                                  >
                                    {t('Close Article', 'បិទអត្ថបទ')}
                                  </button>
                              </div>
                          </div>
                       </div>
                  </div>
              </div>

              {/* Share Popup Overlay (Mobile Only) */}
              {showShare && (
                <div 
                    className="absolute inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-sm p-4 animate-fade-in md:hidden"
                    onClick={(e) => { e.stopPropagation(); setShowShare(false); }}
                >
                    <div 
                        className="bg-gray-900 border border-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-sm transform scale-100 animate-scale-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white font-khmer">{t('Share this article', 'ចែករំលែកអត្ថបទនេះ')}</h3>
                            <button onClick={() => setShowShare(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <button 
                                onClick={() => handleShare('facebook')}
                                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-[#1877F2]/20 border border-white/5 hover:border-[#1877F2]/50 transition-all group"
                            >
                                <div className="p-3 rounded-full bg-white/10 group-hover:bg-[#1877F2] text-white transition-colors">
                                    <Facebook size={20} />
                                </div>
                                <span className="text-xs font-medium text-gray-300 group-hover:text-white">Facebook</span>
                            </button>

                            <button 
                                onClick={() => handleShare('telegram')}
                                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-[#229ED9]/20 border border-white/5 hover:border-[#229ED9]/50 transition-all group"
                            >
                                <div className="p-3 rounded-full bg-white/10 group-hover:bg-[#229ED9] text-white transition-colors">
                                    <Send size={20} />
                                </div>
                                <span className="text-xs font-medium text-gray-300 group-hover:text-white">Telegram</span>
                            </button>

                            <button 
                                onClick={() => handleShare('copy')}
                                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-green-500/20 border border-white/5 hover:border-green-500/50 transition-all group"
                            >
                                <div className={`p-3 rounded-full transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-white/10 group-hover:bg-green-500 text-white'}`}>
                                    {copied ? <Check size={20} /> : <Copy size={20} />}
                                </div>
                                <span className="text-xs font-medium text-gray-300 group-hover:text-white">{copied ? 'Copied!' : 'Copy Link'}</span>
                            </button>
                        </div>
                    </div>
                </div>
              )}
          </div>
        </div>,
        document.body
      )}

      {/* Author/Team Member Modal */}
      {selectedAuthor && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-gray-950/90 backdrop-blur-md animate-fade-in"
             onClick={() => setSelectedAuthor(null)}
           />

           {/* Modal Card */}
           <div className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scale-up z-10 flex flex-col max-h-[90vh]">
              
              {/* Header / Cover */}
              <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 relative shrink-0">
                 <button 
                    onClick={() => setSelectedAuthor(null)}
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm"
                 >
                    <X size={20} />
                 </button>
              </div>

              {/* Profile Image - Overlapping */}
              <div className="px-8 -mt-16 flex justify-between items-end relative z-10 mb-6 shrink-0">
                  <div className="h-32 w-32 rounded-full border-4 border-gray-900 overflow-hidden bg-gray-800">
                     <img src={selectedAuthor.image} alt={selectedAuthor.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="mb-4 flex gap-3">
                     {selectedAuthor.socials.facebook && (
                      <a href={selectedAuthor.socials.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 border border-white/10 text-gray-400 rounded-lg hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all">
                        <Facebook size={18} />
                      </a>
                    )}
                    {selectedAuthor.socials.telegram && (
                      <a href={selectedAuthor.socials.telegram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 border border-white/10 text-gray-400 rounded-lg hover:bg-[#229ED9] hover:text-white hover:border-[#229ED9] transition-all">
                        <Send size={18} />
                      </a>
                    )}
                  </div>
              </div>

              {/* Content - Scrollable */}
              <div className="px-8 pb-8 overflow-y-auto scrollbar-hide">
                  <div className="flex items-center gap-4 mb-1">
                      <h3 className="text-3xl font-bold text-white">{selectedAuthor.name}</h3>
                      <button 
                        onClick={() => setAuthorPosts(insights.filter(p => p.authorId === selectedAuthor.id))}
                        className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wide border border-indigo-500/20 whitespace-nowrap flex items-center gap-1.5 hover:bg-indigo-500/30 transition-colors cursor-pointer"
                      >
                          <FileText size={12} />
                          {getAuthorPostCount(selectedAuthor.id)} {t('Articles', 'អត្ថបទ')}
                      </button>
                  </div>
                  <p className="text-indigo-400 font-medium font-khmer mb-6">{t(selectedAuthor.role, selectedAuthor.roleKm)}</p>

                  <div className="space-y-6">
                      {/* Bio */}
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm uppercase font-bold tracking-wider font-khmer">
                              <User size={14} /> {t('About', 'អំពីខ្ញុំ')}
                          </div>
                          <p className="text-gray-300 leading-relaxed font-khmer">
                              {t(selectedAuthor.bio, selectedAuthor.bioKm || selectedAuthor.bio)}
                          </p>
                      </div>

                      {/* Skills */}
                      <div>
                          <div className="flex items-center gap-2 mb-3 text-gray-400 text-sm uppercase font-bold tracking-wider font-khmer">
                              <Code size={14} /> {t('Skills', 'ជំនាញ')}
                          </div>
                          <div className="flex flex-wrap gap-2">
                              {selectedAuthor.skills.map(skill => (
                                  <span key={skill} className="px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full text-xs font-bold">
                                      {skill}
                                  </span>
                              ))}
                          </div>
                      </div>

                      {/* Experience */}
                      <div>
                          <div className="flex items-center gap-2 mb-3 text-gray-400 text-sm uppercase font-bold tracking-wider font-khmer">
                              <Briefcase size={14} /> {t('Experience', 'បទពិសោធន៍')}
                          </div>
                          <ul className="space-y-3">
                              {(t(selectedAuthor.experience.join('|'), (selectedAuthor.experienceKm || selectedAuthor.experience).join('|'))).split('|').map((exp, idx) => (
                                  <li key={idx} className="flex items-start gap-3 text-gray-300 text-sm font-khmer">
                                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                                      {exp}
                                  </li>
                              ))}
                          </ul>
                      </div>
                  </div>
              </div>
           </div>
        </div>,
        document.body
      )}

      {/* Author Articles List Modal */}
      {authorPosts && createPortal(
         <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-gray-950/95 backdrop-blur-md animate-fade-in"
                onClick={() => setAuthorPosts(null)}
            />
             <div className="relative w-full max-w-7xl h-full md:h-[90vh] bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scale-up flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-white/10 bg-gray-900 z-10">
                    <div>
                        <h3 className="text-xl font-bold text-white font-khmer">
                            {t('Articles by', 'អត្ថបទដោយ')} {selectedAuthor?.name}
                        </h3>
                    </div>
                    <button 
                        onClick={() => setAuthorPosts(null)}
                        className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/5"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {authorPosts.map((post) => (
                             <article 
                                key={post.id} 
                                className="group flex flex-col bg-white/5 border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                onClick={() => handleOpenPost(post)}
                            >
                                <div className="relative h-40 overflow-hidden">
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
                                <div className="p-4 flex-1 flex flex-col">
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-scale-up {
          animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default Insights;
