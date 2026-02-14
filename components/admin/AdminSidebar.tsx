import React from 'react';
import { Users, FileText, Briefcase, LayoutGrid, Settings } from 'lucide-react';

type TabType = 'team' | 'projects' | 'insights' | 'services' | 'settings';

interface AdminSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isSuperAdmin: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, isSuperAdmin }) => {
  const btnClass = (tab: string) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`;
  
  return (
    <aside className="w-64 bg-gray-900/50 border-r border-white/10 p-4 hidden md:flex flex-col gap-2">
      <button onClick={() => setActiveTab('team')} className={btnClass('team')}>
        <Users size={20} /> {isSuperAdmin ? 'Team Management' : 'My Profile'}
      </button>
      <button onClick={() => setActiveTab('insights')} className={btnClass('insights')}>
        <FileText size={20} /> {isSuperAdmin ? 'All Articles' : 'My Articles'}
      </button>
      {isSuperAdmin && (
        <>
          <button onClick={() => setActiveTab('projects')} className={btnClass('projects')}>
            <Briefcase size={20} /> Projects
          </button>
          <button onClick={() => setActiveTab('services')} className={btnClass('services')}>
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
  );
};
export default AdminSidebar;
