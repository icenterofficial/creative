import React, { useState, useEffect } from 'react';
import { Plus, Settings, Key, ExternalLink } from 'lucide-react';
import { CurrentUser } from '../App';
import { sanityClient } from '../lib/sanity';
import { useData } from '../contexts/DataContext';
import AdminHeader from './admin/AdminHeader';
import AdminSidebar from './admin/AdminSidebar';
import ContentGrid from './admin/ContentGrid';
import EditItemModal from './admin/EditItemModal';
import { TeamMember, Project, Post, Service } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
  currentUser: CurrentUser;
}

type TabType = 'team' | 'projects' | 'insights' | 'services' | 'settings';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, currentUser }) => {
  const { isUsingSanity, team, projects, insights, services: localServices } = useData();
  const [activeTab, setActiveTab] = useState<TabType>('insights');
  const [sanityToken, setSanityToken] = useState<string | null>(null);
  
  // Data States (Local to Admin for immediate updates)
  const [adminTeam, setAdminTeam] = useState<TeamMember[]>(team);
  const [adminProjects, setAdminProjects] = useState<Project[]>(projects);
  const [adminInsights, setAdminInsights] = useState<Post[]>(insights);
  const [adminServices, setAdminServices] = useState<Service[]>(localServices);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialize: Load Token and Data
  useEffect(() => {
      const storedToken = localStorage.getItem('sanity_token');
      if (storedToken) setSanityToken(storedToken);

      // Sync local state with context data initially
      setAdminTeam(team);
      setAdminProjects(projects);
      setAdminInsights(insights);
      setAdminServices(localServices);
  }, [team, projects, insights, localServices]);

  const handleTokenSave = (e: React.FormEvent) => {
      e.preventDefault();
      const input = (document.getElementById('tokenInput') as HTMLInputElement).value;
      if (input) {
          localStorage.setItem('sanity_token', input);
          setSanityToken(input);
      }
  };

  const clearToken = () => {
      if(window.confirm("Are you sure you want to clear the API Token?")) {
          localStorage.removeItem('sanity_token');
          setSanityToken(null);
      }
  };

  // CRUD Operations
  const handleEdit = (item: any) => {
    setIsAdding(false);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setIsAdding(true);
    // Default Templates
    const templates: any = {
      team: { _type: 'team', name: '', role: '', roleKm: '', image: '', bio: '', bioKm: '', skills: [], experience: [], socials: {} },
      projects: { _type: 'project', title: '', category: 'graphicdesign', image: '', client: '' },
      insights: { _type: 'post', title: '', titleKm: '', excerpt: '', content: '', date: new Date().toISOString().split('T')[0], category: 'Design', image: '', authorId: currentUser.role === 'member' ? currentUser.id : 't1' },
      services: { _type: 'service', title: '', titleKm: '', description: '', icon: '' }
    };
    setEditingItem(templates[activeTab]);
    setIsModalOpen(true);
  };

  const handleDelete = async (type: string, id: string) => {
      if (!window.confirm("Are you sure you want to delete this item?")) return;
      if (!sanityToken) return alert("You need a Sanity Token to delete.");

      setIsSyncing(true);
      try {
          const client = sanityClient.withConfig({ token: sanityToken, useCdn: false });
          await client.delete(id);
          
          // Optimistic Update
          if (type === 'team') setAdminTeam(prev => prev.filter(i => i.id !== id));
          if (type === 'project') setAdminProjects(prev => prev.filter(i => i.id !== id));
          if (type === 'insight') setAdminInsights(prev => prev.filter(i => i.id !== id));
          
          alert("Item deleted!");
      } catch (err) {
          console.error(err);
          alert("Failed to delete.");
      } finally {
          setIsSyncing(false);
      }
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!sanityToken) return alert("You need a Sanity Token to save.");

      setIsSaving(true);
      try {
          const client = sanityClient.withConfig({ token: sanityToken, useCdn: false });
          
          const doc = { ...editingItem };
          
          // Map local ID to _id if editing, or let Sanity generate for new
          if (!isAdding && doc.id) {
              doc._id = doc.id;
          }
          // Remove local-only fields
          delete doc.id; 
          
          if (isAdding) {
              const res = await client.create(doc);
              // Update state with new item
              const newItem = { ...doc, id: res._id };
              if (activeTab === 'team') setAdminTeam([newItem, ...adminTeam]);
              if (activeTab === 'projects') setAdminProjects([newItem, ...adminProjects]);
              if (activeTab === 'insights') setAdminInsights([newItem, ...adminInsights]);
          } else {
              // For update, we use patch
              await client.patch(doc._id).set(doc).commit();
               // Update local state
               const updater = (list: any[]) => list.map(i => i.id === doc._id ? { ...doc, id: doc._id } : i);
               if (activeTab === 'team') setAdminTeam(updater(adminTeam));
               if (activeTab === 'projects') setAdminProjects(updater(adminProjects));
               if (activeTab === 'insights') setAdminInsights(updater(adminInsights));
          }

          setIsModalOpen(false);
          alert("Saved successfully!");
      } catch (err) {
          console.error(err);
          alert("Failed to save. Check your token and console.");
      } finally {
          setIsSaving(false);
      }
  };

  // If no token, show setup screen
  if (!sanityToken) {
      return (
          <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6 relative">
               <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                  <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
               </div>
               
               <div className="relative z-10 max-w-md w-full bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
                   <div className="flex justify-center mb-6">
                       <div className="p-4 bg-indigo-600/20 rounded-2xl text-indigo-400">
                           <Key size={32} />
                       </div>
                   </div>
                   <h2 className="text-2xl font-bold text-center font-khmer mb-2">Connect to Database</h2>
                   <p className="text-gray-400 text-center text-sm mb-6">
                       To manage content directly on this website, you need a <strong>Sanity Write Token</strong>.
                   </p>

                   <form onSubmit={handleTokenSave} className="space-y-4">
                       <div>
                           <label className="block text-xs font-bold text-gray-500 mb-1">Sanity API Token (Editor/Write)</label>
                           <input 
                                id="tokenInput"
                                type="password" 
                                className="w-full bg-gray-800 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="sk-..."
                                required
                           />
                       </div>
                       <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all font-khmer">
                           Access Admin Panel
                       </button>
                   </form>
                   
                   <div className="mt-6 pt-6 border-t border-white/5 text-center">
                       <a href="https://www.sanity.io/manage" target="_blank" className="text-xs text-indigo-400 hover:underline flex items-center justify-center gap-1">
                           Get Token from Sanity Manage <ExternalLink size={10} />
                       </a>
                   </div>
               </div>
               
               {/* Logout from Admin Page */}
               <button onClick={onLogout} className="absolute top-6 right-6 text-gray-500 hover:text-white flex items-center gap-2">
                   Exit
               </button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
       <AdminHeader 
          currentUser={currentUser}
          isSuperAdmin={currentUser.role === 'admin'}
          lastSyncTime={null}
          isSyncing={isSyncing}
          syncStatus={null}
          onFetch={() => window.location.reload()}
          onSync={() => {}}
          onLogout={onLogout}
       />

       <div className="flex flex-1 pt-16">
          <AdminSidebar 
             activeTab={activeTab}
             setActiveTab={setActiveTab}
             isSuperAdmin={currentUser.role === 'admin'}
          />

          <main className="flex-1 p-6 md:p-8 overflow-y-auto h-[calc(100vh-64px)]">
             <div className="flex justify-between items-center mb-8">
                <div>
                   <h1 className="text-3xl font-bold font-khmer capitalize">{activeTab}</h1>
                   <p className="text-gray-400 text-sm">Manage your {activeTab} content directly.</p>
                </div>
                
                {activeTab !== 'settings' && (
                    <button 
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20 transition-all font-khmer"
                    >
                        <Plus size={18} /> Add New
                    </button>
                )}
             </div>

             {activeTab === 'settings' ? (
                 <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-xl">
                     <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Key size={20} className="text-indigo-400"/> API Configuration</h3>
                     <p className="text-gray-400 text-sm mb-4">
                         You are currently authenticated with a Sanity Token. This allows you to post directly from this website.
                     </p>
                     <button onClick={clearToken} className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/20 text-sm font-bold">
                         Clear Token & Logout
                     </button>
                 </div>
             ) : (
                 <ContentGrid 
                    activeTab={activeTab}
                    isSuperAdmin={currentUser.role === 'admin'}
                    memberId={currentUser.id}
                    data={{ team: adminTeam, projects: adminProjects, insights: adminInsights, services: adminServices }}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                 />
             )}
          </main>
       </div>

       <EditItemModal 
          isOpen={isModalOpen}
          isAdding={isAdding}
          activeTab={activeTab}
          isSuperAdmin={currentUser.role === 'admin'}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
          isSaving={isSaving}
          apiToken={sanityToken}
       />
    </div>
  );
};

export default AdminDashboard;
