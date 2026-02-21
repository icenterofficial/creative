import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Tag, Monitor, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Project } from '../../types';
import ContentRenderer from '../ContentRenderer';
import ProjectGallery from './ProjectGallery';
import CaseStudy from './CaseStudy';
import LivePreviewModal from './LivePreviewModal';

interface PortfolioModalProps {
  project: Project;
  onClose: () => void;
  usePathRouting?: boolean;
}

const PortfolioModal: React.FC<PortfolioModalProps> = ({ project, onClose, usePathRouting = false }) => {
  const { t } = useLanguage();
  const textContainerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);

  const allImages = [project.image, ...(project.gallery || [])].filter(Boolean);

  const handleClose = () => {
    if (usePathRouting) {
      const currentLang = window.location.pathname.split('/')[1];
      const supportedLangs = ['en', 'km', 'fr', 'ja', 'ko', 'de', 'zh-CN', 'es', 'ar'];
      const langPrefix = currentLang && supportedLangs.includes(currentLang) ? `/${currentLang}` : '';
      window.history.replaceState(null, '', `${langPrefix}/portfolio`);
      window.dispatchEvent(new Event('popstate'));
    }
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-gray-950/95 backdrop-blur-md animate-fade-in" onClick={handleClose} />
       <button onClick={handleClose} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-50 border border-white/10 active:scale-95">
          <X size={24} />
       </button>

       <div ref={modalRef} className="relative w-full max-w-6xl h-full md:h-[90vh] bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-y-auto md:overflow-hidden animate-scale-up z-10 flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 h-[350px] md:h-auto bg-black relative shrink-0">
              <ProjectGallery images={allImages} title={project.title} />
          </div>

          <div className="w-full md:w-1/2 flex flex-col bg-gray-900">
            <div className="p-8 md:p-12 pb-6 border-b border-white/5">
                <div className="flex flex-wrap gap-3 mb-6">
                    <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold tracking-wider uppercase flex items-center gap-2 border border-indigo-500/20">
                        <Tag size={12} /> {project.category}
                    </span>
                    {project.liveUrl && (
                        <button onClick={() => setIsLivePreviewOpen(true)} className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold tracking-wider uppercase flex items-center gap-2 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                            <Monitor size={12} /> Live Preview
                        </button>
                    )}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-khmer leading-tight">{project.title}</h2>
                <div className="flex items-center gap-3 text-gray-500">
                    <span className="text-sm font-khmer">{t('Client', 'អតិថិជន')}:</span>
                    <span className="text-sm text-gray-300 font-bold">{project.client || 'Creative Agency'}</span>
                </div>
            </div>

            <div ref={textContainerRef} className="flex-1 overflow-y-auto p-8 md:p-12 pt-6 scrollbar-hide space-y-12">
                {/* --- ធានាថាបង្ហាញ OVERVIEW ពី project.description --- */}
                <section>
                    <h3 className="text-white font-bold mb-4 flex items-center gap-3">
                        <div className="w-8 h-[2px] bg-indigo-500" />
                        {t('Overview', 'ទិដ្ឋភាពទូទៅ')}
                    </h3>
                    <div className="text-gray-400 leading-relaxed font-khmer">
                        {project.description ? (
                            <ContentRenderer content={project.description} />
                        ) : (
                            <p className="italic text-gray-500">No description found in project.description</p>
                        )}
                    </div>
                </section>

                <CaseStudy 
                  challenge={project.challenge}
                  challengeKm={project.challengeKm}
                  solution={project.solution}
                  solutionKm={project.solutionKm}
                  result={project.result}
                  resultKm={project.resultKm}
                  scrollContainerRef={textContainerRef}
                />
                {project.features && project.features.length > 0 && (
                    <section>
                        <h3 className="text-white font-bold mb-6">{t('Scope of Work', 'វិសាលភាពការងារ')}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {project.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 text-gray-300 text-sm font-khmer">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500" /> {feature}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                {project.liveUrl && (
                    <div className="pt-8">
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-gray-950 font-bold hover:bg-indigo-50 transition-all group font-khmer">
                            {t('Visit Live Project', 'ចូលមើលវេបសាយផ្ទាល់')} <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </a>
                    </div>
                )}
            </div>
          </div>
       </div>

       {isLivePreviewOpen && project.liveUrl && <LivePreviewModal url={project.liveUrl} onClose={() => setIsLivePreviewOpen(false)} />}
    </div>, document.body
  );
};

export default PortfolioModal;
