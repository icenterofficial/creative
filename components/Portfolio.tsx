
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { X, ExternalLink, Tag, ArrowRight, Target, Zap, TrendingUp, ChevronDown } from 'lucide-react';
import { Project } from '../types';
import ScrollBackgroundText from './ScrollBackgroundText';
import RevealOnScroll from './RevealOnScroll';
import { useRouter } from '../hooks/useRouter';
import ContentRenderer from './ContentRenderer';

const Portfolio: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const { t } = useLanguage();
  const { projects = [] } = useData();

  // Use Router Hook: Section 'portfolio', No Prefix needed if using slugs
  const { activeId, openItem, closeItem } = useRouter('portfolio');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  // Extract unique categories from projects for the filter list
  const uniqueCategories: string[] = Array.from(new Set((projects || []).map(p => p.category))).sort();
  
  // Create category list with "All" + Dynamic Categories (mapped to labels if possible, else capitalize)
  const categories = [
      { id: 'all', label: t('All Work', 'ទាំងអស់') },
      ...uniqueCategories.map(cat => ({ 
          id: cat, 
          label: cat.charAt(0).toUpperCase() + cat.slice(1) // Simple capitalization 
      }))
  ];

  const filteredProjects = (projects || []).filter(p => filter === 'all' || p.category === filter);

  // Sync Router Active ID with Data (Support finding by ID or Slug)
  useEffect(() => {
      if (activeId && projects) {
          const found = projects.find(p => p.slug === activeId || p.id === activeId);
          setSelectedProject(found || null);
      } else {
          setSelectedProject(null);
      }
  }, [activeId, projects]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedProject || isViewAllOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProject, isViewAllOpen]);

  return (
    <section id="portfolio" className="py-24 bg-gray-900/50 relative overflow-hidden">
      {/* Background Text */}
      <ScrollBackgroundText text="PROJECTS" className="top-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
             <RevealOnScroll variant="slide-right">
               <div className="max-w-2xl">
                  <span className="text-indigo-400 font-bold tracking-wider uppercase text-sm mb-4 block font-khmer">{t('Selected Works', 'ស្នាដៃជ្រើសរើស')}</span>
                  <h2 className="text-4xl md:text-5xl font-bold text-white font-khmer">
                      {t('A Showcase of', 'បង្ហាញ')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{t('Excellence', 'ឧត្តមភាព')}</span>
                  </h2>
              </div>
             </RevealOnScroll>
            
            {/* Minimalist Filters */}
            <RevealOnScroll variant="slide-left" delay={200}>
              <div className="flex flex-wrap justify-start md:justify-end gap-2">
              {categories.map((cat) => (
                  <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-300 border font-khmer ${
                      filter === cat.id 
                      ? 'bg-white text-gray-950 border-white' 
                      : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                  >
                  {cat.label}
                  </button>
              ))}
              </div>
            </RevealOnScroll>
        </div>

        {/* Masonry Grid with Tailwind Columns and Staggered Animation */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {filteredProjects.slice(0, 6).map((project, index) => (
            <RevealOnScroll key={project.id} delay={index * 100} variant="zoom-in" duration={600}>
              <div 
                onClick={() => openItem(project.slug || project.id)}
                className="group relative rounded-2xl overflow-hidden break-inside-avoid bg-gray-800 transition-transform duration-500 hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl hover:shadow-indigo-500/20 cursor-pointer"
              >
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Premium Overlay */}
                <div className="absolute inset-0 bg-gray-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6 backdrop-blur-[2px]">
                   <div className="flex justify-end translate-y-[-10px] group-hover:translate-y-0 transition-transform duration-300">
                      <div className="h-10 w-10 rounded-full bg-white text-gray-950 flex items-center justify-center">
                           <span className="text-xl">↗</span>
                      </div>
                   </div>
                   
                   <div className="translate-y-[10px] group-hover:translate-y-0 transition-transform duration-300">
                      <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2 block">{project.category}</span>
                      <h3 className="text-white text-2xl font-bold">{project.title}</h3>
                   </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
        
        <RevealOnScroll variant="fade-up" delay={400}>
          <div className="text-center mt-20">
             <button 
                onClick={() => setIsViewAllOpen(true)}
                className="px-10 py-4 rounded-full border border-white/20 text-white font-bold hover:bg-white hover:text-gray-950 transition-all duration-300 font-khmer flex items-center gap-2 mx-auto"
             >
               {t('View All Projects', 'មើលគម្រោងទាំងអស់')} <ArrowRight size={18} />
             </button>
          </div>
        </RevealOnScroll>
      </div>

      {/* View All Projects Modal */}
      {isViewAllOpen && createPortal(
         <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-gray-950/95 backdrop-blur-md animate-fade-in"
                onClick={() => setIsViewAllOpen(false)}
            />
             <div className="relative w-full max-w-7xl h-full md:h-[90vh] bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scale-up flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 md:p-8 border-b border-white/10 bg-gray-900 z-10">
                    <div>
                        <h3 className="text-2xl font-bold text-white font-khmer">{t('All Projects', 'គម្រោងទាំងអស់')}</h3>
                        <p className="text-gray-400 text-sm font-khmer">{t('Browse our complete portfolio', 'មើលផលប័ត្រពេញលេញរបស់យើង')}</p>
                    </div>
                    <button 
                        onClick={() => setIsViewAllOpen(false)}
                        className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/5"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Grid Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-hide">
                    {/* Optional: Add filters here if needed, for now showing all sorted by date (implicitly) */}
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {(projects || []).map((project) => (
                             <div 
                                key={project.id} 
                                onClick={() => openItem(project.slug || project.id)}
                                className="group relative rounded-xl overflow-hidden break-inside-avoid bg-gray-800 border border-white/5 hover:border-indigo-500/30 transition-all duration-300 cursor-pointer"
                            >
                                <img 
                                    src={project.image} 
                                    alt={project.title} 
                                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gray-950/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                                    <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-2 px-2 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">{project.category}</span>
                                    <h4 className="text-white text-lg font-bold font-khmer">{project.title}</h4>
                                    <span className="mt-4 text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 border-b border-gray-600 pb-0.5 group-hover:border-white group-hover:text-white transition-colors">
                                        View Details <ArrowRight size={12} />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
         </div>,
         document.body
      )}

      {/* Project Detail Modal */}
      {selectedProject && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-gray-950/95 backdrop-blur-md animate-fade-in"
             onClick={closeItem}
           />

           {/* Close Button - Fixed Position */}
           <button 
              onClick={closeItem}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-50 border border-white/10"
           >
              <X size={24} />
           </button>

           {/* Modal Content */}
           <div className="relative w-full max-w-6xl h-full md:h-[90vh] bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scale-up z-10 flex flex-col md:flex-row">
              
              {/* Image Section */}
              <div className="w-full md:w-1/2 h-[300px] md:h-auto bg-gray-900 relative overflow-hidden flex items-center justify-center shrink-0">
                  <img 
                    src={selectedProject.image} 
                    alt={selectedProject.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-50 md:hidden" />
              </div>

              {/* Details Section */}
              <div className="w-full md:w-1/2 bg-gray-900 flex flex-col overflow-y-auto">
                 <div className="p-8 md:p-10 space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                           <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                              <Tag size={12} /> {selectedProject.category}
                           </span>
                        </div>

                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight font-khmer">
                            {selectedProject.title}
                        </h3>
                        {selectedProject.client && (
                            <p className="text-gray-500 text-sm font-khmer mb-6">
                                {t('Client', 'អតិថិជន')}: <span className="text-white">{selectedProject.client}</span>
                            </p>
                        )}
                    </div>

                    {/* Standard Description */}
                    <div>
                        <div className="text-gray-300 leading-relaxed font-khmer text-base">
                            <ContentRenderer content={t(
                                selectedProject.description || "",
                                selectedProject.description || ""
                            )} />
                        </div>
                    </div>

                    {/* --- VERTICAL TIMELINE CASE STUDY SECTION --- */}
                    {(selectedProject.challenge || selectedProject.solution || selectedProject.result) && (
                        <div className="relative pl-8 md:pl-10 border-l-2 border-white/5 space-y-12 py-4">
                            {/* 1. Challenge */}
                            {(selectedProject.challenge || selectedProject.challengeKm) && (
                                <RevealOnScroll variant="slide-right">
                                    <div className="relative group">
                                        <div className="absolute -left-[45px] md:-left-[53px] top-0 p-2 rounded-xl bg-gray-900 border-2 border-red-500/30 text-red-400 shadow-lg shadow-red-500/10 z-10 group-hover:border-red-500 group-hover:text-red-500 transition-colors">
                                            <Target size={20} />
                                        </div>
                                        <h5 className="text-lg font-bold text-white mb-2 font-khmer flex items-center gap-2">
                                            {t('The Challenge', 'បញ្ហាប្រឈម')}
                                        </h5>
                                        <p className="text-gray-400 text-sm md:text-base leading-relaxed font-khmer bg-white/5 p-4 rounded-xl border border-white/5">
                                            {t(selectedProject.challenge!, selectedProject.challengeKm || selectedProject.challenge!)}
                                        </p>
                                    </div>
                                </RevealOnScroll>
                            )}

                            {/* 2. Solution */}
                            {(selectedProject.solution || selectedProject.solutionKm) && (
                                <RevealOnScroll variant="slide-right" delay={100}>
                                    <div className="relative group">
                                        <div className="absolute -left-[45px] md:-left-[53px] top-0 p-2 rounded-xl bg-gray-900 border-2 border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/10 z-10 group-hover:border-blue-500 group-hover:text-blue-500 transition-colors">
                                            <Zap size={20} />
                                        </div>
                                        <h5 className="text-lg font-bold text-white mb-2 font-khmer flex items-center gap-2">
                                            {t('The Solution', 'ដំណោះស្រាយ')}
                                        </h5>
                                        <p className="text-gray-400 text-sm md:text-base leading-relaxed font-khmer bg-white/5 p-4 rounded-xl border border-white/5">
                                            {t(selectedProject.solution!, selectedProject.solutionKm || selectedProject.solution!)}
                                        </p>
                                    </div>
                                </RevealOnScroll>
                            )}

                            {/* 3. Result */}
                            {(selectedProject.result || selectedProject.resultKm) && (
                                <RevealOnScroll variant="slide-right" delay={200}>
                                    <div className="relative group">
                                        <div className="absolute -left-[45px] md:-left-[53px] top-0 p-2 rounded-xl bg-gray-900 border-2 border-green-500/30 text-green-400 shadow-lg shadow-green-500/10 z-10 group-hover:border-green-500 group-hover:text-green-500 transition-colors">
                                            <TrendingUp size={20} />
                                        </div>
                                        <h5 className="text-lg font-bold text-white mb-2 font-khmer flex items-center gap-2">
                                            {t('The Result', 'លទ្ធផល')}
                                        </h5>
                                        <p className="text-gray-400 text-sm md:text-base leading-relaxed font-khmer bg-white/5 p-4 rounded-xl border border-white/5">
                                            {t(selectedProject.result!, selectedProject.resultKm || selectedProject.result!)}
                                        </p>
                                    </div>
                                </RevealOnScroll>
                            )}
                        </div>
                    )}
                 </div>

                 <div className="mt-auto p-8 border-t border-white/10 bg-gray-900/50">
                     {selectedProject.link ? (
                         <a 
                            href={selectedProject.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-4 rounded-xl bg-white text-gray-950 font-bold hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2 font-khmer shadow-lg hover:shadow-indigo-500/25"
                         >
                            {t('View Live Project', 'មើលគម្រោងផ្ទាល់')} <ExternalLink size={18} />
                         </a>
                     ) : (
                         <button disabled className="w-full py-4 rounded-xl bg-white/5 text-gray-500 font-bold cursor-not-allowed flex items-center justify-center gap-2 font-khmer border border-white/5">
                            {t('No Live Link', 'មិនមានតំណភ្ជាប់')}
                         </button>
                     )}
                 </div>
              </div>
           </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-scale-up {
          animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </section>
  );
};

export default Portfolio;
