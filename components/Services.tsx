import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, X, CheckCircle2, RotateCcw } from 'lucide-react';
import { Service } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import ScrollBackgroundText from './ScrollBackgroundText';
import RevealOnScroll from './RevealOnScroll';

// DnD Kit Imports
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sortable Item Component ---
interface SortableServiceItemProps {
  service: Service;
  index: number;
  onSelect: (service: Service) => void;
  t: (en: string, km?: string) => string;
}

const SortableServiceItem: React.FC<SortableServiceItemProps> = ({ service, index, onSelect, t }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  // Layout Logic: Specific services span 2 columns
  const isLarge = index === 0 || index === 6 || service.id === 'courses';
  const gridClass = isLarge ? 'lg:col-span-2' : 'lg:col-span-1';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative p-[1px] rounded-3xl overflow-hidden ${gridClass} cursor-grab active:cursor-grabbing`}
    >
      {/* Rotating Gradient Border Background */}
      <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-opacity duration-500 animate-spin-slow blur-lg ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
      
      {/* Inner Card Content */}
      <div className={`relative h-full bg-gray-900/90 backdrop-blur-xl rounded-[23px] p-8 border border-white/10 transition-all duration-300 ${isDragging ? 'bg-gray-800 scale-[1.02] shadow-2xl' : 'hover:bg-gray-900/80'}`}>
          {/* Hover Internal Glow */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${service.color.replace('bg-', 'from-')} to-transparent rounded-[23px]`} />
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl bg-white/5 text-white border border-white/10 group-hover:scale-110 transition-transform duration-500 ${service.color.replace('bg-', 'text-')}`}>
                    {service.icon}
                </div>
                
                <div className="flex gap-2 relative z-20">
                    <button 
                      onClick={(e) => {
                        // Prevent drag start when clicking the details button
                        e.stopPropagation(); 
                        onSelect(service);
                      }}
                      onPointerDown={(e) => e.stopPropagation()} // Stop pointer down from starting drag
                      className="p-2 rounded-full border border-white/10 text-gray-400 hover:text-white hover:border-white hover:bg-white/10 transition-all cursor-pointer"
                      aria-label={`View details for ${service.title}`}
                    >
                        <ArrowUpRight size={18} />
                    </button>
                </div>
            </div>
            
            <div className="mt-6 select-none">
                <h3 className="text-2xl font-bold text-white mb-2 font-khmer">{t(service.title, service.titleKm)}</h3>
                <p className="text-gray-400 text-sm font-khmer line-clamp-2">{t(service.subtitle, service.subtitleKm || service.subtitle)}</p>
            </div>
          </div>
      </div>
    </div>
  );
};


const Services: React.FC = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { services } = useData();
  const [items, setItems] = useState<Service[]>(services);
  const [hasReordered, setHasReordered] = useState(false);
  const { t } = useLanguage();

  // Sync with context if services change externally
  useEffect(() => {
    setItems(services);
  }, [services]);

  // Handle Hash Routing
  useEffect(() => {
    const handleHashChange = () => {
        const hash = window.location.hash;
        if (hash.startsWith('#services/')) {
            const id = hash.replace('#services/', '');
            const found = services.find(s => s.id === id);
            if (found) setSelectedService(found);
        } else if (hash === '#services' && selectedService) {
            setSelectedService(null);
        }
    };

    // Initial check
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [services]);

  const handleOpenService = (service: Service) => {
      setSelectedService(service);
      window.location.hash = `services/${service.id}`;
  };

  const handleCloseService = () => {
      setSelectedService(null);
      // Push state to avoid scroll jump that sometimes happens with window.location.hash
      window.history.pushState(null, '', '#services');
  };

  // Sensors for Drag and Drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require slight movement before drag starts (prevents accidental clicks)
      },
    }),
    useSensor(TouchSensor, {
      // For mobile: Press and hold for 250ms to start dragging, so scrolling still works
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedService]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setHasReordered(true);
    }
  };

  const handleReset = () => {
    setItems(services);
    setHasReordered(false);
  };

  return (
    <section id="services" className="py-24 bg-gray-950 relative overflow-hidden">
      {/* Background Text */}
      <ScrollBackgroundText text="EXPERTISE" className="top-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll variant="fade-up">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-3xl">
                  <span className="text-indigo-400 font-bold tracking-wider uppercase text-sm mb-4 block font-khmer">{t('Our Expertise', 'ជំនាញរបស់យើង')}</span>
                  <h2 className="text-4xl md:text-5xl font-bold text-white font-khmer leading-tight">
                      {t('Comprehensive solutions for', 'ដំណោះស្រាយពេញលេញសម្រាប់')} <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{t('Digital Dominance.', 'ភាពលេចធ្លោលើឌីជីថល')}</span>
                  </h2>
              </div>

              {hasReordered && (
                  <button 
                      onClick={handleReset}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all font-khmer text-sm animate-fade-in"
                  >
                      <RotateCcw size={16} />
                      {t('Reset Layout', 'កំណត់ឡើងវិញ')}
                  </button>
              )}
          </div>
        </RevealOnScroll>

        {/* DnD Context Wrapper */}
        <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext 
                items={items.map(item => item.id)}
                strategy={rectSortingStrategy}
            >
                <RevealOnScroll variant="fade-up" delay={200} duration={800}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[250px] gap-6">
                    {items.map((service, index) => (
                        <SortableServiceItem 
                            key={service.id} 
                            service={service} 
                            index={index} 
                            onSelect={handleOpenService}
                            t={t}
                        />
                    ))}
                    </div>
                </RevealOnScroll>
            </SortableContext>
        </DndContext>
        
        {/* Helper text for mobile */}
        <div className="mt-6 text-center md:hidden">
            <p className="text-gray-600 text-xs font-khmer">
                {t('Tip: Press and hold a card to reorder services.', 'គន្លឹះ៖ ចុចឱ្យជាប់លើកាត ដើម្បីប្តូរទីតាំង។')}
            </p>
        </div>
      </div>

      {/* Service Details Modal - Using Portal to render at document body level */}
      {selectedService && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop with strong blur to focus attention */}
          <div 
            className="absolute inset-0 bg-gray-950/80 backdrop-blur-lg animate-fade-in" 
            onClick={handleCloseService}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scale-up z-10">
            {/* Top Gradient Line */}
            <div className={`h-1 w-full bg-gradient-to-r ${selectedService.color.replace('bg-', 'from-')} to-purple-500`} />
            
            <div className="p-8 md:p-10 relative overflow-y-auto max-h-[85vh] md:max-h-auto scrollbar-hide">
               {/* Close Button */}
               <button 
                onClick={handleCloseService}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all z-20"
               >
                 <X size={24} />
               </button>

               <div className="flex items-center gap-6 mb-8">
                  <div className={`p-4 rounded-2xl ${selectedService.color} text-white shadow-lg shadow-${selectedService.color.replace('bg-', '')}/20`}>
                    {React.cloneElement(selectedService.icon as React.ReactElement<any>, { size: 32 })}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-1 font-khmer">{t(selectedService.title, selectedService.titleKm)}</h3>
                    <p className="text-gray-400 font-khmer">{t(selectedService.subtitle, selectedService.subtitleKm || selectedService.subtitle)}</p>
                  </div>
               </div>

               <div className="space-y-8">
                 <div>
                   <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 font-khmer">{t('Overview', 'សេចក្តីសង្ខេប')}</h4>
                   <p className="text-lg text-gray-200 leading-relaxed font-khmer">
                     {t(selectedService.description, selectedService.descriptionKm || selectedService.description)}
                   </p>
                 </div>

                 <div>
                   <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 font-khmer">{t("What's Included", "អ្វីដែលរួមបញ្ចូល")}</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {(t(selectedService.features.join('|'), (selectedService.featuresKm || selectedService.features).join('|'))).split('|').map((feature, idx) => (
                       <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                         <CheckCircle2 size={18} className="text-green-400 shrink-0" />
                         <span className="text-gray-200 text-sm font-medium font-khmer">{feature}</span>
                       </div>
                     ))}
                   </div>
                 </div>

                 <div className="pt-6 border-t border-white/10 flex justify-end">
                    <a 
                      href="#contact" 
                      onClick={handleCloseService}
                      className="px-6 py-3 rounded-full bg-white text-gray-950 font-bold hover:scale-105 transition-transform flex items-center gap-2 font-khmer"
                    >
                      {t('Get Started', 'ចាប់ផ្តើម')}
                      <ArrowUpRight size={18} />
                    </a>
                 </div>
               </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      
      {/* Inline Styles for Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
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

export default Services;
