import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { TeamMember, Project, Post, Service } from '../types';
import { X, Plus, Trash2, Edit, Save, RotateCcw, LogOut, LayoutGrid, Users, FileText, Briefcase, Settings, Cloud, RefreshCw, Eye, Shield, Lock, Loader2 } from 'lucide-react';
import { CurrentUser } from '../App';

interface AdminDashboardProps {
  onLogout: () => void;
  currentUser: CurrentUser;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, currentUser }) => {
  const { 
    services, projects, team, insights, githubConfig, lastSyncTime,
    updateService, updateProject, updateTeamMember, updateInsight,
    addProject, addTeamMember, addInsight, deleteItem, resetData,
    setGithubConfig, syncToGitHub, fetchFromGitHub
  } = useData();

  // Role Checks
  const isSuperAdmin = currentUser.role === 'admin';
  const memberId = currentUser.id;

  // Set default active tab based on role
  const [activeTab, setActiveTab] = useState<'team' | 'projects' | 'insights' | 'services' | 'settings'>('insights');
  
  useEffect(() => {
      // If member logs in, default to their profile or insights
      if (!isSuperAdmin) {
          setActiveTab('insights');
      } else {
          setActiveTab('team');
      }
  }, [isSuperAdmin]);

  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Sync States
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // New state for auto-save loading
  const [syncStatus, setSyncStatus] = useState<{success: boolean, message: string} | null>(null);

  // GitHub Config Form State
  const [repoConfig, setRepoConfig] = useState({
      username: githubConfig?.username || 'icenterofficial',
      repo: githubConfig?.repo || 'creative',
      branch: githubConfig?.branch || 'main',
      token: githubConfig?.token || ''
  });

  // Manual Sync (Mostly for Super Admin or troubleshooting)
  const handleSync = async () => {
      if (!githubConfig?.token) {
          alert("Please configure your GitHub Token in the Settings tab first.");
          if (isSuperAdmin) setActiveTab('settings');
          return;
      }
      setIsSyncing(true);
      setSyncStatus(null);
      const result = await syncToGitHub();
      setSyncStatus(result);
      setIsSyncing(false);
      
      if(result.success) {
          setTimeout(() => setSyncStatus(null), 5000);
      }
  };
  
  const handleFetch = async () => {
      if (!githubConfig?.token) {
          alert("Please configure your GitHub Token in the Settings tab first.");
          if (isSuperAdmin) setActiveTab('settings');
          return;
      }
      setIsSyncing(true);
      await fetchFromGitHub();
      setIsSyncing(false);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
      e.preventDefault();
      setGithubConfig(repoConfig);
      alert("Configuration saved! You can now sync data.");
  };

  // 100% Guarantee Logic: Auto-Sync on Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsSaving(true); // Start loading indicator on button

    // CRITICAL FIX: React state updates are asynchronous.
    // To ensure 100% accuracy, we must construct the new data list MANUALLY
    // and pass it to syncToGitHub, rather than waiting for the state to update.
    let overrides = {};

    // 1. Update Local Data & Prepare Overrides
    if (activeTab === 'team') {
       const newList = isAdding 
            ? [...team, editingItem] // Note: DataContext uses [...prev, data] typically
            : team.map(item => item.id === editingItem.id ? editingItem : item);
       overrides = { team: newList };

       if (isAdding && isSuperAdmin) addTeamMember(editingItem);
       else updateTeamMember(editingItem.id, editingItem);

    } else if (activeTab === 'projects' && isSuperAdmin) {
       const newList = isAdding
            ? [editingItem, ...projects] // DataContext addProject uses [data, ...prev]
            : projects.map(item => item.id === editingItem.id ? editingItem : item);
       overrides = { projects: newList };

       if (isAdding) addProject(editingItem);
       else updateProject(editingItem.id, editingItem);

    } else if (activeTab === 'insights') {
       const newList = isAdding
            ? [editingItem, ...insights]
            : insights.map(item => item.id === editingItem.id ? editingItem : item);
       overrides = { insights: newList };

       if (isAdding) addInsight(editingItem);
       else updateInsight(editingItem.id, editingItem);

    } else if (activeTab === 'services' && isSuperAdmin) {
       const newList = services.map(item => item.id === editingItem.id ? editingItem : item);
       overrides = { services: newList };
       
       updateService(editingItem.id, editingItem);
    }
    
    // 2. AUTO SYNC TO GITHUB (If Configured)
    // We pass the 'overrides' object. The syncToGitHub function will use these lists 
    // instead of the current state (which might be stale).
    if (githubConfig?.token) {
        const result = await syncToGitHub(overrides);
        if (!result.success) {
            alert(`Saved locally, but failed to sync to GitHub: ${result.message}`);
        }
    }

    setIsSaving(false);
    setEditingItem(null);
    setIsAdding(false);
  };

  const startEdit = (item: any) => {
    setEditingItem(item);
    setIsAdding(false);
  };

  const startAdd = () => {
    const id = Date.now().toString();
    if (activeTab === 'team' && isSuperAdmin) {
        setEditingItem({ id, name: '', role: '', roleKm: '', image: '', socials: {}, bio: '', skills: [], experience: [] } as TeamMember);
    } else if (activeTab === 'projects' && isSuperAdmin) {
        setEditingItem({ id, title: '', category: 'graphicdesign', image: '' } as Project);
    } else if (activeTab === 'insights') {
        const newAuthorId = isSuperAdmin ? 't1' : (memberId || 't1');
        setEditingItem({ id, title: '', titleKm: '', excerpt: '', date: new Date().toLocaleDateString(), category: 'Design', image: '', authorId: newAuthorId, content: '' } as Post);
    }
    setIsAdding(true);
  };

  // Helper to calculate article count
  const getPostCount = (authorId: string) => {
      return insights.filter(post => post.authorId === authorId).length;
  };

  const renderForm = () => {
    if (!editingItem) return null;

    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm">
        <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">
                {isAdding ? 'Add New' : 'Edit Item'} ({activeTab})
            </h3>
            <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-white"><X /></button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
             {Object.keys(editingItem).map((key) => {
                if (key === 'id' || key === 'comments' || key === 'replies' || key === 'icon') return null; 
                
                if (key === 'authorId' && !isSuperAdmin) return null;

                const value = editingItem[key];
                const label = key.charAt(0).toUpperCase() + key.slice(1);

                if (Array.isArray(value)) {
                    return (
                        <div key={key}>
                            <label className="block text-xs font-bold text-gray-400 mb-1">{label} (Comma separated)</label>
                            <textarea 
                                className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={value.join(', ')}
                                onChange={(e) => setEditingItem({ ...editingItem, [key]: e.target.value.split(',').map(s => s.trim()) })}
                            />
                        </div>
                    );
                }

                if (key === 'socials' && typeof value === 'object') {
                    return (
                        <div key={key} className="space-y-2 border border-white/5 p-3 rounded-lg">
                            <label className="block text-xs font-bold text-gray-400">Social Links</label>
                            <input 
                                placeholder="Facebook URL"
                                className="w-full bg-gray-800 border border-white/10 rounded-lg p-2 text-white text-sm"
                                value={value.facebook || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, socials: { ...value, facebook: e.target.value } })}
                            />
                            <input 
                                placeholder="Telegram URL"
                                className="w-full bg-gray-800 border border-white/10 rounded-lg p-2 text-white text-sm"
                                value={value.telegram || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, socials: { ...value, telegram: e.target.value } })}
                            />
                        </div>
                    );
                }

                if (key === 'content' || key === 'description' || key === 'bio' || key === 'bioKm' || key === 'descriptionKm') {
                    return (
                        <div key={key}>
                            <label className="block text-xs font-bold text-gray-400 mb-1">{label}</label>
                            <textarea 
                                rows={5}
                                className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={value || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, [key]: e.target.value })}
                            />
                        </div>
                    );
                }

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

             <button 
                type="submit" 
                disabled={isSaving}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
            >
                {isSaving ? (
                    <>
                        <Loader2 size={18} className="animate-spin" /> Publishing...
                    </>
                ) : (
                    <>
                        <Save size={18} /> Save & Publish
                    </>
                )}
             </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-indigo-500">
      <header className="fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-white/10 flex items-center justify-between px-6 z-50">
          <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${isSuperAdmin ? 'bg-indigo-600' : 'bg-green-600'}`}>
                  {isSuperAdmin ? <Shield size={16} /> : <Users size={16} />}
              </div>
              <div className="flex flex-col">
                  <span className="font-bold text-sm hidden md:inline">{currentUser.name}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">{isSuperAdmin ? 'Super Admin' : 'Team Member'}</span>
              </div>
          </div>

          <div className="flex items-center gap-4">
              {lastSyncTime && (
                  <span className="text-xs text-gray-500 hidden lg:inline">Live: {lastSyncTime}</span>
              )}
              
              {/* Only Super Admin needs manual controls now, since Members auto-save */}
              {githubConfig && isSuperAdmin && (
                <>
                    <button 
                        onClick={handleFetch} 
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm border border-white/10 disabled:opacity-50"
                        title="Pull data from GitHub"
                    >
                        <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} /> Fetch
                    </button>
                    <button 
                        onClick={handleSync} 
                        disabled={isSyncing}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-sm font-bold border transition-all ${
                            syncStatus?.success 
                            ? 'bg-green-600 border-green-500' 
                            : syncStatus?.success === false 
                                ? 'bg-red-600 border-red-500' 
                                : 'bg-indigo-600 border-indigo-500 hover:bg-indigo-500'
                        } disabled:opacity-50`}
                    >
                        <Cloud size={14} /> 
                        {isSyncing ? 'Syncing...' : syncStatus?.success ? 'Live!' : 'Push Live'}
                    </button>
                </>
              )}
              
              <div className="h-6 w-px bg-white/10 mx-2" />
              
              <button onClick={onLogout} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
                  <LogOut size={16} /> Logout
              </button>
          </div>
      </header>

      <div className="pt-16 flex h-screen">
         <aside className="w-64 bg-gray-900/50 border-r border-white/10 p-4 hidden md:flex flex-col gap-2">
            <button onClick={() => setActiveTab('team')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'team' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                <Users size={20} /> {isSuperAdmin ? 'Team Management' : 'My Profile'}
            </button>

            <button onClick={() => setActiveTab('insights')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'insights' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                <FileText size={20} /> {isSuperAdmin ? 'All Articles' : 'My Articles'}
            </button>

            {isSuperAdmin && (
                <>
                    <button onClick={() => setActiveTab('projects')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'projects' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                        <Briefcase size={20} /> Projects
                    </button>
                    <button onClick={() => setActiveTab('services')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'services' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                        <LayoutGrid size={20} /> Services
                    </button>
                </>
            )}
            
            <div className="flex-1" />
            
            {isSuperAdmin && (
                <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-gray-800 text-white border border-white/10' : 'text-gray-400 hover:bg-white/5'}`}>
                    <Settings size={20} /> Settings
                </button>
            )}
         </aside>

         <main className="flex-1 overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold capitalize">
                    {activeTab === 'team' && !isSuperAdmin ? 'My Profile' : `${activeTab} Management`}
                </h2>
                
                {((isSuperAdmin && activeTab !== 'services' && activeTab !== 'settings') || (activeTab === 'insights' && !isSuperAdmin)) && (
                    <button onClick={startAdd} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold transition-colors">
                        <Plus size={18} /> Add New
                    </button>
                )}
            </div>

            {syncStatus?.success === false && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center justify-between">
                    <span>{syncStatus.message}</span>
                    <button onClick={() => setSyncStatus(null)}><X size={16}/></button>
                </div>
            )}

            {activeTab === 'settings' ? (
                <div className="max-w-2xl">
                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Cloud className="text-indigo-400" /> GitHub Configuration
                        </h3>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            To allow team members to post articles that are visible to everyone, you must connect this admin panel to your GitHub repository.<br/><br/>
                            1. You already have a Token: <code className="text-indigo-400">ghp_QOY9...</code><br/>
                            2. Enter it below (We do not save it on our servers, only in your browser).<br/>
                            3. Click "Save Config". Then click "Push to Live" in the top bar to publish current data.
                        </p>
                        
                        <form onSubmit={handleSaveConfig} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">GitHub Username</label>
                                    <input 
                                        className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g., ponloe-creative"
                                        value={repoConfig.username}
                                        onChange={(e) => setRepoConfig({...repoConfig, username: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Repository Name</label>
                                    <input 
                                        className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g., my-website"
                                        value={repoConfig.repo}
                                        onChange={(e) => setRepoConfig({...repoConfig, repo: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Branch Name</label>
                                <input 
                                    className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="main"
                                    value={repoConfig.branch}
                                    onChange={(e) => setRepoConfig({...repoConfig, branch: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Personal Access Token (PAT)</label>
                                <input 
                                    type="password"
                                    className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                    value={repoConfig.token}
                                    onChange={(e) => setRepoConfig({...repoConfig, token: e.target.value})}
                                />
                                <p className="text-[10px] text-gray-500 mt-1">Use your Classic Token starting with ghp_</p>
                            </div>
                            
                            <button type="submit" className="w-full py-3 bg-white text-gray-950 font-bold rounded-lg hover:bg-gray-200 transition-colors">
                                Save Configuration
                            </button>
                        </form>
                    </div>

                    <div className="mt-8">
                        <h4 className="font-bold text-white mb-4">Danger Zone</h4>
                        <button onClick={resetData} className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/20 w-full justify-center">
                            <RotateCcw size={16} /> Reset All Data to Default Code
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    
                    {/* TEAM TAB */}
                    {activeTab === 'team' && team
                        .filter(item => isSuperAdmin || item.id === memberId)
                        .map(item => {
                            // Calculate Article Count for the badge
                            const postCount = getPostCount(item.id);
                            
                            return (
                                <div key={item.id} className="bg-gray-900 border border-white/10 rounded-xl p-4 flex flex-col gap-4">
                                    <div className="relative">
                                        <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded-lg bg-gray-800" />
                                        {postCount > 0 && (
                                            <div className="absolute top-2 right-2 px-2 py-1 bg-indigo-600/90 backdrop-blur-sm rounded-lg border border-white/10 text-white text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                                                <FileText size={10} /> {postCount} Articles
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-white">{item.name}</h4>
                                        <p className="text-gray-400 text-sm">{item.role}</p>
                                    </div>
                                    <div className="mt-auto flex gap-2">
                                        <button onClick={() => startEdit(item)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><Edit size={14}/> Edit</button>
                                        {isSuperAdmin && (
                                            <button onClick={() => deleteItem('team', item.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg"><Trash2 size={16}/></button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                    {/* PROJECTS TAB (Admin Only) */}
                    {activeTab === 'projects' && isSuperAdmin && projects.map(item => (
                        <div key={item.id} className="bg-gray-900 border border-white/10 rounded-xl p-4 flex flex-col gap-4">
                            <img src={item.image} alt={item.title} className="w-full h-40 object-cover rounded-lg bg-gray-800" />
                            <div>
                                <h4 className="font-bold text-white">{item.title}</h4>
                                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">{item.category}</span>
                            </div>
                            <div className="mt-auto flex gap-2">
                                <button onClick={() => startEdit(item)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><Edit size={14}/> Edit</button>
                                <button onClick={() => deleteItem('project', item.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}

                    {/* INSIGHTS TAB */}
                    {activeTab === 'insights' && insights
                        .filter(item => isSuperAdmin || item.authorId === memberId)
                        .map(item => {
                            const canEdit = isSuperAdmin || item.authorId === memberId;
                            return (
                                <div key={item.id} className="bg-gray-900 border border-white/10 rounded-xl p-4 flex flex-col gap-4">
                                    <img src={item.image} alt={item.title} className="w-full h-40 object-cover rounded-lg bg-gray-800" />
                                    <div>
                                        <h4 className="font-bold text-white line-clamp-2">{item.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                                    </div>
                                    <div className="mt-auto flex gap-2">
                                        {canEdit ? (
                                            <>
                                                <button onClick={() => startEdit(item)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><Edit size={14}/> Edit</button>
                                                <button onClick={() => deleteItem('insight', item.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg"><Trash2 size={16}/></button>
                                            </>
                                        ) : (
                                            <div className="flex-1 py-2 bg-white/5 text-gray-500 rounded-lg text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                                                <Lock size={14}/> View Only
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                    {/* SERVICES TAB (Admin Only) */}
                    {activeTab === 'services' && isSuperAdmin && services.map(item => (
                        <div key={item.id} className="bg-gray-900 border border-white/10 rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full ${item.color}`}></div>
                            <div className="pl-3">
                                <h4 className="font-bold text-white">{item.title}</h4>
                                <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
                            </div>
                            <div className="mt-auto flex gap-2">
                                <button onClick={() => startEdit(item)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><Edit size={14}/> Edit</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
         </main>
      </div>

      {renderForm()}
    </div>
  );
};

export default AdminDashboard;
