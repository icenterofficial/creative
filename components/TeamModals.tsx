import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Facebook, Send, FileText, User, Code, Briefcase, Calendar, Tag, MessageCircle, Share2, Check, Copy, Download } from 'lucide-react';
import { TeamMember, Post, Comment } from '../types';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';

// --- Helper Functions ---
// Moved getPostCount logic inside components or passed as prop to avoid context issue outside component tree
// But for cleaner code here, we export a hook-friendly version or just use the hook inside the modal.

// Helper to count comments recursively
const getTotalCommentCount = (comments: Comment[]): number => {
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
    const { insights } = useData();
    const postCount = insights.filter(post => post.authorId === member.id).length;

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
                        {member.socials.facebook && (
                            <a href={member.socials.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 border border-white/10 text-gray-400 rounded-lg hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all">
                                <Facebook size={18} />
                            </a>
                        )}
                        {member.socials.telegram && (
                            <a href={member.socials.telegram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 border border-white/10 text-gray-400 rounded-lg hover:bg-[#229ED9] hover:text-white hover:border-[#229ED9] transition-all">
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
                                {member.skills.map(skill => (
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
                                {(t(member.experience.join('|'), (member.experienceKm || member.experience).join('|'))).split('|').map((exp, idx) => (
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

interface CodeBlockProps {
    code: string;
    language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'css' }) => {
    const [copied, setCopied] = useState(false);
    
    // Improved simple syntax highlighting
    const highlightSyntax = (codeStr: string) => {
        let highlighted = codeStr
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Comments
        highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/|\/\/.*)/g, '<span class="text-gray-500 italic">$1</span>');
        
        // CSS specific
        if (language === 'css') {
            highlighted = highlighted
                .replace(/([a-z-]+)\s*:/g, '<span class="text-sky-300">$1</span>:') // Properties
                .replace(/:([^;]+);/g, ':<span class="text-emerald-300">$1</span>;') // Values
                .replace(/(\.[a-zA-Z0-9_-]+)/g, '<span class="text-yellow-300">$1</span>') // Classes
                .replace(/(@media|@import|@keyframes)/g, '<span class="text-purple-400">$1</span>'); // At-rules
        } 
        // JS specific (basic)
        else {
             highlighted = highlighted
                .replace(/\b(const|let|var|function|return|import|export|from|class|extends|if|else|for|while|try|catch|async|await|new)\b/g, '<span class="text-purple-400">$1</span>')
                .replace(/(['"`].*?['"`])/g, '<span class="text-emerald-300">$1</span>')
                .replace(/\b(\d+)\b/g, '<span class="text-orange-300">$1</span>');
        }

        return highlighted;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(code.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-6 rounded-xl overflow-hidden bg-[#1e1e1e] border border-white/10 shadow-2xl">
            {/* Mac-style Window Header */}
            <div className="flex justify-between items-center px-4 py-3 bg-[#252526] border-b border-white/5">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-transparent hover:border-black/20" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-transparent hover:border-black/20" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-transparent hover:border-black/20" />
                </div>
                <div className="text-xs font-mono text-gray-500 uppercase">{language}</div>
                <button 
                    onClick={handleCopy} 
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
                >
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            
            {/* Code Content */}
            <div className="p-4 md:p-6 overflow-x-auto">
                <pre className="font-mono text-sm leading-relaxed text-gray-300">
                    <code dangerouslySetInnerHTML={{ __html: highlightSyntax(code) }} />
                </pre>
            </div>
        </div>
    );
};

export const ContentRenderer: React.FC<{ content: string }> = ({ content }) => {
    // 1. Split by Code Blocks first using a simpler non-greedy regex
    // This catches everything between triple backticks, handling newlines properly
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
        <div className="text-gray-300 leading-relaxed font-khmer text-lg">
            {parts.map((part, index) => {
                // CODE BLOCK Handling
                if (part.startsWith('```')) {
                    // Extract content manually to avoid strict regex issues with the first line
                    // Default values
                    let lang = 'text';
                    let code = '';

                    // Split into lines to separate language tag from code
                    const lines = part.split('\n');
                    
                    if (lines.length > 0) {
                        // First line contains ```lang
                        const firstLine = lines[0].replace('```', '').trim();
                        lang = firstLine || 'text';
                        
                        // Remaining lines are code (minus the last line if it is just ```)
                        // slice(1) gets lines after the first. 
                        // We rejoin them, then trim the trailing ```
                        let rawCode = lines.slice(1).join('\n');
                        
                        // Remove trailing ``` 
                        if (rawCode.trimEnd().endsWith('```')) {
                             rawCode = rawCode.replace(/```\s*$/, '');
                        }
                        code = rawCode;
                    }

                    return <CodeBlock key={index} code={code} language={lang} />;
                }

                // NORMAL TEXT Processing (Line by Line)
                const lines = part.split('\n');

                return lines.map((line, lineIdx) => {
                    const trimmed = line.trim();
                    const key = `${index}-${lineIdx}`;

                    if (!trimmed) return <div key={key} className="h-4"></div>; // Manual spacing for empty lines

                    // 1. IMAGE: ![alt](url)
                    // We use a relaxed regex to find it anywhere in the line
                    const imgMatch = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
                    if (imgMatch) {
                        const [_, alt, src] = imgMatch;
                        return (
                            <div key={key} className="my-8 rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-gray-900">
                                <img src={src} alt={alt} className="w-full h-auto object-cover" />
                                {alt && <p className="text-center text-sm text-gray-500 mt-2 p-2">{alt}</p>}
                            </div>
                        );
                    }

                    // 2. DOWNLOAD BUTTON: [[DOWNLOAD:url:label]]
                    const dlMatch = trimmed.match(/\[\[DOWNLOAD:(.*?):(.*?)\]\]/);
                    if (dlMatch) {
                        const [_, url, label] = dlMatch;
                        return (
                            <div key={key} className="my-10 flex justify-center">
                                <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="group relative inline-flex items-center gap-4 px-8 py-4 bg-gray-900 border border-white/10 rounded-2xl text-white font-bold text-lg shadow-[0_0_30px_rgba(79,70,229,0.15)] hover:shadow-[0_0_50px_rgba(79,70,229,0.3)] hover:scale-105 transition-all overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 group-hover:opacity-100 transition-opacity" />
                                    <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg group-hover:rotate-12 transition-transform duration-300">
                                        <Download size={24} />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Free Resource</span>
                                        <span className="font-bold font-khmer">{label}</span>
                                    </div>
                                </a>
                            </div>
                        );
                    }

                    // 3. HEADER: ### Title
                    if (trimmed.startsWith('#')) {
                        // Count hashes
                        const level = trimmed.match(/^#+/)?.[0].length || 0;
                        const text = trimmed.replace(/^#+\s*/, '');
                        
                        // Sizes based on level (simplified)
                        const sizes = {
                            1: 'text-4xl mt-10 mb-6',
                            2: 'text-3xl mt-8 mb-4',
                            3: 'text-2xl mt-8 mb-4',
                            4: 'text-xl mt-6 mb-3',
                        };
                        const className = `${sizes[level as 1|2|3|4] || 'text-lg font-bold mt-4 mb-2'} font-bold text-white`;

                        return <h3 key={key} className={className}>{text}</h3>;
                    }

                    // 4. LIST ITEM: 1. or -
                    if (/^(\d+\.|-)\s/.test(trimmed)) {
                        const content = trimmed.replace(/^(\d+\.|-)\s/, '');
                        const boldedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
                        return (
                            <div key={key} className="flex items-start gap-3 mb-3 ml-2">
                                <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                <span dangerouslySetInnerHTML={{ __html: boldedContent }} className="text-gray-300" />
                            </div>
                        );
                    }

                    // 5. NORMAL PARAGRAPH
                    const htmlContent = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
                    return (
                        <p key={key} dangerouslySetInnerHTML={{ __html: htmlContent }} className="mb-4" />
                    );
                });
            })}
        </div>
    );
};

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({ post, onClose, onAuthorClick }) => {
    const { t } = useLanguage();
    const [showShare, setShowShare] = useState(false);
    const [copied, setCopied] = useState(false);
    const [comments, setComments] = useState<Comment[]>(post.comments || []);
    const [newCommentText, setNewCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper for author name lookup
    const getAuthorName = (id: string) => {
       const { team } = useData();
       const member = team.find(m => m.id === id);
       return member?.name || 'Author';
    };

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

    const handleSendComment = () => {
        if (!newCommentText.trim()) return;
        setIsSubmitting(true);
        setTimeout(() => {
            const newComment: Comment = {
                id: Date.now().toString(),
                user: "Guest User",
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
                content: newCommentText,
                date: "Just now",
                replies: []
            };
            setComments(prev => [...prev, newComment]);
            setNewCommentText('');
            setIsSubmitting(false);
        }, 600);
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

                                <h2 className="text-2xl md:text-5xl font-bold text-white mb-6 leading-tight font-khmer">{t(post.title, post.titleKm)}</h2>
                                
                                <div className="border-b border-white/10 pb-8 mb-8">
                                    <ContentRenderer content={post.content || post.excerpt} />
                                </div>
                                
                                {/* Simple Comments View for Reuse */}
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-4 font-khmer">{t('Comments', 'មតិយោបល់')} ({totalComments})</h3>
                                    <div className="flex gap-3 mb-6">
                                        <input 
                                            value={newCommentText} 
                                            onChange={e => setNewCommentText(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSendComment()}
                                            placeholder={t('Write a comment...', 'សរសេរមតិយោបល់...')} 
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-indigo-500 font-khmer"
                                        />
                                        <button onClick={handleSendComment} disabled={!newCommentText.trim() || isSubmitting} className="p-3 rounded-xl bg-indigo-600 text-white disabled:opacity-50"><Send size={20} /></button>
                                    </div>
                                    <div className="space-y-4">
                                        {comments.map(c => (
                                            <div key={c.id} className="flex gap-3">
                                                <img src={c.avatar} className="w-8 h-8 rounded-full" />
                                                <div className="bg-white/5 p-3 rounded-xl">
                                                    <p className="font-bold text-sm text-white">{c.user}</p>
                                                    <p className="text-gray-300 text-sm">{c.content}</p>
                                                </div>
                                            </div>
                                        ))}
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