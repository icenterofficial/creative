import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SERVICES, PROJECTS, TEAM, INSIGHTS } from '../constants';
import { Service, Project, TeamMember, Post, GitHubConfig } from '../types';

interface DataContextType {
  services: Service[];
  projects: Project[];
  team: TeamMember[];
  insights: Post[];
  githubConfig: GitHubConfig | null;
  isLoading: boolean;
  lastSyncTime: string | null;
  updateService: (id: string, data: Service) => void;
  updateProject: (id: string, data: Project) => void;
  updateTeamMember: (id: string, data: TeamMember) => void;
  updateInsight: (id: string, data: Post) => void;
  addProject: (data: Project) => void;
  addTeamMember: (data: TeamMember) => void;
  addInsight: (data: Post) => void;
  deleteItem: (type: 'service' | 'project' | 'team' | 'insight', id: string) => void;
  resetData: () => void;
  setGithubConfig: (config: GitHubConfig) => void;
  syncToGitHub: (
      overrides?: { services?: Service[], projects?: Project[], team?: TeamMember[], insights?: Post[] },
      authorName?: string
  ) => Promise<{ success: boolean; message: string }>;
  fetchFromGitHub: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ==========================================
// ⚠️ HARDCODED CONFIGURATION ZONE ⚠️
// ==========================================
const HARDCODED_CONFIG: GitHubConfig = {
    username: 'icenterofficial', 
    repo: 'creative',            
    branch: 'main',              
    token: '' // 🔴 ដាក់ GitHub Token (ghp_...) នៅទីនេះ 🔴
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [team, setTeam] = useState<TeamMember[]>(TEAM);
  const [insights, setInsights] = useState<Post[]>(INSIGHTS);
  
  const [githubConfig, setGithubConfigState] = useState<GitHubConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Load Config
  useEffect(() => {
    const savedConfig = localStorage.getItem('github_config');
    if (savedConfig) {
        setGithubConfigState(JSON.parse(savedConfig));
    } else if (HARDCODED_CONFIG.token && HARDCODED_CONFIG.token !== '') {
        console.log("Using Hardcoded GitHub Config");
        setGithubConfigState(HARDCODED_CONFIG);
    }
  }, []);

  // INITIAL LOAD
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const user = githubConfig?.username || HARDCODED_CONFIG.username;
        const repo = githubConfig?.repo || HARDCODED_CONFIG.repo;
        const branch = githubConfig?.branch || HARDCODED_CONFIG.branch;
        
        const rawUrl = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/site-data.json`;
        
        // Cache Busting: ?t=TIMESTAMP
        const response = await fetch(`${rawUrl}?t=${Date.now()}`, {
            cache: 'no-store',
            headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.services) {
                const restoredServices = data.services.map((s: Service) => {
                    const original = SERVICES.find(os => os.id === s.id);
                    return { ...s, icon: original ? original.icon : s.icon };
                });
                setServices(restoredServices);
            }
            if (data.projects) setProjects(data.projects);
            if (data.team) setTeam(data.team);
            if (data.insights) setInsights(data.insights);
            if (data.lastUpdated) setLastSyncTime(data.lastUpdated);
            
            setIsLoading(false);
            return; 
        }
      } catch (e) {
         console.log("Could not load live data, falling back to defaults.");
      }
      setIsLoading(false);
    };

    loadData();
  }, [githubConfig]);

  // Sync Strategy
  const syncToGitHub = async (
      overrides?: { services?: Service[], projects?: Project[], team?: TeamMember[], insights?: Post[] },
      authorName: string = 'Admin'
  ) => {
    const config = githubConfig || (HARDCODED_CONFIG.token ? HARDCODED_CONFIG : null);

    if (!config || !config.token) {
        return { success: false, message: "Token missing. Please check DataContext.tsx" };
    }

    try {
        const content = {
            services: overrides?.services || services,
            projects: overrides?.projects || projects,
            team: overrides?.team || team,
            insights: overrides?.insights || insights,
            lastUpdated: new Date().toLocaleString()
        };

        const jsonString = JSON.stringify(content, null, 2);
        const utf8Bytes = new TextEncoder().encode(jsonString);
        const base64Content = btoa(String.fromCharCode(...utf8Bytes));

        const fileName = "site-data.json";
        const apiUrl = `https://api.github.com/repos/${config.username}/${config.repo}/contents/${fileName}`;

        // 1. Get SHA (Locking mechanism)
        let sha = "";
        try {
            const getRes = await fetch(`${apiUrl}?ref=${config.branch}`, {
                method: "GET",
                headers: { 
                    Authorization: `Bearer ${config.token}`,
                    Accept: "application/vnd.github.v3+json",
                    "Cache-Control": "no-cache"
                }
            });
            if (getRes.ok) {
                const getData = await getRes.json();
                sha = getData.sha;
            }
        } catch (e) {}

        // 2. Put Data
        const putRes = await fetch(apiUrl, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${config.token}`,
                "Content-Type": "application/json",
                Accept: "application/vnd.github.v3+json"
            },
            body: JSON.stringify({
                message: `Update by ${authorName} - ${new Date().toLocaleDateString()}`,
                content: base64Content,
                sha: sha || undefined,
                branch: config.branch || 'main'
            })
        });

        if (putRes.ok) {
            setLastSyncTime(new Date().toLocaleString());
            // Optimistic Update
            if (overrides?.services) setServices(overrides.services);
            if (overrides?.projects) setProjects(overrides.projects);
            if (overrides?.team) setTeam(overrides.team);
            if (overrides?.insights) setInsights(overrides.insights);
            return { success: true, message: "Published successfully!" };
        } else {
            const err = await putRes.json();
            return { success: false, message: `GitHub Error: ${err.message}` };
        }

    } catch (error: any) {
        return { success: false, message: `Network Error: ${error.message}` };
    }
  };

  const fetchFromGitHub = async () => {
      const config = githubConfig || (HARDCODED_CONFIG.token ? HARDCODED_CONFIG : null);
      if (!config) return;
      setIsLoading(true);
      try {
          const fileName = "site-data.json";
          const apiUrl = `https://api.github.com/repos/${config.username}/${config.repo}/contents/${fileName}?ref=${config.branch}&t=${Date.now()}`;
          const res = await fetch(apiUrl, {
              headers: { Authorization: `Bearer ${config.token}`, Accept: "application/vnd.github.v3.raw", "Cache-Control": "no-cache" }
          });
          if (res.ok) {
               const data = await res.json();
                if (data.services) {
                    const restoredServices = data.services.map((s: Service) => {
                        const original = SERVICES.find(os => os.id === s.id);
                        return { ...s, icon: original ? original.icon : s.icon };
                    });
                    setServices(restoredServices);
                }
                if (data.projects) setProjects(data.projects);
                if (data.team) setTeam(data.team);
                if (data.insights) setInsights(data.insights);
                if (data.lastUpdated) setLastSyncTime(data.lastUpdated);
          }
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const updateService = (id: string, data: Service) => setServices(prev => prev.map(item => item.id === id ? data : item));
  const updateProject = (id: string, data: Project) => setProjects(prev => prev.map(item => item.id === id ? data : item));
  const updateTeamMember = (id: string, data: TeamMember) => setTeam(prev => prev.map(item => item.id === id ? data : item));
  const updateInsight = (id: string, data: Post) => setInsights(prev => prev.map(item => item.id === id ? data : item));
  const addProject = (data: Project) => setProjects(prev => [data, ...prev]);
  const addTeamMember = (data: TeamMember) => setTeam(prev => [...prev, data]);
  const addInsight = (data: Post) => setInsights(prev => [data, ...prev]);
  const deleteItem = (type: 'service' | 'project' | 'team' | 'insight', id: string) => {
    if (type === 'project') setProjects(prev => prev.filter(i => i.id !== id));
    if (type === 'team') setTeam(prev => prev.filter(i => i.id !== id));
    if (type === 'insight') setInsights(prev => prev.filter(i => i.id !== id));
  };
  const resetData = () => {
    if(window.confirm("Reset all data?")) {
        setServices(SERVICES); setProjects(PROJECTS); setTeam(TEAM); setInsights(INSIGHTS);
        localStorage.clear(); window.location.reload();
    }
  };
  const setGithubConfig = (config: GitHubConfig) => {
      setGithubConfigState(config);
      localStorage.setItem('github_config', JSON.stringify(config));
  };

  return (
    <DataContext.Provider value={{
      services, projects, team, insights, githubConfig, isLoading, lastSyncTime,
      updateService, updateProject, updateTeamMember, updateInsight,
      addProject, addTeamMember, addInsight, deleteItem,
      resetData, setGithubConfig, syncToGitHub, fetchFromGitHub
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
