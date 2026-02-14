import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SERVICES, PROJECTS, TEAM, INSIGHTS } from '../constants';
import { Service, Project, TeamMember, Post } from '../types';
import { getSupabaseClient } from '../lib/supabase';
import { Database } from 'lucide-react';
import { slugify } from '../utils/format';

interface DataContextType {
  services: Service[];
  projects: Project[];
  team: TeamMember[];
  insights: Post[];
  isLoading: boolean;
  isUsingSupabase: boolean;
  
  // Kept for compatibility
  updateService: (id: string, data: Service) => void;
  updateProject: (id: string, data: Project) => void;
  updateTeamMember: (id: string, data: TeamMember) => void;
  updateInsight: (id: string, data: Post) => void;
  addProject: (data: Project) => void;
  addTeamMember: (data: TeamMember) => void;
  addInsight: (data: Post) => void;
  deleteItem: (type: 'service' | 'project' | 'team' | 'insight', id: string) => void;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with Constants (Fallback Data)
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [team, setTeam] = useState<TeamMember[]>(TEAM);
  const [insights, setInsights] = useState<Post[]>(INSIGHTS);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingSupabase, setIsUsingSupabase] = useState(false);

  // Load Data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
          setIsLoading(false);
          return; // Use local data if no credentials
      }

      setIsLoading(true);
      try {
        // 1. Fetch Projects
        const { data: dbProjects } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (dbProjects && dbProjects.length > 0) {
             setProjects(dbProjects.map((p: any) => ({
                 id: p.id,
                 title: p.title,
                 category: p.category,
                 image: p.image,
                 client: p.client,
                 slug: p.slug || slugify(p.title) // Fallback slug generation
             })));
        }

        // 2. Fetch Team
        const { data: dbTeam } = await supabase.from('team').select('*').order('created_at', { ascending: true });
        if (dbTeam && dbTeam.length > 0) {
             setTeam(dbTeam.map((t: any) => ({
                 id: t.id,
                 name: t.name,
                 role: t.role,
                 roleKm: t.role_km,
                 image: t.image,
                 bio: t.bio,
                 bioKm: t.bio_km,
                 skills: t.skills || [],
                 experience: t.experience || [],
                 experienceKm: t.experience || [], // Fallback
                 socials: t.socials || {},
                 slug: t.slug || slugify(t.name) // Fallback slug generation
             })));
        }

        // 3. Fetch Insights
        const { data: dbInsights } = await supabase.from('insights').select('*').order('created_at', { ascending: false });
        if (dbInsights && dbInsights.length > 0) {
             setInsights(dbInsights.map((i: any) => ({
                 id: i.id,
                 title: i.title,
                 titleKm: i.title_km,
                 excerpt: i.excerpt,
                 date: i.date,
                 category: i.category,
                 image: i.image,
                 authorId: i.author_id,
                 link: i.link || '#',
                 content: i.content,
                 comments: [],
                 slug: i.slug || slugify(i.title) // Fallback slug generation
             })));
        }

        setIsUsingSupabase(true);
      } catch (error) {
        console.warn("⚠️ Failed to fetch from Supabase. Falling back to local data.", error);
        setIsUsingSupabase(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const showAlert = () => {
      alert("Content is managed via Supabase. Please use the Admin Dashboard.");
  };

  const updateService = () => showAlert();
  const updateProject = () => showAlert();
  const updateTeamMember = () => showAlert();
  const updateInsight = () => showAlert();
  const addProject = () => showAlert();
  const addTeamMember = () => showAlert();
  const addInsight = () => showAlert();
  const deleteItem = () => showAlert();
  
  const resetData = () => {
     if(window.confirm("Reload default local data?")) {
         setServices(SERVICES); setProjects(PROJECTS); setTeam(TEAM); setInsights(INSIGHTS);
     }
  };

  return (
    <DataContext.Provider value={{
      services, projects, team, insights, isLoading, isUsingSupabase,
      updateService, updateProject, updateTeamMember, updateInsight,
      addProject, addTeamMember, addInsight, deleteItem,
      resetData
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
