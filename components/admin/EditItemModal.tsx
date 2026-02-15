import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Loader2, Upload, Image as ImageIcon, Bold, Italic, Heading, List, ListOrdered, Code, Link as LinkIcon, Quote, CheckSquare, User, Eye, Type, Download, Monitor } from 'lucide-react';
import { getSupabaseClient } from '../../lib/supabase';
import ContentRenderer from '../ContentRenderer';
import { useData } from '../../contexts/DataContext';

interface EditItemModalProps {
  isOpen: boolean;
  isAdding: boolean;
  activeTab: string;
  isSuperAdmin: boolean;
  editingItem: any;
  setEditingItem: (item: any) => void;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSaving: boolean;
  apiToken: string | null;
}

// --- HTML <-> Markdown Converters ---
const simpleMdToHtml = (md: string) => {
    if (!md) return '';
    let html = md
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        // Headings
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold/Italic
        .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
        .replace(/\*(.*?)\*/gim, '<i>$1</i>')
        // Lists
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/^\d\. (.*$)/gim, '<li>$1</li>')
        // Quote
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        // Images
        .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" style="max-width:100%; border-radius: 8px; margin: 10px 0;" />')
        // Links
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" style="color: #818cf8; text-decoration: underline;">$1</a>')
        // Download Button (Custom Syntax)
        .replace(/\[\[DOWNLOAD:(.*?):(.*?)\]\]/gim, '<div data-download-url="$1" data-download-label="$2" style="background:#1e1b4b; border:1px solid #4338ca; padding:10px; border-radius:8px; display:inline-block; margin: 10px 0; font-weight:bold; color:#a5b4fc;">⬇️ Download: $2</div>')
        // Newlines
        .replace(/\n/g, '<br>');
    return html;
};

const simpleHtmlToMd = (html: string) => {
    let text = html;
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<div>/gi, '\n');
    text = text.replace(/<\/div>/gi, '');
    text = text.replace(/<p>/gi, '\n');
    text = text.replace(/<\/p>/gi, '\n');
    text = text.replace(/<b>|<strong>/gi, '**');
    text = text.replace(/<\/b>|<\/strong>/gi, '**');
    text = text.replace(/<i>|<em>/gi, '*');
    text = text.replace(/<\/i>|<\/em>/gi, '*');
    text = text.replace(/<h1>/gi, '# ');
    text = text.replace(/<\/h1>/gi, '\n');
    text = text.replace(/<h2>/gi, '## ');
    text = text.replace(/<\/h2>/gi, '\n');
    text = text.replace(/<h3>/gi, '### ');
    text = text.replace(/<\/h3>/gi, '\n');
    text = text.replace(/<ul>|<ol>/gi, '');
    text = text.replace(/<\/ul>|<\/ol>/gi, '');
    text = text.replace(/<li>/gi, '- ');
    text = text.replace(/<\/li>/gi, '\n');
    text = text.replace(/<blockquote>/gi, '> ');
    text = text.replace(/<\/blockquote>/gi, '\n');
    text = text.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');
    text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    // Parse Custom Download Div back to syntax
    text = text.replace(/<div[^>]*data-download-url="([^"]*)"[^>]*data-download-label="([^"]*)"[^>]*>.*?<\/div>/gi, '[[DOWNLOAD:$1:$2]]');
    
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    return text.trim();
};

