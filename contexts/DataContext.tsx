
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { SERVICES, PROJECTS, TEAM, INSIGHTS, JOBS, PARTNERS } from '../constants';
import { Service, Project, TeamMember, Post, Job, Partner } from '../types';
import { getSupabaseClient } from '../lib/supabase';
import * as LucideIcons from 'lucide-react';
import { slugify } from '../utils/format';

interface DataContextType {
  services: Service[];
  projects: Project[];
  team: TeamMember[];
  insights: Post[];
  jobs: Job[];
  partners: Partner[];
  isLoading: boolean;
  isUsingSupabase: boolean;
  
  // Actions
  refreshData: () => Promise<void>; // Exposed for AdminDashboard
  
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
  const [jobs, setJobs] = useState<Job[]>(JOBS);
  const [partners, setPartners] = useState<Partner[]>(PARTNERS);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingSupabase, setIsUsingSupabase] = useState(false);

  // Helper to get Lucide Icon from string
  const getIcon = (iconName: string, defaultIcon: React.ReactNode) => {
      if (!iconName) return defaultIcon;
      const formattedName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
      const IconComponent = (LucideIcons as any)[formattedName];
      return IconComponent ? <IconComponent size={24} /> : defaultIcon;
  };

  const fetchData = useCallback(async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
          setIsLoading(false);
          return;
      }

      setIsLoading(true);
      try {
        // Fetch Projects - Now includes description, link, created_by AND gallery
        const { data: dbProjects } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (dbProjects) {
             const formatted = dbProjects.map((p: any) => {
                 // --- FIX FOR GALLERY COUNT ISSUE ---
                 // If database column is 'text', Supabase returns a JSON string.
                 // We must parse it to an Array to get the correct length (count of images),
                 // otherwise .length will count the characters in the string (e.g. 203 chars).
                 let galleryData = p.gallery || [];
                 if (typeof galleryData === 'string') {
                     try {
                         // Parse "['url1', 'url2']" string into actual Array
                         galleryData = JSON.parse(galleryData);
                     } catch (e) {
                         console.warn("Failed to parse gallery JSON", e);
                         galleryData = [];
                     }
                 }

                 return {
                     id: p.id,
                     title: p.title,
                     category: p.category,
                     image: p.image,
                     gallery: Array.isArray(galleryData) ? galleryData : [], // Ensure it is an array
                     client: p.client,
                     slug: p.slug || slugify(p.title),
                     description: p.description, 
                     link: p.link,
                     createdBy: p.created_by,
                     // Map Case Study Fields
                     challenge: p.challenge,
                     challengeKm: p.challenge_km,
                     solution: p.solution,
                     solutionKm: p.solution_km,
                     result: p.result,
                     resultKm: p.result_km
                 };
             });
             // STRICT MODE: Use only DB data
             setProjects(formatted);
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
             // STRICT MODE: Use only DB data
             setTeam(formatted);
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
             // STRICT MODE: Use only DB data
             setInsights(formatted);
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
            // STRICT MODE: Use only DB data
            setServices(formatted);
        }

        // Fetch Jobs
        const { data: dbJobs } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
        if (dbJobs) {
            const formatted = dbJobs.map((j: any) => ({
                id: j.id,
                title: j.title,
                type: j.type,
                location: j.location,
                department: j.department,
                description: j.description,
                link: j.link,
                icon: getIcon(j.icon, <LucideIcons.Briefcase size={24} />),
                _iconString: j.icon,
                slug: j.slug || slugify(j.title)
            }));
            // STRICT MODE: Use only DB data
            setJobs(formatted);
        }

        // Fetch Partners
        const { data: dbPartners } = await supabase.from('partners').select('*').order('created_at', { ascending: true });
        if (dbPartners && dbPartners.length > 0) {
            const formatted = dbPartners.map((p: any) => ({
                id: p.id,
                name: p.name,
                icon: getIcon(p.icon, <LucideIcons.Building2 size={32} />),
                _iconString: p.icon,
                image: p.image
            }));
            setPartners(formatted);
        }

        setIsUsingSupabase(true);
      } catch (error) {
        console.warn("⚠️ Failed to fetch from Supabase.", error);
        setIsUsingSupabase(false);
        // On error, we rely on the initial state (Static Constants)
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
                  // Note: Since we disabled merging, this branch might not be hit often unless mixed
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
         setServices(SERVICES); setProjects(PROJECTS); setTeam(TEAM); setInsights(INSIGHTS); setJobs(JOBS); setPartners(PARTNERS);
     }
  };

  return (
    <DataContext.Provider value={{
      services, projects, team, insights, jobs, partners, isLoading, isUsingSupabase,
      refreshData: fetchData, // Expose fetchData
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
