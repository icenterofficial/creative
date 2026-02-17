import React, { useState, useRef } from 'react';
import { X, Save, Loader2, Upload, Image as ImageIcon, ExternalLink, Lock } from 'lucide-react';
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
  const { team } = useData();
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
            if (['id', 'comments', 'replies', 'created_at', '_iconString', 'slug', 'orderIndex', 'order_index'].includes(key)) return null;
            const value = editingItem[key];
            const label = key.charAt(0).toUpperCase() + key.slice(1);

            // Special field for PIN Code (Team only)
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
                        <p className="text-[10px] text-gray-500 mt-1">Used for member login. Keep it simple (4-6 digits).</p>
                    </div>
                );
            }

            // Special handling for Icon string editing (Services)
            if (key === 'icon' && typeof value === 'string') {
                return (
                    <div key={key} className="mb-4">
                        <label className="block text-xs font-bold text-gray-400 mb-1">{label} (Lucide Icon Name)</label>
                        <div className="flex gap-2">
                            <input 
                                className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white" 
                                value={value} 
                                onChange={(e) => setEditingItem({ ...editingItem, [key]: e.target.value })}
                                placeholder="e.g. Activity, Box, Zap..."
                            />
                            <a 
                                href="https://lucide.dev/icons" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-indigo-400 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
                            >
                                <ExternalLink size={14} /> Browse Icons
                            </a>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">Check Lucide.dev for valid icon names. Case sensitive.</p>
                    </div>
                );
            }

            // Hide Icon if it's an object (ReactNode) from static data that hasn't been converted
            if (key === 'icon' && typeof value !== 'string') {
                return (
                    <div key={key} className="mb-4 p-3 bg-gray-800 rounded-lg">
                        <label className="block text-xs font-bold text-gray-400 mb-1">Icon</label>
                        <p className="text-xs text-yellow-500">Static Icon (Cannot edit, will be reset to 'Box' if saved to DB)</p>
                    </div>
                );
            }

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

            // Using the new RichTextEditor Component
            if (key === 'content' || key === 'description' || key === 'bio') {
                return (
                    <RichTextEditor 
                        key={key} 
                        label={label} 
                        value={value || ''} 
                        onChange={(newValue) => setEditingItem({ ...editingItem, [key]: newValue })} 
                    />
                );
            }
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) return null; 
            if (Array.isArray(value)) {
                 return (
                    <div key={key} className="mb-4">
                        <label className="block text-xs font-bold text-gray-400 mb-1">{label}</label>
                        <textarea 
                            className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white h-24 font-mono text-sm" 
                            placeholder="Item 1, Item 2, Item 3"
                            value={value.join(', ')} 
                            onChange={(e) => setEditingItem({ ...editingItem, [key]: e.target.value.split(',').map((s:string) => s.trim()) })} 
                        />
                        <p className="text-[10px] text-gray-500 mt-1">Separate items with commas.</p>
                    </div>
                 );
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
