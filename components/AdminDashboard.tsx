import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { TeamMember, Project, Post, Service } from '../types';
import { X, Plus, Trash2, Edit, Save, RotateCcw, LogOut, LayoutGrid, Users, FileText, Briefcase, Settings, Cloud, RefreshCw, Eye } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { 
    services, projects, team, insights, githubConfig, lastSyncTime,
    updateService, updateProject, updateTeamMember, updateInsight,
    addProject, addTeamMember, addInsight, deleteItem, resetData,
    setGithubConfig, syncToGitHub, fetchFromGitHub
  } = useData();

  const [activeTab, setActiveTab] = useState<'team' | 'projects' | 'insights' | 'services' | 'settings'>('team');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Sync States
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{success: boolean, message: string} | null>(null);

  // GitHub Config Form State
  const [repoConfig, setRepoConfig] = useState({
      username: githubConfig?.username || 'icenterofficial',
      repo: githubConfig?.repo || 'creative',
      branch: githubConfig?.branch || 'main',
      token: githubConfig?.token || ''
  });

  const handleSync = async () => {
      if (!githubConfig?.token) {
          alert("Please configure your GitHub Token in the Settings tab first.");
          setActiveTab('settings');
          return;
      }
      setIsSyncing(true);
      setSyncStatus(null);
      const result = await syncToGitHub();
      setSyncStatus(result);
      setIsSyncing(false);
      
      // Clear message after 5 seconds
      if(result.success) {
          setTimeout(() => setSyncStatus(null), 5000);
      }
  };
  
  const handleFetch = async () => {
      if (!githubConfig?.token) {
          alert("Please configure your GitHub Token in the Settings tab first.");
          setActiveTab('settings');
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (activeTab === 'team') {
       if (isAdding) addTeamMember(editingItem);
       else updateTeamMember(editingItem.id, editingItem);
    } else if (activeTab === 'projects') {
       if (isAdding) addProject(editingItem);
       else updateProject(editingItem.id, editingItem);
    } else if (activeTab === 'insights') {
       if (isAdding) addInsight(editingItem);
       else updateInsight(editingItem.id, editingItem);
    } else if (activeTab === 'services') {
       updateService(editingItem.id, editingItem);
    }
    
    setEditingItem(null);
    setIsAdding(false);
  };

  const startEdit = (item: any) => {
    setEditingItem(item);
    setIsAdding(false);
  };

  const startAdd = () => {
    const id = Date.now().toString();
    if (activeTab === 'team') {
        setEditingItem({ id, name: '', role: '', roleKm: '', image: '', socials: {}, bio: '', skills: [], experience: [] } as TeamMember);
    } else if (activeTab === 'projects') {
        setEditingItem({ id, title: '', category: 'graphicdesign', image: '' } as Project);
    } else if (activeTab === 'insights') {
        setEditingItem({ id, title: '', titleKm: '', excerpt: '', date: new Date().toLocaleDateString(), category: 'Design', image: '', authorId: 't1', content: '' } as Post);
    }
    setIsAdding(true);
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
             {/* Dynamic Fields based on Active Tab */}
             {Object.keys(editingItem).map((key) => {
                if (key === 'id' || key === 'comments' || key === 'replies' || key === 'icon') return null; // Skip non-editable
                
                const value = editingItem[key];
                const label = key.charAt(0).toUpperCase() + key.slice(1);

                // Arrays (Skills, Experience, Features)
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

                // Socials Object
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

                 // Long Text
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

                // Default Input
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

             <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2">
                <Save size={18} /> Save Changes
             </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-indigo-500">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-white/10 flex items-center justify-between px-6 z-50">
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold">P</div>
              <span className="font-bold text-lg hidden md:inline">Admin Dashboard</span>
          </div>

          {/* Sync Status / Buttons */}
          <div className="flex items-center gap-4">
              {lastSyncTime && (
                  <span className="text-xs text-gray-500 hidden lg:inline">Last synced: {lastSyncTime}</span>
              )}
              
              {githubConfig && (
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
                        {isSyncing ? 'Syncing...' : syncStatus?.success ? 'Saved!' : 'Push to Live'}
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
         {/* Sidebar */}
         <aside className="w-64 bg-gray-900/50 border-r border-white/10 p-4 hidden md:flex flex-col gap-2">
            <button onClick={() => setActiveTab('team')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'team' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                <Users size={20} /> Team Members
            </button>
            <button onClick={() => setActiveTab('projects')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'projects' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                <Briefcase size={20} /> Projects
            </button>
            <button onClick={() => setActiveTab('insights')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'insights' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                <FileText size={20} /> Articles
            </button>
            <button onClick={() => setActiveTab('services')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'services' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                <LayoutGrid size={20} /> Services
            </button>
            
            <div className="flex-1" />
            
            <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-gray-800 text-white border border-white/10' : 'text-gray-400 hover:bg-white/5'}`}>
                <Settings size={20} /> Settings
            </button>
         </aside>

         {/* Main Content */}
         <main className="flex-1 overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold capitalize">{activeTab} Management</h2>
                {activeTab !== 'services' && activeTab !== 'settings' && (
                    <button onClick={startAdd} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold transition-colors">
                        <Plus size={18} /> Add New
                    </button>
                )}
            </div>

            {/* Error Message */}
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
                    {/* List Items based on Active Tab */}
                    {activeTab === 'team' && team.map(item => (
                        <div key={item.id} className="bg-gray-900 border border-white/10 rounded-xl p-4 flex flex-col gap-4">
                            <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded-lg bg-gray-800" />
                            <div>
                                <h4 className="font-bold text-lg text-white">{item.name}</h4>
                                <p className="text-gray-400 text-sm">{item.role}</p>
                            </div>
                            <div className="mt-auto flex gap-2">
                                <button onClick={() => startEdit(item)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><Edit size={14}/> Edit</button>
                                <button onClick={() => deleteItem('team', item.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}

                    {activeTab === 'projects' && projects.map(item => (
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

                    {activeTab === 'insights' && insights.map(item => (
                        <div key={item.id} className="bg-gray-900 border border-white/10 rounded-xl p-4 flex flex-col gap-4">
                            <img src={item.image} alt={item.title} className="w-full h-40 object-cover rounded-lg bg-gray-800" />
                            <div>
                                <h4 className="font-bold text-white line-clamp-2">{item.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                            </div>
                            <div className="mt-auto flex gap-2">
                                <button onClick={() => startEdit(item)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><Edit size={14}/> Edit</button>
                                <button onClick={() => deleteItem('insight', item.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}

                    {activeTab === 'services' && services.map(item => (
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
