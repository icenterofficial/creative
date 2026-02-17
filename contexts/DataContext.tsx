import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SERVICES, PROJECTS, TEAM, INSIGHTS } from '../constants';
import { Service, Project, TeamMember, Post } from '../types';
import { getSupabaseClient } from '../lib/supabase';
import { Database } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
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
  updateTeamOrder: (newOrder: TeamMember[]) => Promise<void>;
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

  // Helper function to merge DB data with Static data without duplicates AND SORT THEM
  const mergeData = (dbItems: any[], staticItems: any[], type: 'team' | 'project' | 'insight' | 'service') => {
      const dbIds = new Set(dbItems.map(i => i.id));
      const dbSlugs = new Set(dbItems.map(i => i.slug));
      
      // For Team, Projects, and Services check Names/Titles to prevent duplication 
      const dbNames = new Set(dbItems.map(i => (i.name || i.title || '').toLowerCase().trim()));

      const filteredStatic = staticItems.filter(staticItem => {
          const idExists = dbIds.has(staticItem.id);
          const slugExists = staticItem.slug && dbSlugs.has(staticItem.slug);
          const nameExists = dbNames.has((staticItem.name || staticItem.title || '').toLowerCase().trim());
          
          return !idExists && !slugExists && !nameExists;
      });

      // Combine DB and Static items
      const combined = [...dbItems, ...filteredStatic];

      // Perform Sort if 'orderIndex' is present (Specifically for Team)
      if (type === 'team') {
          return combined.sort((a, b) => {
              // Get orderIndex, default to a high number if undefined so static items go to bottom by default
              // unless specifically reordered in a way that gives them an index
              const indexA = typeof a.orderIndex === 'number' ? a.orderIndex : 9999;
              const indexB = typeof b.orderIndex === 'number' ? b.orderIndex : 9999;
              
              if (indexA === indexB) {
                  // If indices are equal (e.g. both 9999 or both 0), sort by creation or fallback to name
                  // For DB items, we can use created_at if available, but for mixed types, keep it simple.
                  return 0; 
              }
              return indexA - indexB;
          });
      }

      return combined;
  };

  // Helper to get Lucide Icon from string
  const getIcon = (iconName: string, defaultIcon: React.ReactNode) => {
      if (!iconName) return defaultIcon;
      // Capitalize first letter just in case
      const formattedName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
      const IconComponent = (LucideIcons as any)[formattedName];
      return IconComponent ? <IconComponent size={32} /> : defaultIcon;
  };

  // Load Data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
          setIsLoading(false);
          return;
      }

      setIsLoading(true);
      try {
        // 1. Fetch Projects
        const { data: dbProjects } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (dbProjects) {
             const formattedProjects = dbProjects.map((p: any) => ({
                 id: p.id,
                 title: p.title,
                 category: p.category,
                 image: p.image,
                 client: p.client,
                 slug: p.slug || slugify(p.title)
             }));
             setProjects(mergeData(formattedProjects, PROJECTS, 'project'));
        }

        // 2. Fetch Team - Ordered by order_index
        const { data: dbTeam } = await supabase.from('team').select('*').order('order_index', { ascending: true });
        if (dbTeam) {
             const formattedTeam = dbTeam.map((t: any) => ({
                 id: t.id,
                 name: t.name,
                 role: t.role,
                 roleKm: t.role_km,
                 image: t.image,
                 bio: t.bio,
                 bioKm: t.bio_km,
                 skills: t.skills || [],
                 experience: t.experience || [],
                 experienceKm: t.experience || [],
                 socials: t.socials || {},
                 slug: t.slug || slugify(t.name),
                 orderIndex: t.order_index,
                 pinCode: t.pin_code
             }));
             setTeam(mergeData(formattedTeam, TEAM, 'team'));
        }

        // 3. Fetch Insights
        const { data: dbInsights } = await supabase.from('insights').select('*').order('created_at', { ascending: false });
        if (dbInsights) {
             const formattedInsights = dbInsights.map((i: any) => ({
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
                 slug: i.slug || slugify(i.title)
             }));
             setInsights(mergeData(formattedInsights, INSIGHTS, 'insight'));
        }

        // 4. Fetch Services
        const { data: dbServices } = await supabase.from('services').select('*').order('created_at', { ascending: true });
        if (dbServices) {
            const formattedServices = dbServices.map((s: any) => ({
                id: s.id,
                title: s.title,
                titleKm: s.title_km,
                subtitle: s.subtitle,
                subtitleKm: s.subtitle_km,
                // If icon is stored as string in DB, convert to component. If not, fallback.
                icon: getIcon(s.icon, <LucideIcons.Box size={32} />),
                // Keep the string version as a property for the editor if needed, but 'icon' in type is Node
                _iconString: s.icon, 
                color: s.color || 'bg-indigo-500',
                link: s.link || '#',
                description: s.description,
                descriptionKm: s.description_km,
                features: s.features || [],
                featuresKm: s.features_km || [],
                slug: s.slug || slugify(s.title)
            }));
            setServices(mergeData(formattedServices, SERVICES, 'service'));
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

  const updateTeamOrder = async (newOrder: TeamMember[]) => {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      // Optimistic update - Important: Update the indices in the local state too
      const updatedLocalOrder = newOrder.map((m, idx) => ({ ...m, orderIndex: idx }));
      setTeam(updatedLocalOrder);

      try {
          // Prepare updates
          // WARNING: Only items that exist in the DB (have UUIDs) can be updated.
          // Static items (e.g. 't1', 't2') cannot be reordered in the DB.
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          
          const updates = newOrder
            .map((member, index) => ({
                id: member.id,
                order_index: index,
            }))
            .filter(u => uuidRegex.test(u.id)); // Only update valid UUIDs

          if (updates.length < newOrder.length) {
              console.warn("Some items are static (local only) and their order cannot be saved to the database. Please 'Edit' and 'Save' them to migrate to Supabase.");
          }

          for (const update of updates) {
              await supabase.from('team').update({ order_index: update.order_index }).eq('id', update.id);
          }
      } catch (err) {
          console.error("Failed to reorder team", err);
          alert("Failed to save team order");
      }
  };

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
      updateTeamOrder,
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
