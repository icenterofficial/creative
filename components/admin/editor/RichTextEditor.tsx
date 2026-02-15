import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Heading, List, ListOrdered, Code, Link as LinkIcon, Quote, CheckSquare, Image as ImageIcon, Type, Download, Monitor, Upload, Loader2 } from 'lucide-react';
import { simpleHtmlToMd, simpleMdToHtml } from './converters';
import ContentRenderer from '../../ContentRenderer';
import { getSupabaseClient } from '../../../lib/supabase';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, label }) => {
    const [editorMode, setEditorMode] = useState<'markdown' | 'visual'>('markdown');
    const [activeView, setActiveView] = useState<'write' | 'preview'>('write');
    const [visualPreview, setVisualPreview] = useState(false);
    
    // Popups
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [showDownloadInput, setShowDownloadInput] = useState(false);
    const [tempData, setTempData] = useState({ url: '', text: '' });
    
    // Refs
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const visualEditorRef = useRef<HTMLDivElement>(null);
    const visualImageInputRef = useRef<HTMLInputElement>(null);
    const savedSelection = useRef<Range | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // --- SYNC CONTENT ---
    // When switching from Markdown to Visual, update the Visual div
    useEffect(() => {
        if (editorMode === 'visual' && visualEditorRef.current) {
            const currentHtml = visualEditorRef.current.innerHTML;
            const targetHtml = simpleMdToHtml(value);
            // Only update if significantly different (basic check to prevent cursor jumping if typing fast)
            if (currentHtml === '' || currentHtml === '<br>') {
                visualEditorRef.current.innerHTML = targetHtml;
            } else if (simpleHtmlToMd(currentHtml) !== value) {
                 // If external value changed (e.g. initial load), sync it
                 visualEditorRef.current.innerHTML = targetHtml;
            }
        }
    }, [editorMode]);

    // --- UTILS ---
    const uploadImage = async (file: File): Promise<string | null> => {
        const supabase = getSupabaseClient();
        if (!supabase) { alert("Database not connected"); return null; }
        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const { error } = await supabase.storage.from('uploads').upload(fileName, file);
            if (error) throw error;
            const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
            return data.publicUrl;
        } catch (error: any) {
            alert("Upload failed: " + error.message);
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    // --- VISUAL EDITOR LOGIC ---
    
    // 1. Selection Management (Critical for Link/Download)
    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            savedSelection.current = sel.getRangeAt(0);
        }
    };

    const restoreSelection = () => {
        const sel = window.getSelection();
        if (sel && savedSelection.current) {
            sel.removeAllRanges();
            sel.addRange(savedSelection.current);
        }
    };

    const handleVisualInput = () => {
        if (visualEditorRef.current) {
            const html = visualEditorRef.current.innerHTML;
            const md = simpleHtmlToMd(html);
            onChange(md);
        }
    };

    const execVisualCmd = (cmd: string, val: string = '') => {
        document.execCommand(cmd, false, val);
        handleVisualInput();
    };

    // Actions
    const handleVisualImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Save selection before upload in case focus is lost
            saveSelection();
            const url = await uploadImage(file);
            if (url) {
                restoreSelection();
                // Ensure we insert at cursor
                document.execCommand('insertHTML', false, `<img src="${url}" alt="image" style="max-width: 100%; border-radius: 8px; margin: 10px 0;" /><br>`);
                handleVisualInput();
            }
        }
    };

    const openLinkPopup = () => {
        saveSelection();
        setShowLinkInput(true);
        setTempData({ url: '', text: '' });
    };

    const insertVisualLink = () => {
        restoreSelection();
        if (tempData.url) {
            document.execCommand('createLink', false, tempData.url);
            handleVisualInput();
        }
        setShowLinkInput(false);
    };

    const openDownloadPopup = () => {
        saveSelection();
        setShowDownloadInput(true);
        setTempData({ url: '', text: '' });
    };

    const insertVisualDownload = () => {
        restoreSelection();
        if (tempData.url && tempData.text) {
            const html = `<div data-download-url="${tempData.url}" data-download-label="${tempData.text}" style="background:#1e1b4b; border:1px solid #4338ca; padding:10px; border-radius:8px; display:inline-block; margin: 10px 0; font-weight:bold; color:#a5b4fc; cursor:pointer;" contenteditable="false">⬇️ Download: ${tempData.text}</div><br>`;
            document.execCommand('insertHTML', false, html);
            handleVisualInput();
        }
        setShowDownloadInput(false);
    };

    // --- MARKDOWN EDITOR LOGIC ---
    const insertMarkdown = (prefix: string, suffix: string = '') => {
        if (!textareaRef.current) return;
        
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = value;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        // Special handling for link to auto-fill selection
        let newText = "";
        let newCursorPos = 0;

        if (prefix === '[' && suffix === '](url)') {
             // Link logic
             if (selection) {
                 newText = before + `[${selection}](url)` + after;
                 newCursorPos = start + selection.length + 3; // position at 'url'
             } else {
                 newText = before + `[text](url)` + after;
                 newCursorPos = start + 7; // position at 'url'
             }
        } else {
             // Standard logic
             newText = before + prefix + (selection || '') + suffix + after;
             newCursorPos = start + prefix.length + (selection ? selection.length : 0) + suffix.length;
        }

        onChange(newText);
        
        // Restore focus and cursor
        setTimeout(() => {
            textarea.focus();
            if (prefix === '[' && suffix === '](url)') {
                 // Highlight 'url' part
                 textarea.setSelectionRange(newCursorPos, newCursorPos + 3);
            } else if (!selection) {
                 // Place cursor inside tags if no selection
                 textarea.setSelectionRange(start + prefix.length, start + prefix.length);
            } else {
                 // Place cursor after
                 textarea.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    return (
        <div className="flex flex-col h-full mb-6">
            <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-bold text-gray-400">{label}</label>
                <div className="flex bg-gray-800 rounded-lg p-1 border border-white/10">
                    <button type="button" onClick={() => setEditorMode('markdown')} className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${editorMode === 'markdown' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}><Code size={12} /> Developer</button>
                    <button type="button" onClick={() => setEditorMode('visual')} className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${editorMode === 'visual' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}><Type size={12} /> General</button>
                </div>
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0d1117] flex flex-col h-[600px] relative">
                
                {/* --- TOOLBARS --- */}
                
                {/* Developer Toolbar */}
                {editorMode === 'markdown' && (
                    <div className="flex items-center justify-between px-2 py-2 border-b border-white/10 bg-[#0d1117] shrink-0">
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={() => setActiveView('write')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeView === 'write' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>Write</button>
                            <button type="button" onClick={() => setActiveView('preview')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeView === 'preview' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>Preview</button>
                        </div>
                        {activeView === 'write' && (
                            <div className="flex items-center gap-1">
                                <button type="button" onClick={() => insertMarkdown('# ')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Heading"><Heading size={16} /></button>
                                <button type="button" onClick={() => insertMarkdown('**', '**')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Bold"><Bold size={16} /></button>
                                <button type="button" onClick={() => insertMarkdown('*', '*')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Italic"><Italic size={16} /></button>
                                <div className="w-px h-4 bg-white/10 mx-1"></div>
                                <button type="button" onClick={() => insertMarkdown('> ')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Quote"><Quote size={16} /></button>
                                <button type="button" onClick={() => insertMarkdown('```\n', '\n```')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Code"><Code size={16} /></button>
                                <button type="button" onClick={() => insertMarkdown('[', '](url)')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Link"><LinkIcon size={16} /></button>
                                <button type="button" onClick={() => insertMarkdown('![alt](', ')')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Image"><ImageIcon size={16} /></button>
                                <button type="button" onClick={() => insertMarkdown('[[DOWNLOAD:URL:', ']]')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Download"><Download size={16} /></button>
                            </div>
                        )}
                    </div>
                )}

                {/* Visual Toolbar */}
                {editorMode === 'visual' && (
                    <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-[#161b22] shrink-0">
                        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                            <button type="button" onMouseDown={(e) => { e.preventDefault(); execVisualCmd('bold'); }} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded"><Bold size={18} /></button>
                            <button type="button" onMouseDown={(e) => { e.preventDefault(); execVisualCmd('italic'); }} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded"><Italic size={18} /></button>
                            <button type="button" onMouseDown={(e) => { e.preventDefault(); execVisualCmd('formatBlock', 'blockquote'); }} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded"><Quote size={18} /></button>
                            <div className="w-px h-5 bg-white/10 mx-1"></div>
                            
                            <button type="button" onMouseDown={(e) => { e.preventDefault(); openLinkPopup(); }} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded"><LinkIcon size={18} /></button>
                            
                            <div className="relative">
                                <button type="button" onClick={() => visualImageInputRef.current?.click()} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded flex items-center gap-1">
                                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />} <span className="text-xs">Photo</span>
                                </button>
                                <input type="file" ref={visualImageInputRef} className="hidden" accept="image/*" onChange={handleVisualImageUpload} />
                            </div>

                            <button type="button" onMouseDown={(e) => { e.preventDefault(); openDownloadPopup(); }} className="p-2 text-indigo-400 hover:text-white hover:bg-indigo-500/20 rounded flex items-center gap-1 font-bold">
                                <Download size={18} /> <span className="text-xs">Download Button</span>
                            </button>
                        </div>
                        
                        <button type="button" onClick={() => setVisualPreview(!visualPreview)} className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-bold ${visualPreview ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400'}`}>
                            <Monitor size={14} /> Preview
                        </button>
                    </div>
                )}

                {/* --- EDITING AREA --- */}
                <div className="flex-1 relative bg-[#0d1117] overflow-hidden">
                    {editorMode === 'markdown' ? (
                        activeView === 'preview' ? (
                            <div className="absolute inset-0 p-8 overflow-y-auto bg-[#0d1117]">
                                <ContentRenderer content={value} />
                            </div>
                        ) : (
                            <textarea
                                ref={textareaRef}
                                className="w-full h-full bg-[#0d1117] p-6 text-white focus:outline-none font-mono text-sm leading-relaxed resize-none"
                                placeholder="Write in Markdown..."
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                            />
                        )
                    ) : (
                        <>
                            <div 
                                ref={visualEditorRef}
                                contentEditable
                                onInput={handleVisualInput}
                                onBlur={handleVisualInput} // Ensure sync on blur
                                className="w-full h-full bg-[#0d1117] p-8 text-white focus:outline-none text-lg overflow-y-auto"
                                style={{ minHeight: '100%' }}
                            />
                            {visualPreview && (
                                <div className="absolute inset-0 p-8 overflow-y-auto bg-[#0d1117] z-20">
                                    <ContentRenderer content={value} />
                                </div>
                            )}
                        </>
                    )}

                    {/* --- POPUPS --- */}
                    {showLinkInput && (
                        <div className="absolute top-2 left-2 z-50 bg-gray-800 border border-white/10 p-4 rounded-xl shadow-2xl flex flex-col gap-2 w-72 animate-fade-in">
                            <h4 className="text-xs font-bold text-gray-400 uppercase">Insert Link</h4>
                            <input autoFocus placeholder="https://..." className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm text-white" value={tempData.url} onChange={e => setTempData({...tempData, url: e.target.value})} />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowLinkInput(false)} className="px-2 py-1 text-xs text-gray-400">Cancel</button>
                                <button type="button" onClick={insertVisualLink} className="px-3 py-1 bg-indigo-600 rounded text-xs text-white font-bold">Add Link</button>
                            </div>
                        </div>
                    )}

                    {showDownloadInput && (
                        <div className="absolute top-2 left-1/4 z-50 bg-gray-800 border border-white/10 p-4 rounded-xl shadow-2xl flex flex-col gap-2 w-80 animate-fade-in">
                            <h4 className="text-xs font-bold text-gray-400 uppercase">Insert Download Button</h4>
                            <input autoFocus placeholder="Label (e.g., Download PDF)" className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm text-white" value={tempData.text} onChange={e => setTempData({...tempData, text: e.target.value})} />
                            <input placeholder="URL (e.g., https://drive...)" className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm text-white" value={tempData.url} onChange={e => setTempData({...tempData, url: e.target.value})} />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowDownloadInput(false)} className="px-2 py-1 text-xs text-gray-400">Cancel</button>
                                <button type="button" onClick={insertVisualDownload} className="px-3 py-1 bg-indigo-600 rounded text-xs text-white font-bold">Insert Button</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RichTextEditor;
