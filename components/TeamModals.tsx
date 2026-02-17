import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Facebook, Send, FileText, User, Code, Briefcase, Calendar, Tag, MessageCircle, Share2, Check, Copy, Loader2, ArrowRight } from 'lucide-react';
import { TeamMember, Post, Comment } from '../types';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getSupabaseClient } from '../lib/supabase';
import ContentRenderer from './ContentRenderer';

// Helper to count comments recursively
const getTotalCommentCount = (comments: Comment[]): number => {
  if (!comments) return 0;
  return comments.reduce((acc, comment) => {
    return acc + 1 + (comment.replies ? getTotalCommentCount(comment.replies) : 0);
  }, 0);
};

// --- Member Detail Modal ---
interface MemberDetailModalProps {
    member: TeamMember;
    onClose: () => void;
    onShowArticles: (member: TeamMember) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({ member, onClose, onShowArticles }) => {
    const { t } = useLanguage();
    const { insights = [] } = useData(); 
    
    if (!member) return null;

    const postCount = (insights || []).filter(post => post?.authorId === member.id).length;
    const skills = member.skills || [];
    const experience = member.experience || [];
    const experienceKm = member.experienceKm || [];
    const socials = member.socials || {};

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-gray-950/90 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            />
            <div className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scale-up z-10 flex flex-col max-h-[90vh]">
                {/* Header / Cover */}
                <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 relative shrink-0">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Profile Image */}
                <div className="px-8 -mt-16 flex justify-between items-end relative z-10 mb-6 shrink-0">
                    <div className="h-32 w-32 rounded-full border-4 border-gray-900 overflow-hidden bg-gray-800">
                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="mb-4 flex gap-3">
                        {socials.facebook && (
                            <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 border border-white/10 text-gray-400 rounded-lg hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all">
                                <Facebook size={18} />
                            </a>
                        )}
                        {socials.telegram && (
                            <a href={socials.telegram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 border border-white/10 text-gray-400 rounded-lg hover:bg-[#229ED9] hover:text-white hover:border-[#229ED9] transition-all">
                                <Send size={18} />
                            </a>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 pb-8 overflow-y-auto scrollbar-hide">
                    <div className="flex items-center gap-4 mb-1">
                        <h3 className="text-3xl font-bold text-white">{member.name}</h3>
                        {postCount > 0 && (
                            <button 
                                onClick={() => onShowArticles(member)}
                                className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wide border border-indigo-500/20 whitespace-nowrap flex items-center gap-1.5 hover:bg-indigo-500/30 transition-colors cursor-pointer"
                            >
                                <FileText size={12} />
                                {postCount} {t('Articles', 'អត្ថបទ')}
                            </button>
                        )}
                    </div>
                    <p className="text-indigo-400 font-medium font-khmer mb-6">{t(member.role, member.roleKm)}</p>

                    <div className="space-y-6">
                        {/* Bio */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm uppercase font-bold tracking-wider font-khmer">
                                <User size={14} /> {t('About', 'អំពីខ្ញុំ')}
                            </div>
                            <p className="text-gray-300 leading-relaxed font-khmer">
                                {t(member.bio, member.bioKm || member.bio)}
                            </p>
                        </div>

                        {/* Skills */}
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-gray-400 text-sm uppercase font-bold tracking-wider font-khmer">
                                <Code size={14} /> {t('Skills', 'ជំនាញ')}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {skills.map(skill => (
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
                                {(t(experience.join('|'), experienceKm.join('|'))).split('|').map((exp, idx) => (
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
    );
};

// --- Author Articles List Modal ---
interface AuthorArticlesModalProps {
    author: TeamMember;
    posts: Post[];
    onClose: () => void;
    onSelectPost: (post: Post) => void;
}

export const AuthorArticlesModal: React.FC<AuthorArticlesModalProps> = ({ author, posts, onClose, onSelectPost }) => {
    const { t } = useLanguage();
    
    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-gray-950/95 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            />
            <div className="relative w-full max-w-7xl h-full md:h-[90vh] bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scale-up flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-white/10 bg-gray-900 z-10">
                    <div>
                        <h3 className="text-xl font-bold text-white font-khmer">
                            {t('Articles by', 'អត្ថបទដោយ')} {author.name}
                        </h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/5"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <article 
                                key={post.id} 
                                className="group flex flex-col bg-white/5 border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                onClick={() => onSelectPost(post)}
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
    );
};

// --- Article Detail Modal ---
interface ArticleDetailModalProps {
    post: Post;
    onClose: () => void;
    onAuthorClick?: (authorId: string) => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({ post, onClose, onAuthorClick }) => {
    const { t } = useLanguage();
    const { team = [] } = useData(); // Default array
    const { currentUser } = useAuth();
    
    const [showShare, setShowShare] = useState(false);
    const [copied, setCopied] = useState(false);
    
    // Comments State
    const [comments, setComments] = useState<Comment[]>(post?.comments || []);
    const [newCommentText, setNewCommentText] = useState('');
    const [commentUser, setCommentUser] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(false);

    // Identify Author
    const author = (team || []).find(t => t.id === post.authorId);

    if (!post) return null;

    // Auto-fill user if logged in
    useEffect(() => {
        if (currentUser) {
            setCommentUser(currentUser.name || 'Admin');
        }
    }, [currentUser]);

    // FETCH COMMENTS FROM DB
    useEffect(() => {
        const fetchComments = async () => {
            const supabase = getSupabaseClient();
            if(!supabase) return; // Fallback to local 'post.comments' if no DB

            setIsLoadingComments(true);
            try {
                const { data, error } = await supabase
                    .from('comments')
                    .select('*')
                    .eq('post_id', post.id)
                    .order('created_at', { ascending: false });

                if(error) throw error;
                
                if(data) {
                    // Transform DB structure to UI structure
                    const dbComments: Comment[] = data.map((c:any) => ({
                        id: c.id,
                        user: c.user_name,
                        avatar: c.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user_name)}&background=random`,
                        content: c.content,
                        date: new Date(c.created_at).toLocaleDateString(),
                        replies: [] // Flat structure for simplicity in this update
                    }));
                    setComments(dbComments);
                }
            } catch(err) {
                console.error("Error fetching comments:", err);
            } finally {
                setIsLoadingComments(false);
            }
        };

        fetchComments();
    }, [post.id]);


    const handleShare = (platform: 'facebook' | 'telegram' | 'copy') => {
        const url = window.location.href;
        if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        if (platform === 'telegram') window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`, '_blank');
        if (platform === 'copy') {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => { setCopied(false); setShowShare(false); }, 1500);
        }
    };

    const handleSendComment = async () => {
        if (!newCommentText.trim()) return;
        const supabase = getSupabaseClient();

        setIsSubmitting(true);
        
        const finalUserName = commentUser.trim() || "Guest User";
        
        // Find avatar: If logged in team member, use their photo, else use UI Avatar
        let finalAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(finalUserName)}&background=random`;
        if (currentUser && currentUser.role === 'member' && currentUser.id) {
             const memberData = team.find(m => m.id === currentUser.id);
             if (memberData) finalAvatar = memberData.image;
        }

        try {
            if (supabase) {
                // Insert to DB
                const { data, error } = await supabase.from('comments').insert({
                    post_id: post.id,
                    user_name: finalUserName,
                    user_avatar: finalAvatar,
                    content: newCommentText
                }).select();
                
                if (error) throw error;

                // Add to local state immediately
                if(data) {
                    const newComment: Comment = {
                        id: data[0].id,
                        user: data[0].user_name,
                        avatar: data[0].user_avatar,
                        content: data[0].content,
                        date: "Just now",
                        replies: []
                    };
                    setComments(prev => [newComment, ...prev]);
                }
            } else {
                 // Fallback Local
                 const newComment: Comment = {
                    id: Date.now().toString(),
                    user: finalUserName,
                    avatar: finalAvatar,
                    content: newCommentText,
                    date: "Just now",
                    replies: []
                };
                setComments(prev => [newComment, ...prev]);
            }

            setNewCommentText('');
            // setCommentUser(''); // Keep user name for convenience if they want to comment again
        } catch (err) {
            console.error(err);
            alert("Failed to post comment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalComments = getTotalCommentCount(comments);

    return createPortal(
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-gray-950/90 backdrop-blur-xl animate-fade-in" 
                onClick={onClose} 
            />
            <div className="relative w-full max-w-7xl h-full md:h-[90vh] bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scale-up z-10 flex flex-col">
                
                 {/* Mobile Header (Close, Comment, Share) */}
                 <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-4 md:hidden pointer-events-none">
                    <button onClick={onClose} className="pointer-events-auto p-2 bg-black/40 text-white rounded-full backdrop-blur-md border border-white/10"><X size={20} /></button>
                    <button onClick={() => setShowShare(true)} className="pointer-events-auto p-2 bg-black/40 text-white rounded-full backdrop-blur-md border border-white/10"><Share2 size={20} /></button>
                </div>

                <div className="overflow-y-auto scrollbar-hide h-full">
                    <div className="relative h-64 md:h-80 w-full shrink-0">
                        <img src={post.image} className="w-full h-full object-cover" alt={post.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80" />
                        <button onClick={onClose} className="hidden md:block absolute top-6 right-6 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md border border-white/10 z-20"><X size={24} /></button>
                    </div>

                    <div className="px-4 pb-12 md:px-12 md:pb-12 relative -mt-16 md:-mt-20">
                         <div className="bg-gray-900/95 backdrop-blur-xl p-6 md:p-10 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl min-h-[50vh]">
                            <div className="max-w-4xl mx-auto">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                    <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-indigo-400 font-mono uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20"><Tag size={12} /> {post.category}</span>
                                        <span className="flex items-center gap-1.5 text-gray-400"><Calendar size={12} /> {post.date}</span>
                                    </div>

                                    {/* Desktop Actions */}
                                    <div className="hidden md:flex items-center gap-4">
                                        {/* Social Icons (Left of Share) */}
                                        {showShare && (
                                            <div className="flex items-center gap-2 animate-fade-in origin-right">
                                                <button onClick={() => handleShare('facebook')} className="p-2 rounded-full bg-white/5 hover:bg-[#1877F2] text-gray-400 hover:text-white border border-white/10 transition-colors shadow-sm"><Facebook size={18} /></button>
                                                <button onClick={() => handleShare('telegram')} className="p-2 rounded-full bg-white/5 hover:bg-[#229ED9] text-gray-400 hover:text-white border border-white/10 transition-colors shadow-sm"><Send size={18} /></button>
                                                <button onClick={() => handleShare('copy')} className="p-2 rounded-full bg-white/5 hover:bg-green-500 text-gray-400 hover:text-white border border-white/10 transition-colors shadow-sm"><Copy size={18} /></button>
                                            </div>
                                        )}

                                        <button onClick={() => setShowShare(!showShare)} className={`flex items-center gap-2 text-sm text-gray-400 hover:text-white font-bold transition-colors ${showShare ? 'text-white' : ''}`}>
                                            <Share2 size={16} /> {showShare ? t('Close', 'បិទ') : t('Share', 'ចែករំលែក')}
                                        </button>

                                        <div className="w-px h-4 bg-gray-700" />
                                        
                                        <button className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors cursor-pointer">
                                            <MessageCircle size={16} /> 
                                            {totalComments > 0 && <span>{totalComments}</span>}
                                            {t('Comments', 'មតិ')}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* AUTHOR PROFILE CARD */}
                                {author && (
                                    <div 
                                        onClick={() => onAuthorClick && onAuthorClick(author.id)}
                                        className="flex items-center gap-4 mb-6 p-3 pr-6 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group w-fit"
                                    >
                                        <div className="relative">
                                            <img 
                                                src={author.image} 
                                                alt={author.name} 
                                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-700 group-hover:border-indigo-500 transition-colors" 
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white leading-none group-hover:text-indigo-300 transition-colors flex items-center gap-1">
                                                {author.name}
                                                <ArrowRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">{t('Author', 'អ្នកនិពន្ធ')} &middot; {author.role}</p>
                                        </div>
                                    </div>
                                )}

                                <h2 className="text-2xl md:text-5xl font-bold text-white mb-6 leading-tight font-khmer">{t(post.title, post.titleKm)}</h2>
                                
                                <div className="border-b border-white/10 pb-8 mb-8">
                                    <ContentRenderer content={post.content || post.excerpt} />
                                </div>
                                
                                {/* Comments Section */}
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-4 font-khmer">{t('Comments', 'មតិយោបល់')} ({totalComments})</h3>
                                    
                                    {/* Comment Form */}
                                    <div className="bg-white/5 rounded-2xl p-4 mb-8 border border-white/5">
                                        <div className="mb-3">
                                            <input 
                                                value={commentUser}
                                                onChange={e => setCommentUser(e.target.value)}
                                                placeholder={t('Your Name (Optional)', 'ឈ្មោះរបស់អ្នក (មិនចាំបាច់)')}
                                                className={`w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none border-b border-white/10 pb-2 focus:border-indigo-500 transition-colors font-khmer ${currentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                readOnly={!!currentUser}
                                            />
                                            {currentUser && <span className="text-[10px] text-indigo-400 ml-1">Logged in as {currentUser.name}</span>}
                                        </div>
                                        <div className="flex gap-3">
                                            <textarea
                                                value={newCommentText} 
                                                onChange={e => setNewCommentText(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendComment()}
                                                placeholder={t('Write a comment...', 'សរសេរមតិយោបល់...')} 
                                                rows={1}
                                                className="flex-1 bg-transparent text-white outline-none resize-none pt-2 placeholder-gray-500 font-khmer min-h-[40px]"
                                            />
                                            <button 
                                                onClick={handleSendComment} 
                                                disabled={!newCommentText.trim() || isSubmitting} 
                                                className="p-3 rounded-xl bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-500 transition-colors"
                                            >
                                                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Comments List */}
                                    <div className="space-y-4">
                                        {isLoadingComments ? (
                                             <div className="text-center py-4 text-gray-500"><Loader2 className="animate-spin inline mr-2"/> Loading comments...</div>
                                        ) : comments.length > 0 ? (
                                            comments.map(c => (
                                                <div key={c.id} className="flex gap-4 group">
                                                    <img src={c.avatar} className="w-10 h-10 rounded-full border border-white/10 bg-gray-800" alt="Avatar" />
                                                    <div className="flex-1">
                                                        <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5 hover:bg-white/10 transition-colors">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <p className="font-bold text-sm text-white">{c.user}</p>
                                                                <span className="text-[10px] text-gray-500">{c.date}</span>
                                                            </div>
                                                            <p className="text-gray-300 text-sm whitespace-pre-wrap">{c.content}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-600 font-khmer text-sm border-2 border-dashed border-white/5 rounded-2xl">
                                                {t('No comments yet. Be the first to share your thoughts!', 'មិនទាន់មានមតិយោបល់ទេ។ ចែករំលែកមតិរបស់អ្នកមុនគេ!')}
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                         </div>
                    </div>
                </div>

                {/* Share Overlay */}
                {showShare && (
                     <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-sm p-4 animate-fade-in md:hidden" onClick={(e) => { e.stopPropagation(); setShowShare(false); }}>
                        <div className="bg-gray-900 border border-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-sm animate-scale-up" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-white font-khmer">{t('Share this article', 'ចែករំលែកអត្ថបទនេះ')}</h3>
                                <button onClick={() => setShowShare(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <button onClick={() => handleShare('facebook')} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-[#1877F2]/20 border border-white/5 transition-all"><Facebook size={24} className="text-[#1877F2]"/> <span className="text-xs">Facebook</span></button>
                                <button onClick={() => handleShare('telegram')} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-[#229ED9]/20 border border-white/5 transition-all"><Send size={24} className="text-[#229ED9]"/> <span className="text-xs">Telegram</span></button>
                                <button onClick={() => handleShare('copy')} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-green-500/20 border border-white/5 transition-all"><Copy size={24} className={copied ? "text-green-500" : "text-white"}/> <span className="text-xs">{copied ? 'Copied' : 'Copy'}</span></button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};
