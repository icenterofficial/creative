import React, { useState, useEffect } from 'react';
import { Plus, Settings, Database, ExternalLink, LogOut, Users, FileText, Briefcase, LayoutGrid, Menu, Star } from 'lucide-react';
import { getSupabaseClient, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY } from '../lib/supabase';
import { useData } from '../contexts/DataContext';
import AdminHeader from './admin/AdminHeader';
import AdminSidebar from './admin/AdminSidebar';
import ContentGrid from './admin/ContentGrid';
import EditItemModal from './admin/EditItemModal';
import { TeamMember, Project, Post, Service, CurrentUser, Job } from '../types';
import { slugify } from '../utils/format';

interface AdminDashboardProps {
  onLogout: () => void;
  currentUser: CurrentUser;
  onViewSite: () => void;
}

type TabType = 'team' | 'projects' | 'insights' | 'services' | 'careers' | 'settings';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, currentUser, onViewSite }) => {
  const { isUsingSupabase, team = [], projects = [], insights = [], services: localServices = [], jobs = [], updateTeamOrder } = useData();
  const [activeTab, setActiveTab] = useState<TabType>('team'); // Default to Team for members
  const [dbConfig, setDbConfig] = useState<{url: string, key: string} | null>(null);
  
  // Data States (Local to Admin for immediate updates)
  const [adminTeam, setAdminTeam] = useState<TeamMember[]>(team);
  const [adminProjects, setAdminProjects] = useState<Project[]>(projects);
  const [adminInsights, setAdminInsights] = useState<Post[]>(insights);
  const [adminServices, setAdminServices] = useState<Service[]>(localServices);
  const [adminJobs, setAdminJobs] = useState<Job[]>(jobs);

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
      setAdminJobs(jobs || []);
  }, [team, projects, insights, localServices, jobs]);

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
    // For services, ensure icon is treated as string for editing if it's a component
    let itemToEdit = { ...item };
    if (activeTab === 'services' || activeTab === 'careers') {
        if (item._iconString) {
            itemToEdit.icon = item._iconString;
        } else if (typeof item.icon !== 'string') {
            // Fallback for static items without _iconString, default to empty to allow editing
            itemToEdit.icon = ''; 
        }
        // Ensure image field exists even if empty, so the modal renders the uploader (for services)
        if (activeTab === 'services' && !itemToEdit.image) {
            itemToEdit.image = '';
        }
    }
    setEditingItem(itemToEdit);
    setIsModalOpen(true);
  };

  const handleReorderTeam = async (newOrder: TeamMember[]) => {
      setAdminTeam(newOrder); // Optimistic local update
      await updateTeamOrder(newOrder); // Sync to DB
  };

  const handleAdd = () => {
    // Security check: Members cannot add UNLESS it's a Project or Insight (for themselves)
    // Projects are now allowed for everyone
    if ((currentUser.role as string) !== 'admin' && activeTab !== 'projects' && activeTab !== 'insights') {
        alert("You do not have permission to add new items in this section.");
        return;
    }

    setIsAdding(true);
    // Default Templates
    const templates: any = {
      team: { name: '', role: '', roleKm: '', image: '', bio: '', bioKm: '', skills: [], experience: [], socials: {}, pinCode: '1111' },
      projects: { title: '', category: 'graphicdesign', image: '', client: '', description: '', link: '' },
      insights: { title: '', titleKm: '', excerpt: '', content: '', date: new Date().toISOString().split('T')[0], category: 'Design', image: '', authorId: currentUser.role === 'member' ? currentUser.id : 't1' },
      services: { title: '', titleKm: '', subtitle: '', subtitleKm: '', description: '', descriptionKm: '', features: [], featuresKm: [], icon: 'Box', color: 'bg-indigo-500', image: '' },
      careers: { title: '', type: 'Full-time', location: 'Phnom Penh', department: 'Engineering', icon: 'Code', link: '', description: '' }
    };
    setEditingItem(templates[activeTab]);
    setIsModalOpen(true);
  };

  const handleDelete = async (type: string, id: string) => {
      // Logic for Deletion Rights
      const isSuperAdmin = currentUser.role === 'admin';
      
      // 1. Projects: Only Admin OR Creator can delete
      if (type === 'project' && !isSuperAdmin) {
          const project = adminProjects.find(p => p.id === id);
          if (!project || project.createdBy !== currentUser.id) {
              alert("You can only delete projects that you added.");
              return;
          }
      }

      // 2. Insights: Only Admin OR Author can delete
      if (type === 'insight' && !isSuperAdmin) {
          const post = adminInsights.find(p => p.id === id);
          if (!post || post.authorId !== currentUser.id) {
              alert("You can only delete your own articles.");
              return;
          }
      }

      // 3. Other items: Only Admin can delete
      if ((type !== 'project' && type !== 'insight') && !isSuperAdmin) {
          alert("Only Admins can delete this item.");
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
          if (type === 'service') table = 'services';
          if (type === 'job') table = 'jobs';

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
          if (type === 'service') setAdminServices(prev => prev.filter(i => i.id !== id));
          if (type === 'job') setAdminJobs(prev => prev.filter(i => i.id !== id));
          
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

      // Logic: If ID is not a UUID (e.g. 't1', 'graphic', 'j1'), we assume it's static
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isStaticID = !uuidRegex.test(editingItem.id || '');
      
      // Determine if we are technically "adding" to the DB (even if editing a static item)
      // BUT: If editing a static item, we should check if a DB version ALREADY exists to update that instead
      let performInsert = isAdding || isStaticID;

      // Strict Role Check for NEW items, but allow projects for members
      if (isAdding && (currentUser.role as string) !== 'admin' && activeTab !== 'projects' && activeTab !== 'insights') {
          alert("Security Alert: Only Admins can create new records in this section.");
          return;
      }

      setIsSaving(true);
      try {
          const item = { ...editingItem };
          
          // Prepare payload based on table structure
          let table = '';
          let payload: any = {};

          // Generate Slug consistently
          const generatedSlug = item.slug || slugify(item.title || item.name || '');

          if (activeTab === 'projects') {
              table = 'projects';
              payload = { 
                  title: item.title, 
                  category: item.category, 
                  image: item.image, 
                  client: item.client,
                  slug: generatedSlug,
                  description: item.description, 
                  link: item.link
              };
              if (performInsert) payload.created_by = currentUser.id;
          } else if (activeTab === 'services') {
              table = 'services';
              payload = { 
                  title: item.title, 
                  title_km: item.titleKm, 
                  subtitle: item.subtitle,
                  subtitle_km: item.subtitleKm,
                  description: item.description,
                  description_km: item.descriptionKm,
                  features: item.features,
                  features_km: item.featuresKm,
                  icon: (typeof item.icon === 'string' && item.icon.trim()) ? item.icon : 'Box', 
                  color: item.color,
                  link: item.link,
                  slug: generatedSlug,
                  image: item.image 
              };
          } else if (activeTab === 'team') {
              table = 'team';
              payload = { 
                  name: item.name, 
                  role: item.role, 
                  role_km: item.roleKm, 
                  image: item.image, 
                  bio: item.bio, 
                  bio_km: item.bioKm, 
                  skills: item.skills, 
                  experience: item.experience, 
                  socials: item.socials,
                  slug: generatedSlug,
                  pin_code: item.pinCode 
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
                  author_id: item.authorId,
                  slug: generatedSlug
              };
          } else if (activeTab === 'careers') {
              table = 'jobs';
              payload = {
                  title: item.title,
                  type: item.type,
                  location: item.location,
                  department: item.department,
                  icon: (typeof item.icon === 'string' && item.icon.trim()) ? item.icon : 'Code',
                  link: item.link,
                  description: item.description,
                  slug: generatedSlug
              }
          }

          // SMART CHECK: If we are about to INSERT because ID is static, check if SLUG exists in DB first
          // This prevents duplicates when editing static items multiple times
          if (performInsert && !isAdding) {
              const { data: existingRecord } = await supabase
                  .from(table)
                  .select('id')
                  .eq('slug', generatedSlug)
                  .single();
              
              if (existingRecord) {
                  console.log("Found existing record for static item, updating instead of inserting:", existingRecord.id);
                  performInsert = false;
                  item.id = existingRecord.id; // Switch ID to the DB ID
              }
          }

          let res;
          
          // Helper to execute query to allow retry
          const executeQuery = async (currentPayload: any) => {
              if (performInsert) {
                  const p = { ...currentPayload };
                  if (isStaticID) delete p.id; // Remove static ID (e.g. 'j1') so DB generates UUID
                  if (activeTab === 'team') p.order_index = adminTeam.length; 
                  return await supabase.from(table).insert([p]).select();
              } else {
                  return await supabase.from(table).update(currentPayload).eq('id', item.id).select();
              }
          };

          // Try to save full payload first
          res = await executeQuery(payload);

          // RETRY STRATEGY: If 'image' column missing in DB, remove it and retry
          if (res.error && activeTab === 'services' && res.error.message.includes("Could not find the 'image' column")) {
              console.warn("Database missing 'image' column. Retrying without image data.");
              const { image, ...fallbackPayload } = payload;
              res = await executeQuery(fallbackPayload);
              
              if (!res.error) {
                  alert("⚠️ Warning: Text saved successfully, but the Background Image could not be saved because your Supabase database is missing the 'image' column in 'services' table.\n\nPlease run this SQL in Supabase SQL Editor:\n\nALTER TABLE public.services ADD COLUMN image text;");
              }
          }
          
           // RETRY STRATEGY for PROJECTS: If 'description' or 'link' or 'created_by' missing
          if (res.error && activeTab === 'projects') {
              const errMsg = res.error.message;
              if (errMsg.includes("description") || errMsg.includes("link") || errMsg.includes("created_by")) {
                  console.warn("Database missing columns. Retrying with basic payload.");
                  // Fallback: strip new columns
                  const { description, link, created_by, ...fallbackPayload } = payload;
                  res = await executeQuery(fallbackPayload);
                  
                  if (!res.error) {
                      alert("⚠️ Warning: Project saved, but some fields (Description, Link, or Ownership) could not be saved because your database table is outdated. Please run the provided SQL migration script.");
                  }
              }
          }

          // RETRY STRATEGY for JOBS: If 'slug' missing
          if (res.error && activeTab === 'careers' && res.error.message.includes("slug")) {
               console.warn("Database missing slug column. Retrying without slug.");
               const { slug, ...fallbackPayload } = payload;
               res = await executeQuery(fallbackPayload);
          }

          if (res.error) throw res.error;

          const newItem = { ...item, ...res.data[0] }; 
          
          // Map DB snake_case back to camelCase for local state
          if (activeTab === 'projects') {
              newItem.createdBy = res.data[0].created_by;
          }
          if (activeTab === 'team') {
             newItem.pinCode = res.data[0].pin_code;
          }

          // Update local state
          const updater = (list: any[]) => {
              if (performInsert) {
                  return [newItem, ...list];
              } else {
                  return list.map(i => i.id === newItem.id ? newItem : i);
              }
          };
          
          if (activeTab === 'team') setAdminTeam(updater(adminTeam));
          if (activeTab === 'projects') setAdminProjects(updater(adminProjects));
          if (activeTab === 'insights') setAdminInsights(updater(adminInsights));
          if (activeTab === 'services') setAdminServices(updater(adminServices));
          if (activeTab === 'careers') setAdminJobs(updater(adminJobs));

          setIsModalOpen(false);
          
          if (isStaticID && !isAdding && performInsert) {
              alert("Data Saved! Note: Since this was a static item, a NEW record has been created in the database.");
          } else {
              alert("Saved successfully!");
          }
      } catch (err: any) {
          console.error(err);
          if (err.message.includes('Could not find the table')) {
              alert(`Error: The table '${activeTab}' does not exist in your Supabase database. Please create it first.`);
          } else {
              alert("Failed to save: " + err.message);
          }
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
           {/* Projects Button now visible for everyone */}
           <MobileNavButton tab="projects" icon={Briefcase} label="Projects" />
           
           {currentUser.role === 'admin' && (
             <>
                <MobileNavButton tab="services" icon={LayoutGrid} label="Services" />
                <MobileNavButton tab="careers" icon={Star} label="Careers" />
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
                
                {/* Add New Button: Visible for Admins OR if on Projects Tab OR Insights Tab */}
                {activeTab !== 'settings' && (currentUser.role === 'admin' || activeTab === 'projects' || activeTab === 'insights') && (
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
                    data={{ team: adminTeam, projects: adminProjects, insights: adminInsights, services: adminServices, jobs: adminJobs }}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onReorderTeam={handleReorderTeam}
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
