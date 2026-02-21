
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { X, ArrowRight } from 'lucide-react';
import { Project } from '../types';
import ScrollBackgroundText from './ScrollBackgroundText';
import RevealOnScroll from './RevealOnScroll';
import { useRouter } from '../hooks/useRouter';
import { hapticMedium, hapticTap } from '../utils/haptic';

// Sub-components
import PortfolioFilters from './portfolio/PortfolioFilters';
import PortfolioCard from './portfolio/PortfolioCard';
import PortfolioModal from './portfolio/PortfolioModal';
import SkeletonCard from './SkeletonCard';

const Portfolio: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [isFilteringLoading, setIsFilteringLoading] = useState(false);
  const { t } = useLanguage();
  const { projects = [] } = useData();

  // Use Router Hook: Section 'portfolio'
  const { activeId, openItem, closeItem } = useRouter('portfolio');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  // Create Categories List
  const uniqueCategories: string[] = Array.from(new Set((projects || []).map(p => p.category))).sort();
  const categories = [
      { id: 'all', label: t('All Work', 'ទាំងអស់') },
      ...uniqueCategories.map(cat => ({ 
          id: cat, 
          label: cat.charAt(0).toUpperCase() + cat.slice(1) 
      }))
  ];

  const filteredProjects = (projects || []).filter(p => filter === 'all' || p.category === filter);

  // Sync Router Active ID with Data
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

  // Handle filter change with loading state and haptic feedback
  const handleFilterChange = (newFilter: string) => {
    hapticMedium(); // Haptic feedback on filter change
    setFilter(newFilter);
    
    // Simulate loading state for better UX
    setIsFilteringLoading(true);
    setTimeout(() => {
      setIsFilteringLoading(false);
    }, 300);
  };

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
            
            {/* Filters */}
            <RevealOnScroll variant="slide-left" delay={200}>
              <PortfolioFilters 
                categories={categories} 
                currentFilter={filter} 
                onFilterChange={handleFilterChange}
              />
            </RevealOnScroll>
        </div>

        {/* Masonry Grid with Skeleton Loading */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {isFilteringLoading ? (
            // Show skeleton cards while filtering
            <SkeletonCard count={6} className="break-inside-avoid" />
          ) : (
            // Show actual portfolio cards
            filteredProjects.slice(0, 6).map((project, index) => (
              <PortfolioCard 
                  key={project.id} 
                  project={project} 
                  index={index} 
                  onClick={() => {
                    hapticTap();
                    openItem(project.slug || project.id);
                  }}
              />
            ))
          )}
        </div>
        
        <RevealOnScroll variant="fade-up" delay={400}>
          <div className="text-center mt-20">
             <button 
                onClick={() => {
                  hapticTap();
                  setIsViewAllOpen(true);
                }}
                className="px-10 py-4 rounded-full border border-white/20 text-white font-bold hover:bg-white hover:text-gray-950 transition-all duration-300 font-khmer flex items-center gap-2 mx-auto active:scale-95"
             >
               {t('View All Projects', 'មើលគម្រោងទាំងអស់')} <ArrowRight size={18} />
             </button>
          </div>
        </RevealOnScroll>
      </div>

      {/* View All Projects Modal (Keep this simple here or separate if needed) */}
      {isViewAllOpen && createPortal(
         <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-gray-950/95 backdrop-blur-md animate-fade-in"
                onClick={() => {
                  hapticTap();
                  setIsViewAllOpen(false);
                }}
            />
             <div className="relative w-full max-w-7xl h-full md:h-[90vh] bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scale-up flex flex-col">
                <div className="flex justify-between items-center p-6 md:p-8 border-b border-white/10 bg-gray-900 z-10">
                    <div>
                        <h3 className="text-2xl font-bold text-white font-khmer">{t('All Projects', 'គម្រោងទាំងអស់')}</h3>
                        <p className="text-gray-400 text-sm font-khmer">{t('Browse our complete portfolio', 'មើលផលប័ត្រពេញលេញរបស់យើង')}</p>
                    </div>
                    <button 
                        onClick={() => {
                          hapticTap();
                          setIsViewAllOpen(false);
                        }}
                        className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/5 active:scale-95"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-hide">
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {(projects || []).map((project) => (
                             <div 
                                key={project.id} 
                                onClick={() => {
                                  hapticTap();
                                  openItem(project.slug || project.id);
                                }}
                                className="group relative rounded-xl overflow-hidden break-inside-avoid bg-gray-800 border border-white/5 hover:border-indigo-500/30 transition-all duration-300 cursor-pointer active:scale-95"
                            >
                                <img 
                                    src={project.image} 
                                    alt={project.title} 
                                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gray-950/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                                    <h4 className="text-white text-lg font-bold font-khmer">{project.title}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
         </div>,
         document.body
      )}

      {/* Main Project Detail Modal */}
      {selectedProject && (
          <PortfolioModal 
            project={selectedProject} 
            onClose={closeItem} 
          />
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
