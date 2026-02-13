import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { X, ExternalLink, Tag } from 'lucide-react';
import { Project } from '../types';
import ScrollBackgroundText from './ScrollBackgroundText';
import RevealOnScroll from './RevealOnScroll';

const Portfolio: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { t } = useLanguage();
  const { projects } = useData();

  const categories = [
    { id: 'all', label: t('All Work', 'ទាំងអស់') },
    { id: 'graphicdesign', label: t('Graphic', 'ក្រាហ្វិក') },
    { id: 'webapp', label: t('Development', 'អភិវឌ្ឍន៍') },
    { id: 'architecture', label: t('Architecture', 'ស្ថាបត្យកម្ម') },
    { id: 'mvac', label: t('MVAC', 'ម៉ាស៊ីនត្រជាក់') },
    { id: 'arabiccalligraphy', label: t('Calligraphy', 'អក្សរផ្ចង់') },
  ];

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProject]);

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
          {filteredProjects.map((project, index) => (
            <RevealOnScroll key={project.id} delay={index * 100} variant="zoom-in" duration={600}>
              <div 
                onClick={() => setSelectedProject(project)}
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
             <button className="px-10 py-4 rounded-full border border-white/20 text-white font-bold hover:bg-white hover:text-gray-950 transition-all duration-300 font-khmer">
               {t('Load More Projects', 'មើលគម្រោងបន្ថែម')}
             </button>
          </div>
        </RevealOnScroll>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-gray-950/95 backdrop-blur-md animate-fade-in"
             onClick={() => setSelectedProject(null)}
           />

           {/* Close Button - Fixed Position */}
           <button 
              onClick={() => setSelectedProject(null)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-50 border border-white/10"
           >
              <X size={24} />
           </button>

           {/* Modal Content */}
           <div className="relative w-full max-w-5xl h-auto max-h-[90vh] bg-transparent rounded-3xl overflow-hidden animate-scale-up z-10 flex flex-col md:flex-row shadow-2xl border border-white/5">
              
              {/* Image Section */}
              <div className="w-full md:w-2/3 h-[50vh] md:h-auto bg-gray-900 relative overflow-hidden flex items-center justify-center">
                  <img 
                    src={selectedProject.image} 
                    alt={selectedProject.title} 
                    className="w-full h-full object-contain md:object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-50 md:hidden" />
              </div>

              {/* Details Section */}
              <div className="w-full md:w-1/3 bg-gray-900/90 backdrop-blur-xl border-l border-white/10 p-8 flex flex-col justify-between overflow-y-auto">
                 <div>
                    <div className="flex items-center gap-2 mb-4">
                       <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                          <Tag size={12} /> {selectedProject.category}
                       </span>
                    </div>

                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight font-khmer">
                        {selectedProject.title}
                    </h3>

                    <div className="space-y-6">
                        {selectedProject.client && (
                            <div>
                                <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 font-khmer">{t('Client', 'អតិថិជន')}</h4>
                                <p className="text-white text-lg font-khmer">{selectedProject.client}</p>
                            </div>
                        )}
                        
                        <div>
                            <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 font-khmer">{t('Description', 'ការពិពណ៌នា')}</h4>
                            <p className="text-gray-400 leading-relaxed font-khmer">
                                {t(
                                    "A masterfully crafted project demonstrating our commitment to quality and innovation. Every detail has been meticulously designed to meet the client's vision.",
                                    "គម្រោងដែលបានបង្កើតឡើងដោយប៉ិនប្រសប់ បង្ហាញពីការប្តេជ្ញាចិត្តរបស់យើងចំពោះគុណភាព និងការច្នៃប្រឌិត។ រាល់ព័ត៌មានលម្អិតត្រូវបានរចនាឡើងយ៉ាងយកចិត្តទុកដាក់ ដើម្បីបំពេញតាមចក្ខុវិស័យរបស់អតិថិជន។"
                                )}
                            </p>
                        </div>
                    </div>
                 </div>

                 <div className="mt-8 pt-8 border-t border-white/10">
                     <button className="w-full py-4 rounded-xl bg-white text-gray-950 font-bold hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2 font-khmer">
                        {t('View Live Project', 'មើលគម្រោងផ្ទាល់')} <ExternalLink size={18} />
                     </button>
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