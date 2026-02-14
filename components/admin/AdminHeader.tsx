import React from 'react';
import { LogOut, Cloud, RefreshCw, Shield, Users } from 'lucide-react';
import { CurrentUser } from '../../App';

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
        {lastSyncTime && (
          <span className="text-xs text-green-400 hidden lg:inline flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live: {lastSyncTime}
          </span>
        )}

        {isSuperAdmin && (
          <>
            <button
              onClick={onFetch}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm border border-white/10 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} /> Fetch
            </button>
            <button
              onClick={onSync}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-sm font-bold border transition-all ${
                syncStatus?.success ? 'bg-green-600 border-green-500' : 
                syncStatus?.success === false ? 'bg-red-600 border-red-500' : 
                'bg-indigo-600 border-indigo-500 hover:bg-indigo-500'
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
  );
};
export default AdminHeader;
