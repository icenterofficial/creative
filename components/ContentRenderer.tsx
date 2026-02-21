import React, { useState } from 'react';
import { Check, Copy, Download, ExternalLink, Quote } from 'lucide-react';

interface CodeBlockProps {
    code: string;
    language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'text' }) => {
    const [copied, setCopied] = useState(false);
    
    const highlightSyntax = (codeStr: string) => {
        if (!codeStr) return '';
        let highlighted = codeStr
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/|\/\/.*)/g, '<span class="text-gray-500 italic">$1</span>');
        
        if (language === 'css') {
            highlighted = highlighted
                .replace(/([a-z-]+)\s*:/g, '<span class="text-sky-300">$1</span>:')
                .replace(/:([^;]+);/g, ':<span class="text-emerald-300">$1</span>;')
                .replace(/(\.[a-zA-Z0-9_-]+)/g, '<span class="text-yellow-300">$1</span>')
                .replace(/(@media|@import|@keyframes)/g, '<span class="text-purple-400">$1</span>');
        } else {
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
            <div className="flex justify-between items-center px-4 py-3 bg-[#252526] border-b border-white/5">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
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
            <div className="p-4 md:p-6 overflow-x-auto">
                <pre className="font-mono text-sm leading-relaxed text-gray-300">
                    <code dangerouslySetInnerHTML={{ __html: highlightSyntax(code) }} />
                </pre>
            </div>
        </div>
    );
};

const ContentRenderer: React.FC<{ content: string }> = ({ content }) => {
    // 1. បន្ថែមការការពារ: ប្រសិនបើ content មិនមែនជា string ឫគ្មានទិន្នន័យ ឲ្យវាក្លាយជា string ទទេ
    const safeContent = content || '';
    if (typeof safeContent !== 'string' || safeContent.trim() === '') return null;

    // 2. ប្រើ safeContent ជំនួសវិញ
    const parts = safeContent.split(/(```[\s\S]*?```)/g);

    return (
        <div className="text-gray-300 leading-relaxed font-khmer text-lg">
            {parts.map((part, index) => {
                if (part.startsWith('```')) {
                    const lines = part.split('\n');
                    let lang = 'text';
                    let code = '';
                    if (lines.length > 0) {
                        const firstLine = lines[0].replace('```', '').trim();
                        lang = firstLine || 'text';
                        let rawCode = lines.slice(1).join('\n');
                        if (rawCode.trimEnd().endsWith('```')) {
                             rawCode = rawCode.replace(/```\s*$/, '');
                        }
                        code = rawCode;
                    }
                    return <CodeBlock key={index} code={code} language={lang} />;
                }

                // Normal text processing
                const lines = part.split('\n');
                return lines.map((line, lineIdx) => {
                    const trimmed = line.trim();
                    const key = `${index}-${lineIdx}`;
                    if (!trimmed) return <div key={key} className="h-4"></div>;

                    // Blockquotes
                    if (trimmed.startsWith('> ')) {
                        return (
                            <blockquote key={key} className="border-l-4 border-indigo-500 pl-6 italic text-gray-400 my-6 bg-indigo-900/10 p-6 rounded-r-2xl border-y border-r border-indigo-500/10 relative">
                                <Quote className="absolute top-4 right-4 text-indigo-500/10 rotate-180" size={40}/>
                                <span className="relative z-10">{trimmed.substring(2)}</span>
                            </blockquote>
                        );
                    }

                    const imgMatch = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
                    if (imgMatch) {
                        const [_, alt, src] = imgMatch;
                        return (
                            <div key={key} className="my-8 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-gray-900 group">
                                <img src={src} alt={alt} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                                {alt && <p className="text-center text-xs text-gray-500 mt-2 p-3 bg-gray-950/50 italic border-t border-white/5">{alt}</p>}
                            </div>
                        );
                    }

                    // --- NEW PROFESSIONAL DOWNLOAD CARD RENDERER ---
                    const dlMatch = trimmed.match(/\[\[DOWNLOAD:(.*?):(.*?)\]\]/);
                    if (dlMatch) {
                        const [_, url, label] = dlMatch;
                        return (
                            <div key={key} className="my-8">
                                <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="group relative flex items-center justify-between p-1 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 overflow-hidden"
                                >
                                    {/* Hover Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    
                                    <div className="flex items-center gap-5 p-4 md:p-5 relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0 group-hover:scale-110 transition-transform duration-300">
                                            <Download size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors font-khmer">{label}</h4>
                                            <p className="text-xs text-indigo-300/70 uppercase tracking-wider font-bold flex items-center gap-1 mt-1">
                                                Click to Download
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pr-6 text-gray-500 group-hover:text-white transition-colors relative z-10 hidden md:block">
                                        <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </div>
                                </a>
                            </div>
                        );
                    }

                    if (trimmed.startsWith('#')) {
                        const level = trimmed.match(/^#+/)?.[0].length || 0;
                        const text = trimmed.replace(/^#+\s*/, '');
                        const sizes = {
                            1: 'text-4xl mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400',
                            2: 'text-3xl mt-10 mb-5 text-white',
                            3: 'text-2xl mt-8 mb-4 text-indigo-200',
                            4: 'text-xl mt-6 mb-3 text-white',
                        };
                        const className = `${sizes[level as 1|2|3|4] || 'text-lg font-bold mt-4 mb-2'} font-bold font-khmer leading-tight`;
                        return <h3 key={key} className={className}>{text}</h3>;
                    }

                    if (/^(\d+\.|-)\s/.test(trimmed)) {
                        const content = trimmed.replace(/^(\d+\.|-)\s/, '');
                        const boldedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
                        
                        // Check if link inside list item
                        const linkedContent = boldedContent.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-500/30 hover:decoration-indigo-500 transition-all">$1</a>');

                        return (
                            <div key={key} className="flex items-start gap-4 mb-3 ml-2 group">
                                <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-150 transition-transform shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                <span dangerouslySetInnerHTML={{ __html: linkedContent }} className="text-gray-300 group-hover:text-gray-200 transition-colors" />
                            </div>
                        );
                    }

                    let htmlContent = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
                    htmlContent = htmlContent.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-500/30 hover:decoration-indigo-500 transition-all font-bold">$1</a>');
                    
                    return <p key={key} dangerouslySetInnerHTML={{ __html: htmlContent }} className="mb-4 text-lg text-gray-300 leading-8" />;
                });
            })}
        </div>
    );
};

export default ContentRenderer;
