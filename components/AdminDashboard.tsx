import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { TeamMember, Project, Post, GitHubConfig } from '../types';
import { X, Plus } from 'lucide-react';
import { CurrentUser } from '../App';

// Import Modular Components
import AdminHeader from './admin/AdminHeader';
import AdminSidebar from './admin/AdminSidebar';
import GitHubConfigForm from './admin/GitHubConfigForm';
import ContentGrid from './admin/ContentGrid';
import EditItemModal from './admin/EditItemModal';

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

  const isSuperAdmin = currentUser.role === 'admin';
  const memberId = currentUser.id;

  const [activeTab, setActiveTab] = useState<'team' | 'projects' | 'insights' | 'services' | 'settings'>('insights');
  
  useEffect(() => {
      if (!isSuperAdmin) setActiveTab('insights');
      else setActiveTab('team');
  }, [isSuperAdmin]);

  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{success: boolean, message: string} | null>(null);

  const handleSync = async () => {
      setIsSyncing(true);
      setSyncStatus(null);
      const result = await syncToGitHub(undefined, currentUser.name || 'Admin');
      setSyncStatus(result);
      setIsSyncing(false);
      if(result.success) setTimeout(() => setSyncStatus(null), 5000);
      else alert(`Sync Failed: ${result.message}`);
  };
  
  const handleFetch = async () => {
      setIsSyncing(true);
      await fetchFromGitHub();
      setIsSyncing(false);
  };

  const handleSaveConfig = (config: GitHubConfig) => {
      setGithubConfig(config);
      alert("Configuration saved!");
  };

  // ROBUST SAVE: Calculates new state BEFORE saving to ensure data integrity
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsSaving(true); 
    let overrides = {};

    if (activeTab === 'team') {
       const newList = isAdding 
            ? [...team, editingItem]
            : team.map(item => item.id === editingItem.id ? editingItem : item);
       overrides = { team: newList };
       if (isAdding && isSuperAdmin) addTeamMember(editingItem);
       else updateTeamMember(editingItem.id, editingItem);
    } else if (activeTab === 'projects' && isSuperAdmin) {
       const newList = isAdding
            ? [editingItem, ...projects]
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
    
    // Auto Push to Live
    const result = await syncToGitHub(overrides, currentUser.name || 'Team Member');
    if (!result.success) {
        alert(`Saved Locally ONLY! Failed to push to GitHub: ${result.message}`);
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

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-indigo-500">
      <AdminHeader 
        currentUser={currentUser}
        isSuperAdmin={isSuperAdmin}
        lastSyncTime={lastSyncTime}
        isSyncing={isSyncing}
        syncStatus={syncStatus}
        onFetch={handleFetch}
        onSync={handleSync}
        onLogout={onLogout}
      />

      <div className="pt-16 flex h-screen">
         <AdminSidebar 
           activeTab={activeTab} 
           setActiveTab={setActiveTab} 
           isSuperAdmin={isSuperAdmin} 
         />

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
                <GitHubConfigForm 
                  initialConfig={{
                      username: githubConfig?.username || 'icenterofficial',
                      repo: githubConfig?.repo || 'creative',
                      branch: githubConfig?.branch || 'main',
                      token: githubConfig?.token || ''
                  }}
                  onSave={handleSaveConfig}
                  onReset={resetData}
                />
            ) : (
                <ContentGrid 
                  activeTab={activeTab}
                  isSuperAdmin={isSuperAdmin}
                  memberId={memberId}
                  data={{ team, projects, insights, services }}
                  onEdit={startEdit}
                  onDelete={deleteItem}
                />
            )}
         </main>
      </div>

      <EditItemModal 
        isOpen={!!editingItem}
        isAdding={isAdding}
        activeTab={activeTab}
        isSuperAdmin={isSuperAdmin}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        onSave={handleSave}
        onCancel={() => setEditingItem(null)}
        isSaving={isSaving}
      />
    </div>
  );
};

export default AdminDashboard;
