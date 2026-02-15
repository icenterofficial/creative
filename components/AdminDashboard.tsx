import React, { useState, useEffect } from 'react';
import { Plus, Settings, Database, ExternalLink, LogOut, Users, FileText, Briefcase, LayoutGrid, Menu } from 'lucide-react';
import { getSupabaseClient, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY } from '../lib/supabase';
import { useData } from '../contexts/DataContext';
import AdminHeader from './admin/AdminHeader';
import AdminSidebar from './admin/AdminSidebar';
import ContentGrid from './admin/ContentGrid';
import EditItemModal from './admin/EditItemModal';
import { TeamMember, Project, Post, Service, CurrentUser } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
  currentUser: CurrentUser;
  onViewSite: () => void;
}

type TabType = 'team' | 'projects' | 'insights' | 'services' | 'settings';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, currentUser, onViewSite }) => {
  const { isUsingSupabase, team = [], projects = [], insights = [], services: localServices = [] } = useData();
  const [activeTab, setActiveTab] = useState<TabType>('team'); // Default to Team for members
  const [dbConfig, setDbConfig] = useState<{url: string, key: string} | null>(null);
  
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

  // Set initial tab based on role
  useEffect(() => {
      if (currentUser.role === 'member') {
          setActiveTab('team');
      } else {
          setActiveTab('insights');
      }
  }, [currentUser]);

  // Initialize: Load Config and Data
  useEffect(() => {
      // Use LocalStorage if available, otherwise fallback to defaults from lib/supabase.ts
      const url = localStorage.getItem('supabase_url') || DEFAULT_SUPABASE_URL;
      const key = localStorage.getItem('supabase_key') || DEFAULT_SUPABASE_KEY;
      
      if (url && key) {
          setDbConfig({ url, key });
      }

      setAdminTeam(team || []);
      setAdminProjects(projects || []);
      setAdminInsights(insights || []);
      setAdminServices(localServices || []);
  }, [team, projects, insights, localServices]);

  const handleConfigSave = (e: React.FormEvent) => {
      e.preventDefault();
      const urlInput = (document.getElementById('dbUrl') as HTMLInputElement).value;
      const keyInput = (document.getElementById('dbKey') as HTMLInputElement).value;
      
      if (urlInput && keyInput) {
          localStorage.setItem('supabase_url', urlInput);
          localStorage.setItem('supabase_key', keyInput);
          setDbConfig({ url: urlInput, key: keyInput });
          window.location.reload(); // Reload to initialize client
      }
  };

  const clearConfig = () => {
      if(window.confirm("Disconnect Database?")) {
          localStorage.removeItem('supabase_url');
          localStorage.removeItem('supabase_key');
          window.location.reload();
      }
  };

  // CRUD Operations
  const handleEdit = (item: any) => {
    setIsAdding(false);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    // Security check: Members cannot add
    if ((currentUser.role as string) !== 'admin') {
        alert("You do not have permission to add new items.");
        return;
    }

    setIsAdding(true);
    // Default Templates
    const templates: any = {
      team: { name: '', role: '', roleKm: '', image: '', bio: '', bioKm: '', skills: [], experience: [], socials: {} },
      projects: { title: '', category: 'graphicdesign', image: '', client: '' },
      insights: { title: '', titleKm: '', excerpt: '', content: '', date: new Date().toISOString().split('T')[0], category: 'Design', image: '', authorId: currentUser.role === 'member' ? currentUser.id : 't1' },
      services: { title: '', titleKm: '', description: '', icon: '' }
    };
    setEditingItem(templates[activeTab]);
    setIsModalOpen(true);
  };

  const handleDelete = async (type: string, id: string) => {
      if ((currentUser.role as string) !== 'admin') {
          alert("Only Admins can delete items.");
          return;
      }

      if (!window.confirm("Are you sure you want to delete this item?")) return;
      
      const supabase = getSupabaseClient();
      if (!supabase) return;

      setIsSyncing(true);
      try {
          let table = '';
          if (type === 'team') table = 'team';
          if (type === 'project') table = 'projects';
          if (type === 'insight') table = 'insights';

          // Check if it's a UUID
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(id)) {
              alert("Cannot delete static content from database. It is hardcoded in the app.");
              return;
          }

          const { error } = await supabase.from(table).delete().eq('id', id);

          if (error) throw error;
          
          // Optimistic Update
          if (type === 'team') setAdminTeam(prev => prev.filter(i => i.id !== id));
          if (type === 'project') setAdminProjects(prev => prev.filter(i => i.id !== id));
          if (type === 'insight') setAdminInsights(prev => prev.filter(i => i.id !== id));
          
          alert("Item deleted!");
      } catch (err) {
          console.error(err);
          alert("Failed to delete. Check console.");
      } finally {
          setIsSyncing(false);
      }
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      const supabase = getSupabaseClient();
      if (!supabase) return;

      // Logic: If ID is not a UUID (e.g. 't1'), we MUST Insert new, not Update.
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isStaticID = !uuidRegex.test(editingItem.id || '');
      
      // Determine if we are technically "adding" to the DB (even if editing a static item)
      const performInsert = isAdding || isStaticID;

      // Strict Role Check for NEW items, but allow migration of static items
      if (isAdding && (currentUser.role as string) !== 'admin') {
          alert("Security Alert: Only Admins can create new records.");
          return;
      }

      setIsSaving(true);
      try {
          const item = { ...editingItem };
          
          // Prepare payload based on table structure
          let table = '';
          let payload: any = {};

          if (activeTab === 'projects') {
              table = 'projects';
              payload = { title: item.title, category: item.category, image: item.image, client: item.client };
          } else if (activeTab === 'team') {
              table = 'team';
              // Ensure we map camelCase (frontend) to snake_case (database)
              payload = { 
                  name: item.name, 
                  role: item.role, 
                  role_km: item.roleKm, 
                  image: item.image, 
                  bio: item.bio, 
                  bio_km: item.bioKm, 
                  skills: item.skills, 
                  experience: item.experience, 
                  socials: item.socials 
              };
          } else if (activeTab === 'insights') {
              table = 'insights';
              payload = { 
                  title: item.title, 
                  title_km: item.titleKm, 
                  excerpt: item.excerpt, 
                  content: item.content, 
                  date: item.date, 
                  category: item.category, 
                  image: item.image, 
                  author_id: item.authorId 
              };
          }

          let res;
          if (performInsert) {
              // If migrating static data, we do NOT send the ID. DB generates a new UUID.
              if (isStaticID) {
                  delete payload.id;
              }
              res = await supabase.from(table).insert([payload]).select();
          } else {
              // Update Logic - Only works for valid UUIDs
              res = await supabase.from(table).update(payload).eq('id', item.id).select();
          }

          if (res.error) throw res.error;

          const newItem = { ...item, ...res.data[0] }; // Merge response
          
          // Update local state
          const updater = (list: any[]) => {
              if (performInsert) {
                  // If we migrated a static item, we might want to replace the static one locally 
                  // or just add the new one. For simplicity and to avoid duplicates, we add new one.
                  // Ideally, you'd filter out the static one, but that's complex without reloading.
                  return [newItem, ...list];
              } else {
                  return list.map(i => i.id === newItem.id ? newItem : i);
              }
          };
          
          if (activeTab === 'team') setAdminTeam(updater(adminTeam));
          if (activeTab === 'projects') setAdminProjects(updater(adminProjects));
          if (activeTab === 'insights') setAdminInsights(updater(adminInsights));

          setIsModalOpen(false);
          
          if (isStaticID && !isAdding) {
              alert("Data Saved! Note: Since this was a static item, a NEW record has been created in the database. You might see duplicates until the static file is updated.");
          } else {
              alert("Saved successfully!");
          }
      } catch (err: any) {
          console.error(err);
          alert("Failed to save: " + err.message);
      } finally {
          setIsSaving(false);
      }
  };

  // Setup Screen
  if (!dbConfig) {
      return (
          <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6 relative">
               <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                  <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
               </div>
               
               <div className="relative z-10 max-w-md w-full bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
                   <div className="flex justify-center mb-6">
                       <div className="p-4 bg-green-500/20 rounded-2xl text-green-400">
                           <Database size={32} />
                       </div>
                   </div>
                   <h2 className="text-2xl font-bold text-center font-khmer mb-2">Connect Supabase</h2>
                   <p className="text-gray-400 text-center text-sm mb-6">
                       Enter your Supabase credentials to manage content.
                   </p>

                   <form onSubmit={handleConfigSave} className="space-y-4">
                       <div>
                           <label className="block text-xs font-bold text-gray-500 mb-1">Project URL</label>
                           <input id="dbUrl" type="text" className="w-full bg-gray-800 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://xyz.supabase.co" required />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-gray-500 mb-1">Anon / Public Key</label>
                           <input id="dbKey" type="password" className="w-full bg-gray-800 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="eyJh..." required />
                       </div>
                       <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all font-khmer">
                           Connect
                       </button>
                   </form>
                   <button onClick={onLogout} className="absolute top-6 right-6 text-gray-500 hover:text-white flex items-center gap-2">Exit</button>
               </div>
          </div>
      );
  }

  const handleViewSite = () => {
      window.location.reload(); 
  };

  const MobileNavButton = ({ tab, icon: Icon, label }: { tab: TabType, icon: any, label: string }) => (
      <button 
        onClick={() => setActiveTab(tab)}
        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all min-w-[70px] ${activeTab === tab ? 'text-indigo-400 bg-white/5' : 'text-gray-500'}`}
      >
          <Icon size={20} />
          <span className="text-[10px] font-bold">{label}</span>
      </button>
  );

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
          onViewSite={handleViewSite}
       />

       {/* Mobile Navigation Bar */}
       <div className="md:hidden fixed top-16 left-0 right-0 h-16 bg-gray-900 border-b border-white/10 flex items-center px-4 overflow-x-auto gap-2 z-40 no-scrollbar">
           <MobileNavButton tab="team" icon={Users} label={currentUser.role === 'admin' ? "Team" : "Profile"} />
           <MobileNavButton tab="insights" icon={FileText} label="Articles" />
           {currentUser.role === 'admin' && (
             <>
                <MobileNavButton tab="projects" icon={Briefcase} label="Projects" />
                <MobileNavButton tab="services" icon={LayoutGrid} label="Services" />
                <MobileNavButton tab="settings" icon={Settings} label="Config" />
             </>
           )}
       </div>

       <div className="flex flex-1 pt-32 md:pt-16">
          <AdminSidebar 
             activeTab={activeTab}
             setActiveTab={setActiveTab}
             isSuperAdmin={currentUser.role === 'admin'}
          />

          <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-128px)] md:h-[calc(100vh-64px)]">
             <div className="flex justify-between items-center mb-6 md:mb-8">
                <div>
                   <h1 className="text-2xl md:text-3xl font-bold font-khmer capitalize">{activeTab}</h1>
                   <p className="text-gray-400 text-xs md:text-sm">Manage your {activeTab} content directly.</p>
                </div>
                
                {/* Only Show "Add New" for Super Admins */}
                {activeTab !== 'settings' && currentUser.role === 'admin' && (
                    <button 
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20 transition-all font-khmer text-sm"
                    >
                        <Plus size={16} /> <span className="hidden md:inline">Add New</span><span className="md:hidden">Add</span>
                    </button>
                )}
             </div>

             {activeTab === 'settings' ? (
                 <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-xl">
                     <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Database size={20} className="text-green-400"/> Database Config</h3>
                     <p className="text-gray-400 text-sm mb-4">Connected to: <span className="text-green-400">{dbConfig.url}</span></p>
                     <button onClick={clearConfig} className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/20 text-sm font-bold">
                        {localStorage.getItem('supabase_url') ? "Reset to Defaults" : "Reload Connection"}
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
          apiToken={dbConfig.key} 
       />
    </div>
  );
};

export default AdminDashboard;
