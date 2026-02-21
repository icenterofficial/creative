import React, { useState, useRef } from 'react';
import { X, Save, Loader2, Upload, Image as ImageIcon, ExternalLink, Lock, Facebook, Send, Link as LinkIcon, Tag, FileText, Target, Zap, TrendingUp, Images, Plus as PlusIcon } from 'lucide-react';
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
  
  // Gallery specific upload ref
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);

  // Cover Image upload ref (NEW)
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const [isCoverImageUploading, setIsCoverImageUploading] = useState(false);

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

  // Gallery Upload Handler
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setIsGalleryUploading(true);
          const url = await uploadImage(file);
          if (url) {
              const currentGallery = editingItem.gallery || [];
              setEditingItem({ ...editingItem, gallery: [...currentGallery, url] });
          }
          setIsGalleryUploading(false);
      }
  };

  // Cover Image Upload Handler (NEW)
  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validation
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      
      if (file.size > maxSize) {
          alert('រូបភាពធំពេក! សូមជ្រើសរើសរូបភាពតូចជាង 5MB');
          return;
      }
      
      if (!allowedTypes.includes(file.type)) {
          alert('ប្រភេទឯកសារមិនត្រឹមត្រូវ! សូមប្រើ JPG, PNG ឬ WEBP');
          return;
      }

      setIsCoverImageUploading(true);
      try {
          const url = await uploadImage(file);
          if (url) {
              setEditingItem({ ...editingItem, coverImage: url });
          }
      } finally {
          setIsCoverImageUploading(false);
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
            if (['id', 'comments', 'replies', 'created_at', '_iconString', 'slug', 'orderIndex', 'order_index', 'challenge', 'challengeKm', 'solution', 'solutionKm', 'result', 'resultKm', 'createdBy', 'gallery', 'coverImage'].includes(key)) return null;
            
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

          {/* --- COVER IMAGE SECTION FOR TEAM MEMBERS (NEW) --- */}
          {activeTab === 'team' && (
              <div className="mt-6 pt-6 border-t border-white/10">
                  <label className="block text-xs font-bold text-indigo-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                      <ImageIcon size={14} /> Cover Image (ផ្ទៃខាងក្រោយ)
                  </label>
                  
                  {/* Cover Image Preview */}
                  {editingItem.coverImage && (
                      <div className="relative w-full h-40 rounded-xl overflow-hidden border border-white/10 mb-3 group">
                          <img 
                              src={editingItem.coverImage} 
                              alt="Cover Preview" 
                              className="w-full h-full object-cover"
                          />
                          <button
                              type="button"
                              onClick={() => setEditingItem({ ...editingItem, coverImage: '' })}
                              className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                              <X size={16} />
                          </button>
                      </div>
                  )}
                  
                  {/* Upload Controls */}
                  <div className="space-y-2">
                      <input 
                          type="text" 
                          placeholder="ឬ Paste Cover Image URL នៅទីនេះ" 
                          className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white text-sm" 
                          value={editingItem.coverImage || ''} 
                          onChange={(e) => setEditingItem({ ...editingItem, coverImage: e.target.value })} 
                      />
                      <div className="flex gap-2">
                          <input 
                              type="file" 
                              ref={coverImageInputRef} 
                              className="hidden" 
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleCoverImageUpload}
                          />
                          <button 
                              type="button" 
                              onClick={() => coverImageInputRef.current?.click()} 
                              disabled={isCoverImageUploading}
                              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 border border-indigo-500/50 rounded-lg text-xs text-white font-bold flex items-center justify-center gap-2 transition-colors"
                          >
                              {isCoverImageUploading ? (
                                  <>
                                      <Loader2 size={14} className="animate-spin" />
                                      កំពុងផ្ទុក...
                                  </>
                              ) : (
                                  <>
                                      <Upload size={14} />
                                      Upload Cover Image
                                  </>
                              )}
                          </button>
                      </div>
                      <p className="text-xs text-gray-500 font-khmer">
                          ✓ ទំហំ: ឯកសារ JPG, PNG ឬ WEBP (អតិបរមា 5MB)
                      </p>
                      <p className="text-xs text-gray-500 font-khmer">
                          ✓ ផ្ទៃលក្ខណៈ: 16:9 ឬ 21:9 ផ្តល់លទ្ធផលល្អបំផុត
                      </p>
                  </div>
              </div>
          )}

          {/* --- GALLERY SECTION FOR PROJECTS --- */}
          {activeTab === 'projects' && (
              <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-400 mb-2 flex items-center gap-2"><Images size={14}/> Image Gallery</label>
                  
                  {/* Gallery Preview Grid */}
                  <div className="grid grid-cols-4 gap-2 mb-2">
                      {(editingItem.gallery || []).map((imgUrl: string, idx: number) => (
                          <div key={idx} className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden group border border-white/10">
                              <img src={imgUrl} className="w-full h-full object-cover" />
                              <button 
                                  type="button"
                                  onClick={() => {
                                      const newGallery = editingItem.gallery.filter((_:any, i:number) => i !== idx);
                                      setEditingItem({ ...editingItem, gallery: newGallery });
                                  }}
                                  className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                  <X size={12} />
                              </button>
                          </div>
                      ))}
                      {/* Upload Button */}
                      <button 
                          type="button" 
                          onClick={() => galleryInputRef.current?.click()}
                          disabled={isGalleryUploading}
                          className="aspect-square bg-white/5 border border-white/10 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                      >
                          {isGalleryUploading ? <Loader2 size={20} className="animate-spin" /> : <PlusIcon size={20} />}
                          <span className="text-[10px] mt-1">Add Image</span>
                      </button>
                  </div>
                  
                  <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" onChange={handleGalleryUpload} />
                  
                  {/* Manual URL Input fallback */}
                  <textarea 
                      className="w-full bg-gray-800 border border-white/10 rounded-lg p-2 text-white text-xs font-mono h-20"
                      placeholder="Paste image URLs here (comma separated) for manual entry..."
                      value={(editingItem.gallery || []).join(', ')}
                      onChange={(e) => setEditingItem({ ...editingItem, gallery: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  />
              </div>
          )}

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
                                  placeholder="តើយើងដោះស្រាយវាដោយរបៀបណា?"
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
                                  placeholder="What was the outcome?"
                              />
                          </div>
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-green-400 uppercase tracking-wider font-khmer">លទ្ធផល (ខ្មែរ)</label>
                              <textarea 
                                  className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white h-32 focus:ring-2 focus:ring-green-500/50 outline-none text-sm resize-none font-khmer"
                                  value={editingItem.resultKm || ''}
                                  onChange={(e) => setEditingItem({ ...editingItem, resultKm: e.target.value })}
                                  placeholder="តើលទ្ធផលគឺជាអ្វី?"
                              />
                          </div>
                      </div>
                  </div>
              </div>
          )}

          <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-white/10">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white text-sm font-bold hover:bg-gray-700 transition-colors">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 border border-indigo-500 rounded-lg text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors">
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;
