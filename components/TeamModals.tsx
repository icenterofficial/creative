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
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 overflow-hidden">
            <div 
                className="absolute inset-0 bg-gray-950/95 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            />
            <div className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scale-up z-[10003] flex flex-col max-h-[90vh]">
                {/* Header / Cover */}
                <div className="h-32 bg-gray-800 relative shrink-0 overflow-hidden">
                    {member.coverImage ? (
                        <img 
                            src={member.coverImage} 
                            alt="" 
                            className="w-full h-full object-cover opacity-50"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-indigo-600/20 to-purple-600/20" />
                    )}
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md z-10"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Profile Info */}
                <div className="px-8 pb-8 flex-1 overflow-y-auto scrollbar-hide">
                    <div className="relative -mt-12 mb-6">
                        <img 
                            src={member.image} 
                            alt={member.name} 
                            className="w-24 h-24 rounded-2xl border-4 border-gray-900 object-cover shadow-xl"
                        />
                        <div className="mt-4">
                            <h3 className="text-2xl font-bold text-white">{member.name}</h3>
                            <p className="text-indigo-400 font-medium font-khmer">{t(member.role, member.roleKm)}</p>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-3 mb-8">
                        {socials.facebook && (
                            <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/5">
                                <Facebook size={18} />
                            </a>
                        )}
                        {socials.telegram && (
                            <a href={socials.telegram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/5">
                                <Send size={18} />
                            </a>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{t('Projects', 'គម្រោង')}</p>
                            <p className="text-xl font-bold text-white">12+</p>
                        </div>
                        <button 
                            onClick={() => onShowArticles(member)}
                            className="bg-white/5 rounded-2xl p-4 border border-white/5 text-left hover:bg-white/10 transition-all group"
                        >
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{t('Articles', 'អត្ថបទ')}</p>
                            <p className="text-xl font-bold text-white flex items-center justify-between">
                                {postCount}
                                <ArrowRight size={18} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
                            </p>
                        </button>
                    </div>

                    {/* Skills */}
                    <div className="mb-8">
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Code size={18} className="text-indigo-400" />
                            {t('Expertise', 'ជំនាញ')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill, i) => (
                                <span key={i} className="px-3 py-1 bg-indigo-500/10 text-indigo-300 text-xs rounded-lg border border-indigo-500/20">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Experience */}
                    <div>
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Briefcase size={18} className="text-indigo-400" />
                            {t('Experience', 'បទពិសោធន៍')}
                        </h4>
                        <div className="space-y-4">
                            {(language === 'km' ? experienceKm : experience).map((exp, i) => (
                                <div key={i} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-indigo-500 before:rounded-full">
                                    <p className="text-gray-300 text-sm font-khmer leading-relaxed">{exp}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

// --- Author Articles Modal ---
interface AuthorArticlesModalProps {
    author: TeamMember;
    posts: Post[];
    onClose: () => void;
    onSelectPost: (post: Post) => void;
}

export const AuthorArticlesModal: React.FC<AuthorArticlesModalProps> = ({ author, posts, onClose, onSelectPost }) => {
    const { t } = useLanguage();

    return createPortal(
        <div className="fixed inset-0 z-[10004] flex items-center justify-center p-4 overflow-hidden">
            <div 
                className="absolute inset-0 bg-gray-950/95 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            />
            <div className="relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scale-up z-[10005] flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gray-900 z-10">
                    <div className="flex items-center gap-4">
                        <img src={author.image} alt={author.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                            <h3 className="text-lg font-bold text-white">{author.name}</h3>
                            <p className="text-xs text-gray-500 font-khmer">{t('All Articles', 'អត្ថបទទាំងអស់')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <article 
                                key={post.id} 
                                className="group flex gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer"
                                onClick={() => onSelectPost(post)}
                            >
                                <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden">
                                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{post.category}</span>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
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
    const { t, language } = useLanguage();
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
        <div className="fixed inset-0 z-[10006] flex items-center justify-center p-0 md:p-4 overflow-hidden">
            <div 
                className="absolute inset-0 bg-gray-950/95 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            />
            <div className="relative w-full max-w-4xl h-full md:h-[95vh] bg-gray-900 md:border md:border-white/10 md:rounded-3xl shadow-2xl overflow-hidden animate-scale-up flex flex-col z-[10007]">
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

                                {isLoadingComments ? (
                                    <div className="flex items-center gap-2 text-gray-500 py-10">
                                        <Loader2 className="animate-spin" size={20} />
                                        <span className="text-sm">Loading comments...</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {comments.length > 0 ? (
                                            comments.map(comment => (
                                                <CommentItem key={comment.id} comment={comment} />
                                            ))
                                        ) : (
                                            <div className="bg-white/5 rounded-2xl p-10 text-center border border-white/5 border-dashed">
                                                <p className="text-gray-500 text-sm font-khmer">{t('No comments yet. Be the first to share your thoughts!', 'មិនទាន់មានមតិយោបល់នៅឡើយទេ។ ក្លាយជាអ្នកដំបូងដែលចែករំលែកគំនិតរបស់អ្នក!')}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Comment Form */}
                                <div className="mt-12 bg-white/5 rounded-3xl p-6 border border-white/5">
                                    {currentUser ? (
                                        <form onSubmit={handleSubmitComment}>
                                            {replyTo && (
                                                <div className="flex items-center justify-between bg-indigo-500/10 px-4 py-2 rounded-xl mb-4 border border-indigo-500/20">
                                                    <p className="text-xs text-indigo-300">Replying to <span className="font-bold">{replyTo.name}</span></p>
                                                    <button type="button" onClick={() => setReplyTo(null)} className="text-gray-500 hover:text-white"><X size={14} /></button>
                                                </div>
                                            )}
                                            <textarea 
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder={t('Write your comment...', 'សរសេរមតិយោបល់របស់អ្នក...')}
                                                className="w-full bg-transparent border-none focus:ring-0 text-white font-khmer resize-none min-h-[100px]"
                                            />
                                            <div className="flex justify-end mt-4">
                                                <button 
                                                    type="submit" 
                                                    disabled={isSubmitting || !newComment.trim()}
                                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 text-sm"
                                                >
                                                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                                    {t('Post Comment', 'ផ្ញើមតិ')}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-gray-400 text-sm font-khmer mb-4">{t('Please log in to join the discussion.', 'សូមចូលគណនីដើម្បីចូលរួមការពិភាក្សា។')}</p>
                                            <button 
                                                onClick={() => window.location.hash = 'admin'}
                                                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all text-sm font-bold"
                                            >
                                                {t('Login Now', 'ចូលគណនីឥឡូវនេះ')}
                                            </button>
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