const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen, isAdding, activeTab, isSuperAdmin, editingItem, setEditingItem, onSave, onCancel, isSaving
}) => {
  const { team } = useData();
  const [isUploading, setIsUploading] = useState(false);
  const [editorMode, setEditorMode] = useState<'markdown' | 'visual'>('markdown'); 
  const [activeView, setActiveView] = useState<'write' | 'preview'>('write'); // For Dev Mode
  const [visualPreview, setVisualPreview] = useState(false); // For Visual Mode
  
  // Helpers for Popups in Visual Mode
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showDownloadInput, setShowDownloadInput] = useState(false);
  const [tempLink, setTempLink] = useState({ url: '', text: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const visualImageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const visualEditorRef = useRef<HTMLDivElement>(null);

  // Sync Content on Open/Mode Switch
  useEffect(() => {
    if (isOpen && editingItem) {
        // Reset states
        setActiveView('write');
        setVisualPreview(false);
        
        // Default to Markdown for developers/admins if not specified
        if (!editorMode) setEditorMode('markdown');
    }
  }, [isOpen]);

  // Sync Visual Editor Content
  useEffect(() => {
      if (editorMode === 'visual' && visualEditorRef.current && !visualPreview) {
          const currentMd = editingItem.content || editingItem.description || editingItem.bio || '';
          if (visualEditorRef.current.innerHTML !== simpleMdToHtml(currentMd)) {
             visualEditorRef.current.innerHTML = simpleMdToHtml(currentMd);
          }
      }
  }, [editorMode, visualPreview, editingItem.content]);

  if (!isOpen || !editingItem) return null;

  // Generic Image Upload
  const uploadImage = async (file: File): Promise<string | null> => {
      const supabase = getSupabaseClient();
      if (!supabase) {
          alert("Database not connected");
          return null;
      }

      setIsUploading(true);
      try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage.from('uploads').upload(filePath, file);
          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(filePath);
          return publicUrl;
      } catch (error: any) {
          console.error("Upload failed:", error);
          alert("Upload failed: " + error.message);
          return null;
      } finally {
          setIsUploading(false);
      }
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const url = await uploadImage(file);
          if (url) setEditingItem({ ...editingItem, image: url });
      }
  };

  const handleVisualImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const url = await uploadImage(file);
          if (url) {
              document.execCommand('insertImage', false, url);
              handleVisualInput();
          }
      }
  };

  // Markdown Insertion Logic
  const insertMarkdown = (prefix: string, suffix: string = '') => {
      if (!textareaRef.current) return;
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = typeof editingItem.content === 'string' ? editingItem.content : '';
      const before = text.substring(0, start);
      const selection = text.substring(start, end);
      const after = text.substring(end);
      const newText = before + prefix + (selection || 'text') + suffix + after;
      setEditingItem({ ...editingItem, content: newText });
      setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      }, 0);
  };

  // Visual Editor Logic
  const execVisualCmd = (cmd: string, val: string = '') => {
      document.execCommand(cmd, false, val);
      handleVisualInput();
  };

  const insertVisualDownload = () => {
      if(tempLink.url && tempLink.text) {
          const html = `<div data-download-url="${tempLink.url}" data-download-label="${tempLink.text}" style="background:#1e1b4b; border:1px solid #4338ca; padding:10px; border-radius:8px; display:inline-block; margin: 10px 0; font-weight:bold; color:#a5b4fc;">⬇️ Download: ${tempLink.text}</div><br>`;
          document.execCommand('insertHTML', false, html);
          handleVisualInput();
          setShowDownloadInput(false);
          setTempLink({url: '', text: ''});
      }
  };

  const insertVisualLink = () => {
      if(tempLink.url) {
          document.execCommand('createLink', false, tempLink.url);
          handleVisualInput();
          setShowLinkInput(false);
          setTempLink({url: '', text: ''});
      }
  };

  const handleVisualInput = () => {
      if (visualEditorRef.current) {
          const html = visualEditorRef.current.innerHTML;
          const md = simpleHtmlToMd(html);
          const key = editingItem.content !== undefined ? 'content' : editingItem.description !== undefined ? 'description' : 'bio';
          setEditingItem({ ...editingItem, [key]: md });
      }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto p-6 shadow-2xl animate-scale-up flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h3 className="text-xl font-bold text-white font-khmer">
            {isAdding ? 'បន្ថែមថ្មី' : 'កែសម្រួល'} ({activeTab})
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white"><X /></button>
        </div>

        <form onSubmit={onSave} className="space-y-4 flex-1">
          {Object.keys(editingItem).map((key) => {
            if (['id', 'comments', 'replies', 'icon', 'created_at'].includes(key)) return null;
            const value = editingItem[key];
            const label = key.charAt(0).toUpperCase() + key.slice(1);

            if (key === 'authorId') {
                return (
                    <div key={key} className="mb-4">
                        <label className="block text-xs font-bold text-gray-400 mb-2">Author</label>
                        {isSuperAdmin ? (
                            <select className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white" value={value || ''} onChange={(e) => setEditingItem({ ...editingItem, authorId: e.target.value })}>
                                {team.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        ) : (
                            <div className="p-3 bg-gray-800 rounded-lg text-gray-400 text-sm">Posting as yourself</div>
                        )}
                    </div>
                );
            }
            
            if (key === 'image') {
                return (
                    <div key={key} className="space-y-2 mb-4">
                         <label className="block text-xs font-bold text-gray-400">Cover Image</label>
                         <div className="flex gap-4">
                             <div className="w-24 h-24 bg-gray-800 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center shrink-0">
                                 {value ? <img src={value} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-600" />}
                             </div>
                             <div className="flex-1 space-y-2">
                                 <input type="text" placeholder="Image URL" className="w-full bg-gray-800 border border-white/10 rounded-lg p-2 text-white text-sm" value={value || ''} onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })} />
                                 <div className="flex gap-2">
                                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleMainImageUpload} />
                                     <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white flex items-center gap-2">{isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Upload</button>
                                 </div>
                             </div>
                         </div>
                    </div>
                );
            }

            // --- MAIN EDITOR ---
            if (key === 'content' || key === 'description' || key === 'bio') {
                return (
                    <div key={key} className="flex flex-col h-full mb-6">
                       <div className="flex justify-between items-end mb-2">
                           <label className="block text-xs font-bold text-gray-400">{label}</label>
                           {/* MODE TOGGLE */}
                           <div className="flex bg-gray-800 rounded-lg p-1 border border-white/10">
                               <button type="button" onClick={() => setEditorMode('markdown')} className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${editorMode === 'markdown' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}><Code size={12} /> Developer</button>
                               <button type="button" onClick={() => setEditorMode('visual')} className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${editorMode === 'visual' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}><Type size={12} /> General</button>
                           </div>
                       </div>
                       
                       <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0d1117] flex flex-col h-[600px] relative">
                          
                          {/* ================= DEVELOPER MODE TOOLBAR (AS REQUESTED) ================= */}
                          {editorMode === 'markdown' && (
                             <div className="flex items-center justify-between px-2 py-2 border-b border-white/10 bg-[#0d1117] shrink-0">
                                 {/* LEFT: Write / Preview Tabs */}
                                 <div className="flex items-center gap-1">
                                     <button type="button" onClick={() => setActiveView('write')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeView === 'write' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>Write</button>
                                     <button type="button" onClick={() => setActiveView('preview')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeView === 'preview' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>Preview</button>
                                 </div>

                                 {/* RIGHT: Formatting Icons */}
                                 {activeView === 'write' && (
                                    <div className="flex items-center gap-1">
                                        <button type="button" onClick={() => insertMarkdown('# ')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Heading"><Heading size={16} /></button>
                                        <button type="button" onClick={() => insertMarkdown('**', '**')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Bold"><Bold size={16} /></button>
                                        <button type="button" onClick={() => insertMarkdown('*', '*')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Italic"><Italic size={16} /></button>
                                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                                        <button type="button" onClick={() => insertMarkdown('- ')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="List"><List size={16} /></button>
                                        <button type="button" onClick={() => insertMarkdown('1. ')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Ordered List"><ListOrdered size={16} /></button>
                                        <button type="button" onClick={() => insertMarkdown('- [ ] ')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Checkbox"><CheckSquare size={16} /></button>
                                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                                        <button type="button" onClick={() => insertMarkdown('> ')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Quote"><Quote size={16} /></button>
                                        <button type="button" onClick={() => insertMarkdown('```\n', '\n```')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Code"><Code size={16} /></button>
                                        <button type="button" onClick={() => insertMarkdown('[', '](url)')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Link"><LinkIcon size={16} /></button>
                                        <button type="button" onClick={() => insertMarkdown('![alt](', ')')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Image"><ImageIcon size={16} /></button>
                                    </div>
                                 )}
                             </div>
                          )}

                          {/* ================= GENERAL USER MODE TOOLBAR ================= */}
                          {editorMode === 'visual' && (
                             <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-[#161b22] shrink-0">
                                 <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                                     <button type="button" onClick={() => execVisualCmd('bold')} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded"><Bold size={18} /></button>
                                     <button type="button" onClick={() => execVisualCmd('italic')} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded"><Italic size={18} /></button>
                                     <button type="button" onClick={() => execVisualCmd('formatBlock', 'blockquote')} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded"><Quote size={18} /></button>
                                     <div className="w-px h-5 bg-white/10 mx-1"></div>
                                     <button type="button" onClick={() => setShowLinkInput(!showLinkInput)} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded"><LinkIcon size={18} /></button>
                                     
                                     {/* Image Upload for Visual Mode */}
                                     <div className="relative">
                                         <button type="button" onClick={() => visualImageInputRef.current?.click()} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded flex items-center gap-1">
                                            <ImageIcon size={18} /> <span className="text-xs">Photo</span>
                                         </button>
                                         <input type="file" ref={visualImageInputRef} className="hidden" accept="image/*" onChange={handleVisualImageUpload} />
                                     </div>

                                     <button type="button" onClick={() => setShowDownloadInput(!showDownloadInput)} className="p-2 text-indigo-400 hover:text-white hover:bg-indigo-500/20 rounded flex items-center gap-1 font-bold">
                                         <Download size={18} /> <span className="text-xs">Download Button</span>
                                     </button>
                                 </div>
                                 
                                 {/* Visual Preview Toggle */}
                                 <button type="button" onClick={() => setVisualPreview(!visualPreview)} className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-bold ${visualPreview ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400'}`}>
                                     <Monitor size={14} /> Preview
                                 </button>
                             </div>
                          )}

                          {/* ================= EDITOR AREA ================= */}
                          <div className="flex-1 relative bg-[#0d1117] overflow-hidden">
                             {editorMode === 'markdown' ? (
                                 activeView === 'preview' ? (
                                   <div className="absolute inset-0 p-8 overflow-y-auto bg-[#0d1117]">
                                      <ContentRenderer content={String(value || '')} />
                                   </div>
                                 ) : (
                                   <textarea
                                     ref={textareaRef}
                                     className="w-full h-full bg-[#0d1117] p-6 text-white focus:outline-none font-mono text-sm leading-relaxed resize-none"
                                     placeholder="Write in Markdown..."
                                     value={value || ''}
                                     onChange={(e) => setEditingItem({ ...editingItem, [key]: e.target.value })}
                                   />
                                 )
                             ) : (
                                 /* VISUAL EDITOR */
                                 visualPreview ? (
                                     <div className="absolute inset-0 p-8 overflow-y-auto bg-[#0d1117]">
                                        <ContentRenderer content={String(value || '')} />
                                     </div>
                                 ) : (
                                     <div 
                                        ref={visualEditorRef}
                                        contentEditable
                                        onInput={handleVisualInput}
                                        className="w-full h-full bg-[#0d1117] p-8 text-white focus:outline-none text-lg overflow-y-auto"
                                        style={{ minHeight: '100%' }}
                                     />
                                 )
                             )}

                             {/* --- POPUPS FOR GENERAL MODE --- */}
                             {showLinkInput && (
                                 <div className="absolute top-2 left-2 z-50 bg-gray-800 border border-white/10 p-4 rounded-xl shadow-2xl flex flex-col gap-2 w-72 animate-fade-in">
                                     <h4 className="text-xs font-bold text-gray-400 uppercase">Insert Link</h4>
                                     <input autoFocus placeholder="https://..." className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm text-white" value={tempLink.url} onChange={e => setTempLink({...tempLink, url: e.target.value})} />
                                     <div className="flex justify-end gap-2">
                                         <button type="button" onClick={() => setShowLinkInput(false)} className="px-2 py-1 text-xs text-gray-400">Cancel</button>
                                         <button type="button" onClick={insertVisualLink} className="px-3 py-1 bg-indigo-600 rounded text-xs text-white font-bold">Add Link</button>
                                     </div>
                                 </div>
                             )}

                             {showDownloadInput && (
                                 <div className="absolute top-2 left-1/4 z-50 bg-gray-800 border border-white/10 p-4 rounded-xl shadow-2xl flex flex-col gap-2 w-80 animate-fade-in">
                                     <h4 className="text-xs font-bold text-gray-400 uppercase">Insert Download Button</h4>
                                     <input autoFocus placeholder="Label (e.g., Download PDF)" className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm text-white" value={tempLink.text} onChange={e => setTempLink({...tempLink, text: e.target.value})} />
                                     <input placeholder="URL (e.g., https://drive...)" className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm text-white" value={tempLink.url} onChange={e => setTempLink({...tempLink, url: e.target.value})} />
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
            }
            
            // Default Inputs
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) return null; 
            if (Array.isArray(value)) {
                 return <div key={key}><label className="text-gray-400 text-xs font-bold">{label}</label><textarea className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white" value={value.join(', ')} onChange={(e) => setEditingItem({ ...editingItem, [key]: e.target.value.split(',').map((s:string) => s.trim()) })} /></div>;
            }

            return (
              <div key={key}>
                <label className="block text-xs font-bold text-gray-400 mb-1">{label}</label>
                <input className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white" value={value || ''} onChange={(e) => setEditingItem({ ...editingItem, [key]: e.target.value })} />
              </div>
            );
          })}

          <button type="submit" disabled={isSaving || isUploading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2 mt-6">
            {isSaving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save & Publish</>}
          </button>
        </form>
      </div>
    </div>
  );
};
export default EditItemModal;
