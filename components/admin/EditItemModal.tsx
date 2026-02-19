
import React, { useState, useRef } from 'react';
import { X, Save, Loader2, Upload, Image as ImageIcon, ExternalLink, Lock, Facebook, Send, Link as LinkIcon, Tag, FileText, Target, Zap, TrendingUp } from 'lucide-react';
import { getSupabaseClient } from '../../lib/supabase';
import { useData } from '../../contexts/DataContext';
import RichTextEditor from './editor/RichTextEditor';

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

const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen, isAdding, activeTab, isSuperAdmin, editingItem, setEditingItem, onSave, onCancel, isSaving
}) => {
  const { team, projects } = useData();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !editingItem) return null;

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

  const handleSocialChange = (platform: 'facebook' | 'telegram', value: string) => {
      const currentSocials = editingItem.socials || {};
      setEditingItem({
          ...editingItem,
          socials: {
              ...currentSocials,
              [platform]: value
          }
      });
  };

  // Get unique categories for suggestions
  const uniqueCategories = Array.from(new Set(projects.map(p => p.category))).sort();

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto p-6 shadow-2xl animate-scale-up flex flex-col">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h3 className="text-xl font-bold text-white font-khmer">
            {isAdding ? 'បន្ថែមថ្មី' : 'កែសម្រួល'} ({activeTab})
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white"><X /></button>
        </div>

        <form onSubmit={onSave} className="space-y-4 flex-1">
          {Object.keys(editingItem).map((key) => {
            // Skip fields handled specially or internal fields
            if (['id', 'comments', 'replies', 'created_at', '_iconString', 'slug', 'orderIndex', 'order_index', 'challenge', 'challengeKm', 'solution', 'solutionKm', 'result', 'resultKm', 'createdBy'].includes(key)) return null;
            
            const value = editingItem[key];
            let label = key.charAt(0).toUpperCase() + key.slice(1);
            if (activeTab === 'services' && key === 'image') label = 'Background Image (Hover Effect)';
            if (activeTab === 'partners' && key === 'image') label = 'Logo Image (Optional)';

            // Special Fields Handlers (PIN, Socials, Links, etc.) -> SAME AS BEFORE
            if (key === 'pinCode' && activeTab === 'team') {
                return (
                    <div key={key} className="mb-4">
                        <label className="block text-xs font-bold text-indigo-400 mb-1 flex items-center gap-1"><Lock size={12}/> Login PIN Code</label>
                        <input 
                            type="text"
                            maxLength={6}
                            className="w-full bg-gray-800 border border-indigo-500/30 rounded-lg p-3 text-white font-mono tracking-widest"
                            value={value || ''} 
                            onChange={(e) => setEditingItem({ ...editingItem, [key]: e.target.value })}
                            placeholder="e.g. 1234"
                        />
                    </div>
                );
            }
            if (key === 'socials' && activeTab === 'team') {
                const socials = value || { facebook: '', telegram: '' };
                return (
                    <div key={key} className="mb-4 p-4 bg-gray-800/50 rounded-xl border border-white/10">
                        <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Social Media Links</label>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Facebook</label>
                                <input className="w-full bg-gray-900 border border-white/10 rounded-lg p-3 text-white text-sm" value={socials.facebook || ''} onChange={(e) => handleSocialChange('facebook', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Telegram</label>
                                <input className="w-full bg-gray-900 border border-white/10 rounded-lg p-3 text-white text-sm" value={socials.telegram || ''} onChange={(e) => handleSocialChange('telegram', e.target.value)} />
                            </div>
                        </div>
                    </div>
                );
            }
            if (key === 'link' && activeTab === 'projects') {
                return (
                    <div key={key} className="mb-4">
                        <label className="block text-xs font-bold text-gray-400 mb-1 flex items-center gap-1"><LinkIcon size={12}/> Live Project Link</label>
                        <input className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white text-sm" value={value || ''} onChange={(e) => setEditingItem({ ...editingItem, [key]: e.target.value })} />
                    </div>
                );
            }
            if (key === 'category' && activeTab === 'projects') {
                return (
                    <div key={key} className="mb-4">
                        <label className="block text-xs font-bold text-gray-400 mb-1 flex items-center gap-1"><Tag size={12}/> Category</label>
                        <input list="category-suggestions" className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white text-sm" value={value || ''} onChange={(e) => setEditingItem({ ...editingItem, [key]: e.target.value })} />
                        <datalist id="category-suggestions">{uniqueCategories.map(cat => <option key={cat} value={cat} />)}</datalist>
                    </div>
                );
            }
            if (key === 'authorId') {
                return (
                    <div key={key} className="mb-4">
                        <label className="block text-xs font-bold text-gray-400 mb-2">Author</label>
                        {isSuperAdmin ? (
                            <select className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white" value={value || ''} onChange={(e) => setEditingItem({ ...editingItem, authorId: e.target.value })}>{team.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
                        ) : (<div className="p-3 bg-gray-800 rounded-lg text-gray-400 text-sm">Posting as yourself</div>)}
                    </div>
                );
            }
            if (key === 'image') {
                return (
                    <div key={key} className="space-y-2 mb-4">
                         <label className="block text-xs font-bold text-gray-400">{label}</label>
                         <div className="flex gap-4">
                             <div className="w-24 h-24 bg-gray-800 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center shrink-0">
                                 {value ? <img src={value} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-600" />}
                             </div>
                             <div className="flex-1 space-y-2">
                                 <input type="text" placeholder="Image URL" className="w-full bg-gray-800 border border-white/10 rounded-lg p-2 text-white text-sm" value={value || ''} onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })} />
                                 <div className="flex gap-2">
                                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleMainImageUpload} />
                                     <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white flex items-center gap-2">{isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Upload New</button>
                                 </div>
                             </div>
                         </div>
                    </div>
                );
            }
            if (key === 'content' || key === 'description' || key === 'bio') {
                return <RichTextEditor key={key} label={label} value={value || ''} onChange={(newValue) => setEditingItem({ ...editingItem, [key]: newValue })} />;
            }
            if (Array.isArray(value)) {
                 return (
                    <div key={key} className="mb-4">
                        <label className="block text-xs font-bold text-gray-400 mb-1">{label}</label>
                        <textarea className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white h-24 font-mono text-sm" placeholder="Item 1, Item 2" value={value.join(', ')} onChange={(e) => setEditingItem({ ...editingItem, [key]: e.target.value.split(',').map((s:string) => s.trim()) })} />
                    </div>
                 );
            }
            if (typeof value === 'object' && value !== null) return null;

            return (
              <div key={key}>
                <label className="block text-xs font-bold text-gray-400 mb-1">{label}</label>
                <input className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white" value={value || ''} onChange={(e) => setEditingItem({ ...editingItem, [key]: e.target.value })} />
              </div>
            );
          })}

          {/* --- SPECIAL CASE STUDY SECTION FOR PROJECTS --- */}
          {activeTab === 'projects' && (
              <div className="mt-8 pt-8 border-t border-white/10">
                  <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                      <FileText className="text-indigo-400" size={20}/> Detailed Case Study
                  </h4>
                  <div className="space-y-6">
                      {/* Challenge */}
                      <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1"><Target size={14}/> The Challenge (EN)</label>
                              <textarea 
                                  className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white h-32 focus:ring-2 focus:ring-red-500/50 outline-none text-sm resize-none"
                                  value={editingItem.challenge || ''}
                                  onChange={(e) => setEditingItem({ ...editingItem, challenge: e.target.value })}
                                  placeholder="What was the core problem?"
                              />
                          </div>
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-red-400 uppercase tracking-wider font-khmer">បញ្ហាប្រឈម (ខ្មែរ)</label>
                              <textarea 
                                  className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white h-32 focus:ring-2 focus:ring-red-500/50 outline-none text-sm resize-none font-khmer"
                                  value={editingItem.challengeKm || ''}
                                  onChange={(e) => setEditingItem({ ...editingItem, challengeKm: e.target.value })}
                                  placeholder="តើបញ្ហាស្នូលគឺអ្វី?"
                              />
                          </div>
                      </div>

                      {/* Solution */}
                      <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1"><Zap size={14}/> The Solution (EN)</label>
                              <textarea 
                                  className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white h-32 focus:ring-2 focus:ring-blue-500/50 outline-none text-sm resize-none"
                                  value={editingItem.solution || ''}
                                  onChange={(e) => setEditingItem({ ...editingItem, solution: e.target.value })}
                                  placeholder="How did we solve it?"
                              />
                          </div>
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-blue-400 uppercase tracking-wider font-khmer">ដំណោះស្រាយ (ខ្មែរ)</label>
                              <textarea 
                                  className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white h-32 focus:ring-2 focus:ring-blue-500/50 outline-none text-sm resize-none font-khmer"
                                  value={editingItem.solutionKm || ''}
                                  onChange={(e) => setEditingItem({ ...editingItem, solutionKm: e.target.value })}
                                  placeholder="តើយើងដោះស្រាយដោយរបៀបណា?"
                              />
                          </div>
                      </div>

                      {/* Result */}
                      <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-1"><TrendingUp size={14}/> The Result (EN)</label>
                              <textarea 
                                  className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white h-32 focus:ring-2 focus:ring-green-500/50 outline-none text-sm resize-none"
                                  value={editingItem.result || ''}
                                  onChange={(e) => setEditingItem({ ...editingItem, result: e.target.value })}
                                  placeholder="What was the impact?"
                              />
                          </div>
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-green-400 uppercase tracking-wider font-khmer">លទ្ធផល (ខ្មែរ)</label>
                              <textarea 
                                  className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white h-32 focus:ring-2 focus:ring-green-500/50 outline-none text-sm resize-none font-khmer"
                                  value={editingItem.resultKm || ''}
                                  onChange={(e) => setEditingItem({ ...editingItem, resultKm: e.target.value })}
                                  placeholder="តើលទ្ធផលទទួលបានអ្វីខ្លះ?"
                              />
                          </div>
                      </div>
                  </div>
              </div>
          )}

          <button type="submit" disabled={isSaving || isUploading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2 mt-6">
            {isSaving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save & Publish</>}
          </button>
        </form>
      </div>
    </div>
  );
};
export default EditItemModal;
