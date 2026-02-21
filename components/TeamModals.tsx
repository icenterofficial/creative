import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Facebook, Send, FileText, User, Code, Briefcase, Calendar, Tag, MessageCircle, Share2, Check, Copy, Loader2, ArrowRight } from 'lucide-react';
import { TeamMember, Post, Comment } from '../types';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getSupabaseClient } from '../lib/supabase';
import ContentRenderer from './ContentRenderer';
import LocalScrollButton from './LocalScrollButton';

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
                <div className="h-32 bg-gray-800 relative shrink-0 overflow-hidden">
                    {member.coverImage ? (
                        <img 
                            src={member.coverImage} 
                            alt="Cover" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-purple-600" />
                    )}
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm z-10"
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
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-gray-400 text-[10px] font-mono">
                                            <Calendar size={10} />
                                            <span>{post.date}</span>
                                        </div>
                                    </div>
                                    <h4 className="text-white font-bold group-hover:text-indigo-400 transition-colors line-clamp-2 font-khmer text-sm mb-2">
                                        {t(post.title, post.titleKm)}
                                    </h4>
                                    <p className="text-gray-400 text-[10px] leading-relaxed line-clamp-2 font-khmer">
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
    const { team = [] } = useData();
    const { currentUser } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyTo, setReplyTo] = useState<{id: string, name: string} | null>(null);
    const [copied, setCopied] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(true);
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const author = team.find(m => m.id === post.authorId);

    // Fetch comments from Supabase
    useEffect(() => {
        const fetchComments = async () => {
            setIsLoadingComments(true);
            try {
                const supabase = getSupabaseClient();
                if (!supabase) {
                    setIsLoadingComments(false);
                    return;
                }

                const { data, error } = await supabase
                    .from('comments')
                    .select('*')
                    .eq('post_id', post.id)
                    .order('created_at', { ascending: true });

                if (error) throw error;

                // Build comment tree
                const commentMap = new Map();
                const roots: Comment[] = [];

                data.forEach(c => {
                    const comment = { ...c, replies: [] };
                    commentMap.set(c.id, comment);
                });

                data.forEach(c => {
                    const comment = commentMap.get(c.id);
                    if (c.parent_id && commentMap.has(c.parent_id)) {
                        commentMap.get(c.parent_id).replies.push(comment);
                    } else {
                        roots.push(comment);
                    }
                });

                setComments(roots);
            } catch (err) {
                console.error('Error fetching comments:', err);
            } finally {
                setIsLoadingComments(false);
            }
        };

        if (post.id) fetchComments();
    }, [post.id]);

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;

        setIsSubmitting(true);
        try {
            const supabase = getSupabaseClient();
            if (!supabase) return;

            const commentData = {
                post_id: post.id,
                user_id: currentUser.id || 'anonymous',
                user_name: currentUser.name || 'Guest',
                content: newComment.trim(),
                parent_id: replyTo?.id || null
            };

            const { data, error } = await supabase
                .from('comments')
                .insert([commentData])
                .select()
                .single();

            if (error) throw error;

            // Update local state
            const newLocalComment: Comment = {
                ...data,
                replies: []
            };

            if (replyTo) {
                const updateReplies = (list: Comment[]): Comment[] => {
                    return list.map(c => {
                        if (c.id === replyTo.id) {
                            return { ...c, replies: [...(c.replies || []), newLocalComment] };
                        }
                        if (c.replies && c.replies.length > 0) {
                            return { ...c, replies: updateReplies(c.replies) };
                        }
                        return c;
                    });
                };
                setComments(prev => updateReplies(prev));
            } else {
                setComments(prev => [...prev, newLocalComment]);
            }

            setNewComment('');
            setReplyTo(null);
        } catch (err) {
            console.error('Error posting comment:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const CommentItem = ({ comment, isReply = false }: { comment: Comment, isReply?: boolean }) => (
        <div className={`flex gap-3 ${isReply ? 'ml-8 mt-4' : 'mt-6'}`}>
            <div className="shrink-0">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                    {comment.user_name.charAt(0)}
                </div>
            </div>
            <div className="flex-1">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-white font-bold text-sm">{comment.user_name}</span>
                        <span className="text-gray-500 text-[10px]">{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm font-khmer">{comment.content}</p>
                </div>
                <div className="flex gap-4 mt-2 ml-2">
                    <button 
                        onClick={() => setReplyTo({id: comment.id, name: comment.user_name})}
                        className="text-[10px] font-bold text-gray-500 hover:text-indigo-400 transition-colors uppercase tracking-wider"
                    >
                        {t('Reply', 'ឆ្លើយតប')}
                    </button>
                </div>
                {comment.replies && comment.replies.map(reply => (
                    <CommentItem key={reply.id} comment={reply} isReply={true} />
                ))}
            </div>
        </div>
    );

    return createPortal(
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-0 md:p-4">
            <div 
                className="absolute inset-0 bg-gray-950/95 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            />
            <div className="relative w-full max-w-4xl h-full md:h-[95vh] bg-gray-900 md:border md:border-white/10 md:rounded-3xl shadow-2xl overflow-hidden animate-scale-up flex flex-col z-10">
                {/* Close Button Mobile */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md z-50 md:hidden"
                >
                    <X size={20} />
                </button>

                <div className="flex-1 overflow-y-auto scrollbar-hide relative" ref={scrollRef}>
                    <LocalScrollButton scrollContainerRef={scrollRef} />
                    
                    {/* Hero Image */}
                    <div className="relative h-[40vh] md:h-[50vh] shrink-0">
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                            <div className="flex flex-wrap gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <Tag size={12} /> {post.category}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/10">
                                    <Calendar size={12} /> {post.date}
                                </span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-white font-khmer leading-tight mb-6">{t(post.title, post.titleKm)}</h2>
                            
                            {author && (
                                <div 
                                    className="flex items-center gap-4 cursor-pointer group"
                                    onClick={() => onAuthorClick?.(author.id)}
                                >
                                    <img src={author.image} alt={author.name} className="w-12 h-12 rounded-full border-2 border-white/20 group-hover:border-indigo-400 transition-colors" />
                                    <div>
                                        <p className="text-white font-bold group-hover:text-indigo-400 transition-colors">{author.name}</p>
                                        <p className="text-gray-400 text-xs font-khmer">{t(author.role, author.roleKm)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Article Content */}
                    <div className="px-6 md:px-10 py-10">
                        <div className="max-w-3xl mx-auto">
                            <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
                                <div className="flex gap-4">
                                    <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/5 text-sm font-bold">
                                        {copied ? <Check size={16} className="text-green-400" /> : <Share2 size={16} />}
                                        {copied ? t('Copied!', 'បានចម្លង!') : t('Share', 'ចែករំលែក')}
                                    </button>
                                </div>
                                <button onClick={onClose} className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest">
                                    {t('Close', 'បិទ')} <X size={20} />
                                </button>
                            </div>

                            <div className="prose prose-invert prose-indigo max-w-none">
                                <ContentRenderer content={t(post.content, post.contentKm || post.content)} />
                            </div>

                            {/* Comments Section */}
                            <div className="mt-20 pt-10 border-t border-white/10">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <MessageCircle size={24} className="text-indigo-400" />
                                        {t('Comments', 'មតិយោបល់')} 
                                        <span className="text-sm bg-white/5 px-2 py-1 rounded-lg text-gray-500">{getTotalCommentCount(comments)}</span>
                                    </h3>
                                </div>

                                {currentUser ? (
                                    <form onSubmit={handleSubmitComment} className="mb-10">
                                        {replyTo && (
                                            <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-t-xl text-xs">
                                                <span className="text-indigo-300">Replying to <strong>{replyTo.name}</strong></span>
                                                <button type="button" onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-white"><X size={14} /></button>
                                            </div>
                                        )}
                                        <div className="relative">
                                            <textarea 
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder={t('Write a comment...', 'សរសេរមតិយោបល់...')}
                                                className={`w-full bg-white/5 border border-white/10 ${replyTo ? 'rounded-b-2xl border-t-0' : 'rounded-2xl'} p-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[120px] font-khmer transition-all`}
                                            />
                                            <button 
                                                type="submit"
                                                disabled={isSubmitting || !newComment.trim()}
                                                className="absolute bottom-4 right-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center gap-2"
                                            >
                                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                                {t('Post', 'បញ្ជូន')}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center mb-10">
                                        <p className="text-gray-400 font-khmer mb-4">{t('Please login to join the conversation.', 'សូមចូលប្រើប្រាស់ដើម្បីចូលរួមមតិយោបល់។')}</p>
                                        <button 
                                            onClick={() => window.location.hash = 'admin'}
                                            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all border border-white/10"
                                        >
                                            {t('Login Now', 'ចូលប្រើប្រាស់')}
                                        </button>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {isLoadingComments ? (
                                        <div className="flex flex-col items-center py-10 gap-3">
                                            <Loader2 size={30} className="text-indigo-500 animate-spin" />
                                            <p className="text-gray-500 text-sm font-khmer">Loading comments...</p>
                                        </div>
                                    ) : comments.length > 0 ? (
                                        comments.map(comment => (
                                            <CommentItem key={comment.id} comment={comment} />
                                        ))
                                    ) : (
                                        <div className="text-center py-10">
                                            <p className="text-gray-600 font-khmer italic">{t('No comments yet. Be the first to share your thoughts!', 'មិនទាន់មានមតិយោបល់នៅឡើយទេ។ ក្លាយជាអ្នកដំបូងដែលចែករំលែកគំនិតរបស់អ្នក!')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
