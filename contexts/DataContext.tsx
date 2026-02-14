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
  lastUpdatedBy: string | null;
  isUsingLive: boolean; // New: True if data came from GitHub
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

// --- UTILS FOR UNICODE SUPPORT ---
const safeBase64Encode = (str: string) => {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode(parseInt(p1, 16));
    }));
};

const safeBase64Decode = (str: string) => {
    try {
        return decodeURIComponent(atob(str).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    } catch (e) {
        console.error("Base64 Decode Error:", e);
        return "{}";
    }
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [team, setTeam] = useState<TeamMember[]>(TEAM);
  const [insights, setInsights] = useState<Post[]>(INSIGHTS);
  
  const [githubConfig, setGithubConfigState] = useState<GitHubConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string | null>(null);
  const [isUsingLive, setIsUsingLive] = useState(false);

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

  // Main Data Loading Logic
  const loadData = async () => {
    setIsLoading(true);
    const config = githubConfig || (HARDCODED_CONFIG.token ? HARDCODED_CONFIG : null);
    
    // Default to defaults first
    let loadedData: any = null;

    try {
        if (config && config.token) {
            // 1. ADMIN MODE: Fetch via API (Bypasses Cache)
            console.log("Fetching via API (Admin Mode)...");
            const fileName = "site-data.json";
            const apiUrl = `https://api.github.com/repos/${config.username}/${config.repo}/contents/${fileName}?ref=${config.branch}&t=${Date.now()}`;
            
            const res = await fetch(apiUrl, {
                headers: { 
                    Authorization: `Bearer ${config.token}`, 
                    Accept: "application/vnd.github.v3+json",
                    "Cache-Control": "no-cache"
                }
            });

            if (res.ok) {
                const json = await res.json();
                if (json.content) {
                    const decodedContent = safeBase64Decode(json.content);
                    loadedData = JSON.parse(decodedContent);
                }
            } else {
                console.warn(`API Fetch failed (${res.status}), trying raw...`);
                // Fallback to raw if API fails (e.g. permission issue)
                throw new Error("API failed"); 
            }

        } else {
            // 2. PUBLIC MODE: Fetch via Raw (Cached)
             // Use hardcoded defaults if no config in localstorage, but try to construct raw url if username/repo known
             const user = config?.username || HARDCODED_CONFIG.username;
             const repo = config?.repo || HARDCODED_CONFIG.repo;
             const branch = config?.branch || HARDCODED_CONFIG.branch;

             const rawUrl = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/site-data.json`;
             const res = await fetch(`${rawUrl}?t=${Date.now()}`);
             if (res.ok) {
                 loadedData = await res.json();
             }
        }

        // 3. Process Loaded Data
        if (loadedData) {
            if (loadedData.services) {
                // Merge icons from constants because JSON can't store React Nodes
                const restoredServices = loadedData.services.map((s: Service) => {
                    const original = SERVICES.find(os => os.id === s.id);
                    return { ...s, icon: original ? original.icon : s.icon };
                });
                setServices(restoredServices);
            }
            if (loadedData.projects) setProjects(loadedData.projects);
            if (loadedData.team) setTeam(loadedData.team);
            if (loadedData.insights) {
                // Sort by date descending (assuming string date comparison works or just new items on top)
                setInsights(loadedData.insights);
            }
            if (loadedData.lastUpdated) setLastSyncTime(loadedData.lastUpdated);
            if (loadedData.lastUpdatedBy) setLastUpdatedBy(loadedData.lastUpdatedBy);
            
            setIsUsingLive(true);
        } else {
            setIsUsingLive(false); // Using local constants
        }

    } catch (e) {
         console.error("Load Error:", e);
         setIsUsingLive(false);
    } finally {
        setIsLoading(false);
    }
  };

  // Trigger load on config change or mount
  useEffect(() => {
      loadData();
  }, [githubConfig]);

  // Sync Strategy
  const syncToGitHub = async (
      overrides?: { services?: Service[], projects?: Project[], team?: TeamMember[], insights?: Post[] },
      authorName: string = 'Admin'
  ) => {
    const config = githubConfig || (HARDCODED_CONFIG.token ? HARDCODED_CONFIG : null);

    if (!config || !config.token) {
        return { success: false, message: "Token missing. Please check configuration." };
    }

    const content = {
        services: overrides?.services || services,
        projects: overrides?.projects || projects,
        team: overrides?.team || team,
        insights: overrides?.insights || insights,
        lastUpdated: new Date().toLocaleString(),
        lastUpdatedBy: authorName
    };

    try {
        const jsonString = JSON.stringify(content, null, 2);
        const base64Content = safeBase64Encode(jsonString);

        const fileName = "site-data.json";
        const apiUrl = `https://api.github.com/repos/${config.username}/${config.repo}/contents/${fileName}`;

        // 1. GET SHA
        let sha = undefined;
        try {
            const getRes = await fetch(`${apiUrl}?ref=${config.branch}&t=${Date.now()}`, {
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
            } else if (getRes.status === 404) {
                sha = undefined;
            } else {
                 const err = await getRes.json();
                 return { success: false, message: `Check Failed: ${err.message}` };
            }
        } catch (e: any) {
            return { success: false, message: `Network Error: ${e.message}` };
        }

        // 2. PUT Data
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
                sha: sha, 
                branch: config.branch || 'main'
            })
        });

        if (putRes.ok) {
            setLastSyncTime(new Date().toLocaleString());
            setLastUpdatedBy(authorName);
            
            // Update local state immediately
            if (overrides?.services) setServices(overrides.services);
            if (overrides?.projects) setProjects(overrides.projects);
            if (overrides?.team) setTeam(overrides.team);
            if (overrides?.insights) setInsights(overrides.insights);
            
            setIsUsingLive(true);
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
      await loadData();
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
      services, projects, team, insights, githubConfig, isLoading, lastSyncTime, lastUpdatedBy, isUsingLive,
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
