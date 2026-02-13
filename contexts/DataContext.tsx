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
  syncToGitHub: () => Promise<{ success: boolean; message: string }>;
  fetchFromGitHub: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [team, setTeam] = useState<TeamMember[]>(TEAM);
  const [insights, setInsights] = useState<Post[]>(INSIGHTS);
  
  const [githubConfig, setGithubConfigState] = useState<GitHubConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Helper to load config
  useEffect(() => {
    const savedConfig = localStorage.getItem('github_config');
    if (savedConfig) {
        setGithubConfigState(JSON.parse(savedConfig));
    }
  }, []);

  // INITIAL LOAD: Try to fetch 'site-data.json' from the root (Public View)
  // OR fallback to LocalStorage/Constants
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // 1. Try fetching live data file (Works on GitHub Pages if file exists)
        // We use a timestamp to bust cache
        const response = await fetch(`./site-data.json?t=${Date.now()}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log("Loaded data from site-data.json");
            
            // Restore Icons for Services (since JSON doesn't store React Elements)
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
            return; // Success!
        }
      } catch (e) {
         console.log("Could not load site-data.json, falling back to local storage.");
      }

      // 2. Fallback to Local Storage (if user edited locally before)
      try {
        const savedServices = localStorage.getItem('app_services');
        const savedProjects = localStorage.getItem('app_projects');
        const savedTeam = localStorage.getItem('app_team');
        const savedInsights = localStorage.getItem('app_insights');

        if (savedServices) {
          const parsedServices = JSON.parse(savedServices);
          const restoredServices = parsedServices.map((s: Service) => {
            const original = SERVICES.find(os => os.id === s.id);
            return {
              ...s,
              icon: original ? original.icon : s.icon 
            };
          });
          setServices(restoredServices);
        }

        if (savedProjects) setProjects(JSON.parse(savedProjects));
        if (savedTeam) setTeam(JSON.parse(savedTeam));
        if (savedInsights) setInsights(JSON.parse(savedInsights));
      } catch (error) {
        console.error("Failed to load data from localStorage:", error);
      }
      
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Persist to LocalStorage as backup
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('app_services', JSON.stringify(services));
      localStorage.setItem('app_projects', JSON.stringify(projects));
      localStorage.setItem('app_team', JSON.stringify(team));
      localStorage.setItem('app_insights', JSON.stringify(insights));
    }
  }, [services, projects, team, insights, isLoading]);

  const setGithubConfig = (config: GitHubConfig) => {
      setGithubConfigState(config);
      localStorage.setItem('github_config', JSON.stringify(config));
  };

  // ADMIN: Push data to GitHub Repo
  const syncToGitHub = async () => {
    if (!githubConfig) return { success: false, message: "Configuration missing" };

    try {
        const content = {
            services,
            projects,
            team,
            insights,
            lastUpdated: new Date().toLocaleString()
        };

        // Convert to Base64 (required by GitHub API)
        // Use a safe unicode encoding method
        const jsonString = JSON.stringify(content, null, 2);
        const utf8Bytes = new TextEncoder().encode(jsonString);
        const base64Content = btoa(String.fromCharCode(...utf8Bytes));

        const fileName = "site-data.json";
        const apiUrl = `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/${fileName}`;

        // 1. Get current SHA (if file exists) to update it
        let sha = "";
        try {
            const getRes = await fetch(apiUrl, {
                headers: { 
                    Authorization: `Bearer ${githubConfig.token}`,
                    Accept: "application/vnd.github.v3+json"
                }
            });
            if (getRes.ok) {
                const getData = await getRes.json();
                sha = getData.sha;
            }
        } catch (e) {
            // File might not exist yet, which is fine
        }

        // 2. PUT (Create or Update)
        const putRes = await fetch(apiUrl, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${githubConfig.token}`,
                "Content-Type": "application/json",
                Accept: "application/vnd.github.v3+json"
            },
            body: JSON.stringify({
                message: `Update site content - ${new Date().toLocaleDateString()}`,
                content: base64Content,
                sha: sha || undefined,
                branch: githubConfig.branch || 'main'
            })
        });

        if (putRes.ok) {
            setLastSyncTime(new Date().toLocaleString());
            return { success: true, message: "Published successfully to GitHub!" };
        } else {
            const err = await putRes.json();
            return { success: false, message: `GitHub Error: ${err.message}` };
        }

    } catch (error: any) {
        return { success: false, message: `Network Error: ${error.message}` };
    }
  };

  // ADMIN: Pull fresh data from GitHub API directly
  const fetchFromGitHub = async () => {
      if (!githubConfig) return;
      setIsLoading(true);
      try {
          // Fetch raw content via API to bypass cache
          const fileName = "site-data.json";
          const apiUrl = `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/${fileName}?ref=${githubConfig.branch}`;
          
          const res = await fetch(apiUrl, {
              headers: { 
                    Authorization: `Bearer ${githubConfig.token}`,
                    Accept: "application/vnd.github.v3.raw" // Ask for raw content
                }
          });

          if (res.ok) {
               const data = await res.json();
               // Apply data (same logic as initial load)
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
      } catch (e) {
          console.error("Failed to fetch from GitHub API", e);
      } finally {
          setIsLoading(false);
      }
  };

  const updateService = (id: string, data: Service) => {
    setServices(prev => prev.map(item => item.id === id ? data : item));
  };

  const updateProject = (id: string, data: Project) => {
    setProjects(prev => prev.map(item => item.id === id ? data : item));
  };

  const updateTeamMember = (id: string, data: TeamMember) => {
    setTeam(prev => prev.map(item => item.id === id ? data : item));
  };

  const updateInsight = (id: string, data: Post) => {
    setInsights(prev => prev.map(item => item.id === id ? data : item));
  };

  const addProject = (data: Project) => {
    setProjects(prev => [data, ...prev]);
  };

  const addTeamMember = (data: TeamMember) => {
    setTeam(prev => [...prev, data]);
  };

  const addInsight = (data: Post) => {
    setInsights(prev => [data, ...prev]);
  };

  const deleteItem = (type: 'service' | 'project' | 'team' | 'insight', id: string) => {
    if (type === 'service') return; 
    if (type === 'project') setProjects(prev => prev.filter(i => i.id !== id));
    if (type === 'team') setTeam(prev => prev.filter(i => i.id !== id));
    if (type === 'insight') setInsights(prev => prev.filter(i => i.id !== id));
  };

  const resetData = () => {
    if(window.confirm("Are you sure? This will revert all data to the original code.")) {
        setServices(SERVICES);
        setProjects(PROJECTS);
        setTeam(TEAM);
        setInsights(INSIGHTS);
        localStorage.clear();
        window.location.reload();
    }
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
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};