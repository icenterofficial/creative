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
    useEffect(() => {
        if (editorMode === 'visual' && visualEditorRef.current) {
            const currentHtml = visualEditorRef.current.innerHTML;
            const targetHtml = simpleMdToHtml(value);
            // Check content difference to avoid cursor jumping, but allow initial load
            if (visualEditorRef.current.innerHTML.trim() !== targetHtml.trim()) {
                 // Only update if the structure is different (simple check)
                 // For a robust app, we'd use a diffing algo, but here we just check if it's vastly different
                 // or empty.
                 if(!visualEditorRef.current.innerHTML || activeView === 'write') {
                     visualEditorRef.current.innerHTML = targetHtml;
                 }
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
            saveSelection();
            const url = await uploadImage(file);
            if (url) {
                restoreSelection();
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
            // New Professional HTML Structure for Visual Editor
            const html = `
                <div class="download-card-wrapper" contenteditable="false" style="margin: 20px 0;">
                    <div class="download-card" data-download-url="${tempData.url}" data-download-label="${tempData.text}" style="display: flex; align-items: center; gap: 16px; padding: 16px; background: rgba(30, 27, 75, 0.5); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; cursor: pointer;">
                        <div class="download-icon" style="background: rgba(99, 102, 241, 0.2); color: #818cf8; padding: 10px; border-radius: 8px;">
                            ⬇️
                        </div>
                        <div class="download-info" style="flex: 1;">
                            <span class="download-label" style="display: block; font-weight: bold; color: white; font-size: 16px;">${tempData.text}</span>
                            <span class="download-sub" style="display: block; color: #94a3b8; font-size: 12px;">Click to download resource</span>
                        </div>
                        <div class="download-action" style="color: #475569;">
                            ↗
                        </div>
                    </div>
                </div><br>
            `;
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

        let newText = "";
        let newCursorPos = 0;

        if (prefix === '[' && suffix === '](url)') {
             if (selection) {
                 newText = before + `[${selection}](url)` + after;
                 newCursorPos = start + selection.length + 3; 
             } else {
                 newText = before + `[text](url)` + after;
                 newCursorPos = start + 7; 
             }
        } else {
             newText = before + prefix + (selection || '') + suffix + after;
             newCursorPos = start + prefix.length + (selection ? selection.length : 0) + suffix.length;
        }

        onChange(newText);
        
        setTimeout(() => {
            textarea.focus();
            if (prefix === '[' && suffix === '](url)') {
                 textarea.setSelectionRange(newCursorPos, newCursorPos + 3);
            } else if (!selection) {
                 textarea.setSelectionRange(start + prefix.length, start + prefix.length);
            } else {
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

                            <button type="button" onMouseDown={(e) => { e.preventDefault(); openDownloadPopup(); }} className="ml-2 px-3 py-1.5 text-indigo-200 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 hover:text-white rounded-lg flex items-center gap-2 font-bold text-xs transition-colors">
                                <Download size={14} /> Download Button
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
                                onBlur={handleVisualInput}
                                className="w-full h-full bg-[#0d1117] p-8 text-white focus:outline-none text-lg overflow-y-auto editor-styles"
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
                        <div className="absolute top-12 left-4 z-50 bg-gray-900 border border-white/10 p-4 rounded-xl shadow-2xl flex flex-col gap-2 w-80 animate-fade-in">
                            <h4 className="text-xs font-bold text-gray-400 uppercase">Insert Link</h4>
                            <input autoFocus placeholder="https://..." className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm text-white" value={tempData.url} onChange={e => setTempData({...tempData, url: e.target.value})} />
                            <div className="flex justify-end gap-2 mt-2">
                                <button type="button" onClick={() => setShowLinkInput(false)} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white">Cancel</button>
                                <button type="button" onClick={insertVisualLink} className="px-4 py-1.5 bg-indigo-600 rounded-lg text-xs text-white font-bold hover:bg-indigo-500">Insert</button>
                            </div>
                        </div>
                    )}

                    {showDownloadInput && (
                        <div className="absolute top-12 left-1/3 z-50 bg-gray-900 border border-white/10 p-4 rounded-xl shadow-2xl flex flex-col gap-3 w-96 animate-fade-in">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-indigo-400 uppercase">New Download Button</h4>
                                <button onClick={() => setShowDownloadInput(false)}><Upload size={14} className="text-gray-500 hover:text-white"/></button>
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-500 font-bold uppercase">Button Label</label>
                                <input autoFocus placeholder="e.g. Download Annual Report" className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm text-white focus:border-indigo-500 outline-none transition-colors" value={tempData.text} onChange={e => setTempData({...tempData, text: e.target.value})} />
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-500 font-bold uppercase">File URL</label>
                                <input placeholder="https://drive.google.com/..." className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm text-white focus:border-indigo-500 outline-none transition-colors" value={tempData.url} onChange={e => setTempData({...tempData, url: e.target.value})} />
                            </div>

                            <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/5">
                                <button type="button" onClick={() => setShowDownloadInput(false)} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white">Cancel</button>
                                <button type="button" onClick={insertVisualDownload} className="px-4 py-1.5 bg-indigo-600 rounded-lg text-xs text-white font-bold hover:bg-indigo-500 flex items-center gap-1">
                                    <Download size={12} /> Insert Button
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Custom Styles for Editor */}
            <style>{`
                .editor-styles blockquote {
                    border-left: 4px solid #6366f1;
                    padding-left: 16px;
                    margin: 16px 0;
                    font-style: italic;
                    color: #94a3b8;
                    background: rgba(255,255,255,0.05);
                    padding: 12px 16px;
                    border-radius: 0 8px 8px 0;
                }
                .editor-styles a {
                    color: #818cf8;
                    text-decoration: underline;
                }
                .editor-styles img {
                    border-radius: 8px;
                    max-width: 100%;
                    margin: 10px 0;
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
