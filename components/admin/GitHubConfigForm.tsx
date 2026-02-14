import React, { useState } from 'react';
import { Cloud, RotateCcw } from 'lucide-react';
import { GitHubConfig } from '../../types';

interface GitHubConfigFormProps {
  initialConfig: GitHubConfig;
  onSave: (config: GitHubConfig) => void;
  onReset: () => void;
}

const GitHubConfigForm: React.FC<GitHubConfigFormProps> = ({ initialConfig, onSave, onReset }) => {
  const [repoConfig, setRepoConfig] = useState<GitHubConfig>(initialConfig);

  return (
    <div className="max-w-2xl">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Cloud className="text-indigo-400" /> GitHub Configuration
        </h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
           Connect your Admin Panel to GitHub to publish live.<br/>
           Token is stored locally in your browser.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); onSave(repoConfig); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">GitHub Username</label>
              <input className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={repoConfig.username} onChange={(e) => setRepoConfig({ ...repoConfig, username: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Repository Name</label>
              <input className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={repoConfig.repo} onChange={(e) => setRepoConfig({ ...repoConfig, repo: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Branch Name</label>
            <input className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={repoConfig.branch} onChange={(e) => setRepoConfig({ ...repoConfig, branch: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Personal Access Token (PAT)</label>
            <input type="password" className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="ghp_..." value={repoConfig.token} onChange={(e) => setRepoConfig({ ...repoConfig, token: e.target.value })} />
          </div>

          <button type="submit" className="w-full py-3 bg-white text-gray-950 font-bold rounded-lg hover:bg-gray-200 transition-colors">
            Save Configuration
          </button>
        </form>
      </div>

      <div className="mt-8">
        <h4 className="font-bold text-white mb-4">Danger Zone</h4>
        <button onClick={onReset} className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/20 w-full justify-center">
          <RotateCcw size={16} /> Reset All Data
        </button>
      </div>
    </div>
  );
};
export default GitHubConfigForm;
