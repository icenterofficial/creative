import React from 'react';
import { X, Save, Loader2, HelpCircle } from 'lucide-react';

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
}

const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen, isAdding, activeTab, isSuperAdmin, editingItem, setEditingItem, onSave, onCancel, isSaving
}) => {
  if (!isOpen || !editingItem) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">
            {isAdding ? 'Add New' : 'Edit Item'} ({activeTab})
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white"><X /></button>
        </div>

        <form onSubmit={onSave} className="space-y-4">
          {Object.keys(editingItem).map((key) => {
            if (key === 'id' || key === 'comments' || key === 'replies' || key === 'icon') return null;
            if (key === 'authorId' && !isSuperAdmin) return null;

            const value = editingItem[key];
            const label = key.charAt(0).toUpperCase() + key.slice(1);

            // Array inputs (Skills, etc)
            if (Array.isArray(value)) {
              return (
                <div key={key}>
                  <label className="block text-xs font-bold text-gray-400 mb-1">{label} (Comma separated)</label>
                  <textarea
                    className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
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
            if (key === 'content' || key === 'description' || key === 'bio' || key === 'bioKm' || key === 'descriptionKm') {
                const isContent = key === 'content';
              return (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-gray-400">{label}</label>
                      {isContent && (
                          <div className="flex items-center gap-2 text-[10px] text-indigo-400 bg-indigo-900/20 px-2 py-1 rounded">
                              <HelpCircle size={10} /> Supports Markdown: **bold**, [Link](url), ![Image](url)
                          </div>
                      )}
                  </div>
                  <textarea
                    rows={isContent ? 10 : 4}
                    className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
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
                  className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={value || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, [key]: e.target.value })}
                />
              </div>
            );
          })}

          <button type="submit" disabled={isSaving} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
            {isSaving ? <><Loader2 size={18} className="animate-spin" /> Publishing...</> : <><Save size={18} /> Save & Publish</>}
          </button>
        </form>
      </div>
    </div>
  );
};
export default EditItemModal;
