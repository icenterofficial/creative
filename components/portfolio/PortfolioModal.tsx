
import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Tag, Monitor } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Project } from '../../types';
import ContentRenderer from '../ContentRenderer';
import ProjectGallery from './ProjectGallery';
import CaseStudy from './CaseStudy';
import LivePreviewModal from './LivePreviewModal';

interface PortfolioModalProps {
  project: Project;
  onClose: () => void;
}

const PortfolioModal: React.FC<PortfolioModalProps> = ({ project, onClose }) => {
  const { t } = useLanguage();
  const textContainerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);

  // Determine images
  const allImages = [project.image, ...(project.gallery || [])].filter(Boolean);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
       {/* Backdrop */}
       <div 
         className="absolute inset-0 bg-gray-950/95 backdrop-blur-md animate-fade-in"
         onClick={onClose}
       />

       {/* Close Button */}
       <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-50 border border-white/10"
       >
          <X size={24} />
       </button>

       {/* Modal Content */}
       <div 
            ref={modalRef} 
            className="relative w-full max-w-6xl h-full md:h-[90vh] bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-y-auto md:overflow-hidden animate-scale-up z-10 flex flex-col md:flex-row"
       >
          
          {/* --- LEFT: GALLERY SECTION --- */}
          <div className="w-full md:w-1/2 h-[350px] md:h-auto bg-black relative shrink-0">
              <ProjectGallery images={allImages} title={project.title} />
          </div>

          {/* --- RIGHT: DETAILS SECTION --- */}
          <div 
            className="w-full md:w-1/2 bg-gray-900 flex flex-col md:overflow-y-auto scrollbar-hide relative"
            ref={textContainerRef}
          >
             <div className="p-8 md:p-10 space-y-8">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                       <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                          <Tag size={12} /> {project.category}
                       </span>
                    </div>

                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight font-khmer">
                        {project.title}
                    </h3>
                    {project.client && (
                        <p className="text-gray-500 text-sm font-khmer mb-6">
                            {t('Client', 'អតិថិជន')}: <span className="text-white">{project.client}</span>
                        </p>
                    )}
                </div>

                {/* Standard Description */}
                <div>
                    <div className="text-gray-300 leading-relaxed font-khmer text-base">
                        <ContentRenderer content={t(
                            project.description || "",
                            project.description || ""
                        )} />
                    </div>
                </div>

                {/* --- ANIMATED CASE STUDY TIMELINE --- */}
                <CaseStudy 
                    challenge={project.challenge}
                    challengeKm={project.challengeKm}
                    solution={project.solution}
                    solutionKm={project.solutionKm}
                    result={project.result}
                    resultKm={project.resultKm}
                    scrollContainerRef={window.innerWidth < 768 ? modalRef : textContainerRef}
                />
             </div>

             <div className="mt-auto p-8 border-t border-white/10 bg-gray-900/50">
                 {project.link ? (
                     <div className="flex flex-col sm:flex-row gap-3">
                         <button 
                            onClick={() => setIsLivePreviewOpen(true)}
                            className="flex-1 py-4 rounded-xl bg-white text-gray-950 font-bold hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2 font-khmer shadow-lg hover:shadow-indigo-500/25"
                         >
                            <Monitor size={18} /> {t('View Live Preview', 'មើលគម្រោងផ្ទាល់')}
                         </button>
                         <a 
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-4 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center border border-white/10"
                            title="Open in new tab"
                         >
                            <ExternalLink size={18} />
                         </a>
                     </div>
                 ) : (
                     <button disabled className="w-full py-4 rounded-xl bg-white/5 text-gray-500 font-bold cursor-not-allowed flex items-center justify-center gap-2 font-khmer border border-white/5">
                        {t('No Live Link', 'មិនមានតំណភ្ជាប់')}
                     </button>
                 )}
             </div>
          </div>
       </div>

       {/* Live Preview Modal Overlay */}
       {isLivePreviewOpen && project.link && (
         <LivePreviewModal 
            url={project.link} 
            title={project.title} 
            onClose={() => setIsLivePreviewOpen(false)} 
         />
       )}
    </div>,
    document.body
  );
};

export default PortfolioModal;
