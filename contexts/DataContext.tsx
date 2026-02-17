import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { SERVICES, PROJECTS, TEAM, INSIGHTS } from '../constants';
import { Service, Project, TeamMember, Post } from '../types';
import { getSupabaseClient } from '../lib/supabase';
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

  // Helper to get Lucide Icon from string
  const getIcon = (iconName: string, defaultIcon: React.ReactNode) => {
      if (!iconName) return defaultIcon;
      const formattedName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
      const IconComponent = (LucideIcons as any)[formattedName];
      return IconComponent ? <IconComponent size={32} /> : defaultIcon;
  };

  // --- ROBUST MERGE & SORT FUNCTION ---
  const mergeAndSortData = (dbItems: any[], staticItems: any[], type: 'team' | 'project' | 'insight' | 'service') => {
      // 1. Identify items already in DB (by slug or exact ID match)
      const dbSlugs = new Set(dbItems.map(i => i.slug));
      const dbIds = new Set(dbItems.map(i => i.id));

      // 2. Filter out static items that are already in DB
      const uniqueStatic = staticItems.filter(s => {
          // If a static item has the same slug as a DB item, we assume it's the same person/item
          // and we prefer the DB version (which has the correct order_index).
          const slugMatch = s.slug && dbSlugs.has(s.slug);
          const idMatch = dbIds.has(s.id);
          return !slugMatch && !idMatch;
      });

      // 3. Combine them
      let combined = [...dbItems, ...uniqueStatic];

      // 4. SORTING LOGIC
      if (type === 'team') {
          combined.sort((a, b) => {
              // DB items have 'orderIndex'. Static items usually don't.
              // We assign a high default to static items so they appear at the end, 
              // until the user manually reorders (migrates) them.
              const idxA = (a.orderIndex !== undefined && a.orderIndex !== null) ? a.orderIndex : 9999;
              const idxB = (b.orderIndex !== undefined && b.orderIndex !== null) ? b.orderIndex : 9999;
              return idxA - idxB;
          });
      }

      return combined;
  };

  const fetchData = useCallback(async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
          setIsLoading(false);
          return;
      }

      setIsLoading(true);
      try {
        // Fetch Projects - Now includes description and link
        const { data: dbProjects } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (dbProjects) {
             const formatted = dbProjects.map((p: any) => ({
                 id: p.id,
                 title: p.title,
                 category: p.category,
                 image: p.image,
                 client: p.client,
                 slug: p.slug || slugify(p.title),
                 description: p.description, // Fetch description
                 link: p.link,             // Fetch link
             }));
             setProjects(mergeAndSortData(formatted, PROJECTS, 'project'));
        }

        // Fetch Team - CRITICAL: Order by 'order_index' ASC
        const { data: dbTeam } = await supabase.from('team').select('*').order('order_index', { ascending: true });
        if (dbTeam) {
             const formatted = dbTeam.map((t: any) => ({
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
                 orderIndex: t.order_index, // Ensure this maps correctly
                 pinCode: t.pin_code
             }));
             setTeam(mergeAndSortData(formatted, TEAM, 'team'));
        }

        // Fetch Insights
        const { data: dbInsights } = await supabase.from('insights').select('*').order('created_at', { ascending: false });
        if (dbInsights) {
             const formatted = dbInsights.map((i: any) => ({
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
             setInsights(mergeAndSortData(formatted, INSIGHTS, 'insight'));
        }

        // Fetch Services
        const { data: dbServices } = await supabase.from('services').select('*').order('created_at', { ascending: true });
        if (dbServices) {
            const formatted = dbServices.map((s: any) => ({
                id: s.id,
                title: s.title,
                titleKm: s.title_km,
                subtitle: s.subtitle,
                subtitleKm: s.subtitle_km,
                icon: getIcon(s.icon, <LucideIcons.Box size={32} />),
                _iconString: s.icon, 
                color: s.color || 'bg-indigo-500',
                link: s.link || '#',
                description: s.description,
                descriptionKm: s.description_km,
                features: s.features || [],
                featuresKm: s.features_km || [],
                slug: s.slug || slugify(s.title),
                image: s.image, 
            }));
            setServices(mergeAndSortData(formatted, SERVICES, 'service'));
        }

        setIsUsingSupabase(true);
      } catch (error) {
        console.warn("⚠️ Failed to fetch from Supabase.", error);
        setIsUsingSupabase(false);
      } finally {
        setIsLoading(false);
      }
  }, []);

  // Initial Load
  useEffect(() => {
      fetchData();
  }, [fetchData]);


  // --- ROBUST REORDER FUNCTION ---
  const updateTeamOrder = async (newOrder: TeamMember[]) => {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      // 1. Optimistic Update (Immediate Feedback)
      const optimisticOrder = newOrder.map((m, idx) => ({ ...m, orderIndex: idx }));
      setTeam(optimisticOrder);

      try {
          // UUID Regex to check if item exists in DB
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          
          for (let i = 0; i < newOrder.length; i++) {
              const member = newOrder[i];
              const newIndex = i;

              if (uuidRegex.test(member.id)) {
                  // A. EXISTING ITEM: Just update the order_index
                  await supabase.from('team').update({ order_index: newIndex }).eq('id', member.id);
              } else {
                  // B. STATIC ITEM: Must MIGRATE to DB to save position
                  // We perform an INSERT with the specific order_index
                  const { error } = await supabase.from('team').insert({
                      name: member.name,
                      role: member.role,
                      role_km: member.roleKm,
                      image: member.image,
                      bio: member.bio,
                      bio_km: member.bioKm,
                      skills: member.skills,
                      experience: member.experience,
                      socials: member.socials,
                      slug: member.slug || slugify(member.name),
                      pin_code: member.pinCode || '1111',
                      order_index: newIndex // SAVE THE EXACT POSITION
                  });

                  if (error) console.error("Error migrating static item:", error);
              }
          }

          // 2. CRITICAL STEP: RELOAD DATA
          await fetchData();

      } catch (err) {
          console.error("Failed to save order:", err);
          alert("Failed to save order. Please check your connection.");
          fetchData(); // Revert on error
      }
  };

  // Placeholders for other actions
  const showAlert = () => alert("Please use the Admin Dashboard.");
  const updateService = () => showAlert();
  const updateProject = () => showAlert();
  const updateTeamMember = () => showAlert();
  const updateInsight = () => showAlert();
  const addProject = () => showAlert();
  const addTeamMember = () => showAlert();
  const addInsight = () => showAlert();
  const deleteItem = () => showAlert();
  
  const resetData = () => {
     if(window.confirm("Reset to default local data?")) {
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
