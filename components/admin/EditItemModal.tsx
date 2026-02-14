import React, { useState, useRef } from 'react';
import { X, Save, Loader2, HelpCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { sanityClient } from '../../lib/sanity';

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
  isOpen, isAdding, activeTab, isSuperAdmin, editingItem, setEditingItem, onSave, onCancel, isSaving, apiToken
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !editingItem) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !apiToken) return;

      setIsUploading(true);
      try {
          // Use a client with the write token
          const client = sanityClient.withConfig({ token: apiToken, useCdn: false });
          
          const asset = await client.assets.upload('image', file, {
              filename: file.name
          });

          setEditingItem({ ...editingItem, image: asset.url });
      } catch (error) {
          console.error("Upload failed:", error);
          alert("Image upload failed. Please try again.");
      } finally {
          setIsUploading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-scale-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white font-khmer">
            {isAdding ? 'បន្ថែមថ្មី' : 'កែសម្រួល'} ({activeTab})
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white"><X /></button>
        </div>

        <form onSubmit={onSave} className="space-y-4">
          {Object.keys(editingItem).map((key) => {
            if (key === 'id' || key === 'comments' || key === 'replies' || key === 'icon' || key === '_id' || key === '_type' || key === '_createdAt' || key === '_updatedAt' || key === '_rev') return null;
            if (key === 'authorId' && !isSuperAdmin) return null;

            const value = editingItem[key];
            const label = key.charAt(0).toUpperCase() + key.slice(1);

            // IMAGE UPLOAD HANDLING
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
                                     <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                     />
                                     <button 
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading || !apiToken}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 flex items-center gap-2 transition-colors disabled:opacity-50"
                                     >
                                        {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                        {isUploading ? 'Uploading...' : 'Upload File'}
                                     </button>
                                     {!apiToken && <span className="text-xs text-red-400 self-center">Token required to upload</span>}
                                 </div>
                             </div>
                         </div>
                    </div>
                );
            }

            // Array inputs (Skills, etc)
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

            // Socials Object
            if (key === 'socials' && typeof value === 'object') {
              return (
                <div key={key} className="space-y-2 border border-white/5 p-3 rounded-lg">
                  <label className="block text-xs font-bold text-gray-400">Social Links</label>
                  <input placeholder="Facebook URL" className="w-full bg-gray-800 border border-white/10 rounded-lg p-2 text-white text-sm"
                    value={value.facebook || ''} onChange={(e) => setEditingItem({ ...editingItem, socials: { ...value, facebook: e.target.value } })} />
                  <input placeholder="Telegram URL" className="w-full bg-gray-800 border border-white/10 rounded-lg p-2 text-white text-sm"
                    value={value.telegram || ''} onChange={(e) => setEditingItem({ ...editingItem, socials: { ...value, telegram: e.target.value } })} />
                </div>
              );
            }

            // Long Text Areas (Content/Bio)
            if (key === 'content' || key === 'description' || key === 'bio' || key === 'bioKm' || key === 'descriptionKm' || key === 'excerpt') {
                const isContent = key === 'content';
              return (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-gray-400">{label}</label>
                      {isContent && (
                          <div className="flex items-center gap-2 text-[10px] text-indigo-400 bg-indigo-900/20 px-2 py-1 rounded">
                              <HelpCircle size={10} /> Markdown Supported
                          </div>
                      )}
                  </div>
                  <textarea
                    rows={isContent ? 10 : 4}
                    className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm font-khmer"
                    value={value || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, [key]: e.target.value })}
                  />
                </div>
              );
            }

            // Default Text Input
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

          <button type="submit" disabled={isSaving || isUploading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50 font-khmer">
            {isSaving ? <><Loader2 size={18} className="animate-spin" /> កំពុងរក្សាទុក...</> : <><Save size={18} /> រក្សាទុក & បង្ហោះ</>}
          </button>
        </form>
      </div>
    </div>
  );
};
export default EditItemModal;
