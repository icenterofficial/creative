import React from 'react';
import { LogOut, RefreshCw, Shield, Users, Database } from 'lucide-react';
import { CurrentUser } from '../../App';
import { useData } from '../../contexts/DataContext';

interface AdminHeaderProps {
  currentUser: CurrentUser;
  isSuperAdmin: boolean;
  lastSyncTime: string | null;
  isSyncing: boolean;
  syncStatus: { success: boolean; message: string } | null;
  onFetch: () => void;
  onSync: () => void;
  onLogout: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentUser, isSuperAdmin, lastSyncTime, isSyncing, syncStatus, onFetch, onSync, onLogout
}) => {
  const { isUsingSupabase } = useData();

  return (
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
        {/* Data Source Indicator */}
        <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${isUsingSupabase ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}>
            <Database size={10} />
            {isUsingSupabase ? 'Source: Supabase' : 'Source: Local Default'}
        </div>

        {isSuperAdmin && (
          <>
            <button
              onClick={onFetch}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm border border-white/10 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} /> Refresh Data
            </button>
          </>
        )}
        <div className="h-6 w-px bg-white/10 mx-2" />
        <button onClick={onLogout} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
};
export default AdminHeader;
