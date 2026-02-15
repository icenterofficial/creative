import React, { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';

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
    if (typeof content !== 'string') return null;

    // Regex to split by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);

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
                            <blockquote key={key} className="border-l-4 border-indigo-500 pl-4 italic text-gray-400 my-4 bg-white/5 p-4 rounded-r-lg">
                                {trimmed.substring(2)}
                            </blockquote>
                        );
                    }

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

                    const dlMatch = trimmed.match(/\[\[DOWNLOAD:(.*?):(.*?)\]\]/);
                    if (dlMatch) {
                        const [_, url, label] = dlMatch;
                        return (
                            <div key={key} className="my-10 flex justify-center">
                                <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="group relative inline-flex items-center gap-4 px-8 py-4 bg-gray-900 border border-white/10 rounded-2xl text-white font-bold text-lg hover:scale-105 transition-all"
                                >
                                    <div className="flex flex-col text-left">
                                        <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Free Resource</span>
                                        <span className="font-bold font-khmer">{label}</span>
                                    </div>
                                    <Download size={24} />
                                </a>
                            </div>
                        );
                    }

                    if (trimmed.startsWith('#')) {
                        const level = trimmed.match(/^#+/)?.[0].length || 0;
                        const text = trimmed.replace(/^#+\s*/, '');
                        const sizes = {
                            1: 'text-4xl mt-10 mb-6',
                            2: 'text-3xl mt-8 mb-4',
                            3: 'text-2xl mt-8 mb-4',
                            4: 'text-xl mt-6 mb-3',
                        };
                        const className = `${sizes[level as 1|2|3|4] || 'text-lg font-bold mt-4 mb-2'} font-bold text-white`;
                        return <h3 key={key} className={className}>{text}</h3>;
                    }

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

                    const htmlContent = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
                    return <p key={key} dangerouslySetInnerHTML={{ __html: htmlContent }} className="mb-4" />;
                });
            })}
        </div>
    );
};

export default ContentRenderer;
