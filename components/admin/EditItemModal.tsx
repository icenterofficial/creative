import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Loader2, Upload, Image as ImageIcon, Bold, Italic, Heading, List, ListOrdered, Code, Link, Quote, CheckSquare, User, Eye, PenTool, Type } from 'lucide-react';
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

// --- Basic HTML <-> Markdown Converters for Visual Editor ---
const simpleMdToHtml = (md: string) => {
    if (!md) return '';
    let html = md
        // Escape HTML characters to prevent broken layout
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        // Basic MD to HTML
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
        .replace(/\*(.*?)\*/gim, '<i>$1</i>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/^\d\. (.*$)/gim, '<li>$1</li>') // Simple list mapping
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
    text = text.replace(/&nbsp;/g, ' ');
    // Clean up html entities
    text = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    return text.trim();
};

const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen, isAdding, activeTab, isSuperAdmin, editingItem, setEditingItem, onSave, onCancel, isSaving
}) => {
  const { team } = useData();
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // For Markdown Mode
  const [editorMode, setEditorMode] = useState<'markdown' | 'visual'>('visual'); // Default to Visual
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const visualEditorRef = useRef<HTMLDivElement>(null);

  // Sync Content to Visual Editor when opening or switching modes
  useEffect(() => {
      if (editorMode === 'visual' && visualEditorRef.current && editingItem) {
          // Only update if empty to prevent cursor jumping, or force update on mode switch
          if (!visualEditorRef.current.innerText.trim() || visualEditorRef.current.innerText !== editingItem.content) {
             // We need a way to track if we just switched. For simplicity, we just render MD to HTML initially.
             // Note: In a real app, strict two-way binding with contentEditable is complex.
             // Here we just set initial HTML.
             const currentMd = editingItem.content || editingItem.description || editingItem.bio || '';
             visualEditorRef.current.innerHTML = simpleMdToHtml(currentMd);
          }
      }
  }, [editorMode, isOpen]); // simplified deps

  if (!isOpen || !editingItem) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const supabase = getSupabaseClient();
      if (!supabase) return alert("Database not connected");

      setIsUploading(true);
      try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('uploads')
            .getPublicUrl(filePath);

          setEditingItem({ ...editingItem, image: publicUrl });
      } catch (error: any) {
          console.error("Upload failed:", error);
          alert("Upload failed: " + error.message);
      } finally {
          setIsUploading(false);
      }
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
      if (!textareaRef.current) return;
      
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      // Ensure we treat content as string
      const text = typeof editingItem.content === 'string' ? editingItem.content : '';
      
      const before = text.substring(0, start);
      const selection = text.substring(start, end);
      const after = text.substring(end);

      const newText = before + prefix + (selection || 'text') + suffix + after;
      
      setEditingItem({ ...editingItem, content: newText });

      setTimeout(() => {
          if (textarea) {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
          }
      }, 0);
  };

  const execVisualCmd = (cmd: string, val: string = '') => {
      document.execCommand(cmd, false, val);
      // Trigger update
      if (visualEditorRef.current) {
         handleVisualInput();
      }
  };

  const handleVisualInput = () => {
      if (visualEditorRef.current) {
          const html = visualEditorRef.current.innerHTML;
          const md = simpleHtmlToMd(html);
          // Determine which field to update based on what exists
          const key = editingItem.content !== undefined ? 'content' : 
                      editingItem.description !== undefined ? 'description' : 'bio';
          setEditingItem({ ...editingItem, [key]: md });
      }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-scale-up flex flex-col">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h3 className="text-xl font-bold text-white font-khmer">
            {isAdding ? 'បន្ថែមថ្មី' : 'កែសម្រួល'} ({activeTab})
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white"><X /></button>
        </div>

        <form onSubmit={onSave} className="space-y-4 flex-1">
          {Object.keys(editingItem).map((key) => {
            // Filter out system fields
            if (['id', 'comments', 'replies', 'icon', 'created_at'].includes(key)) return null;
            
            const value = editingItem[key];
            const label = key.charAt(0).toUpperCase() + key.slice(1);

            // SPECIAL FIELD HANDLERS
            if (key === 'authorId') {
                const currentAuthor = team.find(m => m.id === value);
                if (isSuperAdmin) {
                    return (
                        <div key={key}>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Author (Admin Override)</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 pl-12 text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-khmer"
                                    value={value || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, authorId: e.target.value })}
                                >
                                    {team.map((member) => (
                                        <option key={member.id} value={member.id}>
                                            {member.name} ({member.role})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    {currentAuthor ? (
                                        <img src={currentAuthor.image} className="w-6 h-6 rounded-full object-cover" alt="" />
                                    ) : (
                                        <User size={20} className="text-gray-500" />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <div key={key} className="opacity-90">
                            <label className="block text-xs font-bold text-gray-400 mb-2">Author</label>
                            <div className="w-full bg-gray-800/50 border border-white/10 rounded-lg p-3 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 border border-white/10">
                                     {currentAuthor ? (
                                        <img src={currentAuthor.image} alt={currentAuthor.name} className="w-full h-full object-cover" />
                                     ) : (
                                        <div className="w-full h-full flex items-center justify-center"><User size={16} /></div>
                                     )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-bold text-sm">{currentAuthor?.name || 'Unknown User'}</span>
                                    <span className="text-[10px] text-gray-400">Posting as yourself</span>
                                </div>
                                <div className="ml-auto px-2 py-1 bg-green-500/10 text-green-400 text-[10px] rounded border border-green-500/20 font-bold uppercase">
                                    Verified
                                </div>
                            </div>
                        </div>
                    );
                }
            }
            
            if (key === 'image') {
                return (
                    <div key={key} className="space-y-2">
                         <label className="block text-xs font-bold text-gray-400">Image</label>
                         <div className="flex items-start gap-4">
                             <div className="w-32 h-32 bg-gray-800 rounded-lg overflow-hidden border border-white/10 shrink-0 flex items-center justify-center">
                                 {value ? (
                                     <img src={value} alt="Preview" className="w-full h-full object-cover" />
                                 ) : (
                                     <ImageIcon className="text-gray-600" />
                                 )}
                             </div>
                             <div className="flex-1">
                                 <input 
                                    type="text" 
                                    placeholder="Image URL" 
                                    className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white text-sm mb-2"
                                    value={value || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                                 />
                                 <div className="flex gap-2">
                                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                     <button 
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 flex items-center gap-2 transition-colors disabled:opacity-50"
                                     >
                                        {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                        {isUploading ? 'Uploading...' : 'Upload File'}
                                     </button>
                                 </div>
                             </div>
                         </div>
                    </div>
                );
            }

            if (Array.isArray(value)) {
              return (
                <div key={key}>
                  <label className="block text-xs font-bold text-gray-400 mb-1">{label} (Comma separated)</label>
                  <textarea
                    className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none font-khmer"
                    value={value.join(', ')}
                    onChange={(e) => setEditingItem({ ...editingItem, [key]: e.target.value.split(',').map((s:string) => s.trim()) })}
                  />
                </div>
              );
            }

            if (key === 'socials' && typeof value === 'object') {
              return (
                <div key={key} className="space-y-2 border border-white/5 p-3 rounded-lg">
                  <label className="block text-xs font-bold text-gray-400">Social Links</label>
                  <input placeholder="Facebook URL" className="w-full bg-gray-800 border border-white/10 rounded-lg p-2 text-white text-sm"
                    value={value?.facebook || ''} onChange={(e) => setEditingItem({ ...editingItem, socials: { ...value, facebook: e.target.value } })} />
                  <input placeholder="Telegram URL" className="w-full bg-gray-800 border border-white/10 rounded-lg p-2 text-white text-sm"
                    value={value?.telegram || ''} onChange={(e) => setEditingItem({ ...editingItem, socials: { ...value, telegram: e.target.value } })} />
                </div>
              );
            }

            // --- EDITOR SECTION ---
            if (key === 'content' || key === 'description' || key === 'bio' || key === 'bioKm' || key === 'descriptionKm' || key === 'excerpt') {
                const isContent = key === 'content';
                
                if (isContent) {
                  return (
                    <div key={key} className="flex flex-col h-full mb-6">
                       <div className="flex justify-between items-end mb-2">
                           <label className="block text-xs font-bold text-gray-400">{label}</label>
                           {/* MODE SWITCHER */}
                           <div className="flex bg-gray-800 rounded-lg p-1 border border-white/10">
                               <button 
                                 type="button"
                                 onClick={() => setEditorMode('visual')}
                                 className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${editorMode === 'visual' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                               >
                                  <Type size={12} /> General
                               </button>
                               <button 
                                 type="button"
                                 onClick={() => setEditorMode('markdown')}
                                 className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${editorMode === 'markdown' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                               >
                                  <Code size={12} /> Developer
                               </button>
                           </div>
                       </div>
                       
                       <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0d1117] focus-within:ring-1 focus-within:ring-indigo-500 transition-all flex flex-col h-[500px]">
                          
                          {/* TOOLBAR */}
                          <div className="flex items-center justify-between px-2 py-2 border-b border-white/10 bg-[#0d1117] shrink-0">
                             {editorMode === 'markdown' ? (
                                 /* Markdown Toolbar */
                                 <>
                                     <div className="flex items-center">
                                         <button type="button" onClick={() => setShowPreview(false)} className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${!showPreview ? 'text-white border-indigo-500' : 'text-gray-400 border-transparent hover:text-gray-200'}`}>Write</button>
                                         <button type="button" onClick={() => setShowPreview(true)} className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${showPreview ? 'text-white border-indigo-500' : 'text-gray-400 border-transparent hover:text-gray-200'}`}>Preview</button>
                                     </div>
                                     {!showPreview && (
                                         <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                                             <button type="button" onClick={() => insertMarkdown('# ')} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="Heading"><Heading size={16} /></button>
                                             <button type="button" onClick={() => insertMarkdown('**', '**')} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="Bold"><Bold size={16} /></button>
                                             <button type="button" onClick={() => insertMarkdown('*', '*')} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="Italic"><Italic size={16} /></button>
                                             <button type="button" onClick={() => insertMarkdown('1. ')} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="Ordered List"><ListOrdered size={16} /></button>
                                             <button type="button" onClick={() => insertMarkdown('![alt](', ')')} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="Image"><ImageIcon size={16} /></button>
                                         </div>
                                     )}
                                 </>
                             ) : (
                                 /* Visual Toolbar */
                                 <div className="flex items-center gap-1 w-full overflow-x-auto scrollbar-hide">
                                     <button type="button" onClick={() => execVisualCmd('bold')} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded" title="Bold"><Bold size={16} /></button>
                                     <button type="button" onClick={() => execVisualCmd('italic')} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded" title="Italic"><Italic size={16} /></button>
                                     <div className="w-px h-4 bg-white/10 mx-1"></div>
                                     <button type="button" onClick={() => execVisualCmd('formatBlock', 'H1')} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded font-bold text-xs" title="Heading 1">H1</button>
                                     <button type="button" onClick={() => execVisualCmd('formatBlock', 'H2')} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded font-bold text-xs" title="Heading 2">H2</button>
                                     <div className="w-px h-4 bg-white/10 mx-1"></div>
                                     <button type="button" onClick={() => execVisualCmd('insertUnorderedList')} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded" title="Bullet List"><List size={16} /></button>
                                     <button type="button" onClick={() => execVisualCmd('insertOrderedList')} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded" title="Number List"><ListOrdered size={16} /></button>
                                     <span className="ml-auto text-xs text-green-400 px-2">Visual Mode</span>
                                 </div>
                             )}
                          </div>
                          
                          {/* EDITOR AREA */}
                          <div className="flex-1 relative bg-[#0d1117] overflow-hidden">
                             {editorMode === 'markdown' ? (
                                 showPreview ? (
                                   <div className="absolute inset-0 p-6 overflow-y-auto bg-[#0d1117]">
                                      <ContentRenderer content={String(value || '')} />
                                   </div>
                                 ) : (
                                   <textarea
                                     ref={textareaRef}
                                     className="w-full h-full bg-[#0d1117] p-4 text-white focus:outline-none font-mono text-sm font-khmer resize-none leading-relaxed"
                                     placeholder="Write your article in Markdown..."
                                     value={value || ''}
                                     onChange={(e) => setEditingItem({ ...editingItem, [key]: e.target.value })}
                                   />
                                 )
                             ) : (
                                 /* VISUAL EDITOR DIV */
                                 <div 
                                    ref={visualEditorRef}
                                    contentEditable
                                    onInput={handleVisualInput}
                                    className="w-full h-full bg-[#0d1117] p-6 text-white focus:outline-none font-khmer text-lg overflow-y-auto prose prose-invert max-w-none"
                                    style={{ minHeight: '100%' }}
                                 />
                             )}
                          </div>
                          
                          <div className="px-4 py-2 bg-[#0d1117] border-t border-white/5 text-[10px] text-gray-600 flex justify-between items-center">
                              <span>{editorMode === 'markdown' ? 'Markdown Supported' : 'WYSIWYG Editor'}</span>
                              <span>{String(value || '').length} chars</span>
                          </div>
                       </div>
                    </div>
                  );
                }

                return (
                    <div key={key}>
                    <label className="block text-xs font-bold text-gray-400 mb-1">{label}</label>
                    <textarea
                        rows={4}
                        className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm font-khmer"
                        value={value || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, [key]: e.target.value })}
                    />
                    </div>
                );
            }
            
            if (typeof value === 'object' && value !== null) return null;

            return (
              <div key={key}>
                <label className="block text-xs font-bold text-gray-400 mb-1">{label}</label>
                <input
                  className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none font-khmer"
                  value={value || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, [key]: e.target.value })}
                />
              </div>
            );
          })}

          <button type="submit" disabled={isSaving || isUploading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50 font-khmer mt-6">
            {isSaving ? <><Loader2 size={18} className="animate-spin" /> កំពុងរក្សាទុក...</> : <><Save size={18} /> រក្សាទុក & បង្ហោះ</>}
          </button>
        </form>
      </div>
    </div>
  );
};
export default EditItemModal;
