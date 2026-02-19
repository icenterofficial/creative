
import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { Project } from '../../types';
import RevealOnScroll from '../RevealOnScroll';

interface PortfolioCardProps {
  project: Project;
  index: number;
  onClick: () => void;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ project, index, onClick }) => {
  return (
    <RevealOnScroll delay={index * 100} variant="zoom-in" duration={600}>
      <div 
        onClick={onClick}
        className="group relative rounded-2xl overflow-hidden break-inside-avoid bg-gray-800 transition-transform duration-500 hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl hover:shadow-indigo-500/20 cursor-pointer"
      >
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Gallery Indicator (If multiple images) */}
        {(project.gallery && project.gallery.length > 0) && (
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md text-white text-xs font-bold flex items-center gap-1 z-10 border border-white/10">
                <ImageIcon size={12} />
                <span>{project.gallery.length + 1}</span>
            </div>
        )}

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
  );
};

export default PortfolioCard;
