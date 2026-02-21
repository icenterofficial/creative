import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, X, CheckCircle2, RotateCcw } from 'lucide-react';
import { Service } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import ScrollBackgroundText from './ScrollBackgroundText';
import RevealOnScroll from './RevealOnScroll';
import { useRouter } from '../hooks/useRouter';

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

// Map service IDs to Unsplash Images (Fallback if no dynamic image is provided)
const SERVICE_IMAGES_FALLBACK: Record<string, string> = {
  graphic: 'https://raw.githubusercontent.com/icenterofficial/creative/refs/heads/main/public/images/projects/graphic/iStock-1191609321%20(1 ).jpg',
  architecture: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80&w=600',
  calligraphy: 'https://raw.githubusercontent.com/icenterofficial/creative/refs/heads/main/public/images/projects/calligraphy/1.jpg',
  translation: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600',
  media: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
  courses: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600',
  webdev: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600',
  mvac: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
};

// --- Sortable Item Component ---
interface SortableServiceItemProps {
  service: Service;
  index: number;
  onSelect: (service: Service ) => void;
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

  // Determine Background Image: Use Dynamic first, then Fallback
  const bgImage = service.image || SERVICE_IMAGES_FALLBACK[service.id];

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
      <div className={`relative h-full bg-gray-900/90 backdrop-blur-xl rounded-[23px] p-8 border border-white/10 transition-all duration-300 overflow-hidden ${isDragging ? 'bg-gray-800 scale-[1.02] shadow-2xl' : 'hover:bg-gray-900/80'}`}>
          
          {/* Background Image Always Visible with Hover Darkening */}
          {bgImage && (
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-500 ease-out grayscale-[0.3] group-hover:grayscale-0 pointer-events-none"
                style={{ backgroundImage: `url('${bgImage}')` }}
            />
          )}
          
          {/* Dark Overlay for Better Text Readability - Always Visible */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/40 to-gray-950/80 group-hover:from-transparent group-hover:via-gray-900/50 group-hover:to-gray-950/90 transition-all duration-500 pointer-events-none" />

          {/* Hover Internal Glow (Existing) - Placed AFTER image to overlay color tint */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-br ${service.color.replace('bg-', 'from-')} to-transparent rounded-[23px] pointer-events-none`} />
          
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
                <h3 className="text-2xl font-bold text-white mb-2 font-khmer drop-shadow-md">{t(service.title, service.titleKm)}</h3>
                <p className="text-gray-400 text-sm font-khmer line-clamp-2 drop-shadow-sm">{t(service.subtitle, service.subtitleKm || service.subtitle)}</p>
            </div>
          </div>
      </div>
    </div>
  );
};

interface ServicesProps {
  showPopupOnMount?: boolean;
  usePathRouting?: boolean;
}

const Services: React.FC<ServicesProps> = ({ showPopupOnMount = false, usePathRouting = false }) => {
  const { services = [] } = useData();
  const { t } = useLanguage();
  
  // Use Router Hook: Section 'services'
  const { activeId, openItem, closeItem } = useRouter('services', '', usePathRouting);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [items, setItems] = useState<Service[]>(services || []);
  const [hasReordered, setHasReordered] = useState(false);

  // Sync with context if services change externally
  useEffect(() => {
    if (services) {
        setItems(services);
    }
  }, [services]);

  // Sync Router Active ID with Data
  useEffect(() => {
      if (activeId && services) {
          const found = services.find(s => s.id === activeId);
          setSelectedService(found || null);
      } else {
          setSelectedService(null);
      }
  }, [activeId, services]);

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

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setHasReordered(true);
    }
  };

  const handleReset = () => {
    setItems(services || []);
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
                      {t('Comprehensive solutions for', 'ដំណោះស្រាយពេញលេញសម្រាប់')}   

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
                items={(items || []).map(item => item.id)}
                strategy={rectSortingStrategy}
            >
                <RevealOnScroll variant="fade-up" delay={200} duration={800}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[250px] gap-6">
                    {(items || []).map((service, index) => (
                        <SortableServiceItem 
                            key={service.id} 
                            service={service} 
                            index={index} 
                            onSelect={(s) => openItem(s.id)}
                            t={t}
                        />
                    ))}
                    </div>
                </RevealOnScroll>
            </SortableContext>
        </DndContext>
        
        {/* Helper text for mobile */}
        <div className="mt-6 text-center md:hidden">
            <p className="text-gray-600 text-xs font-khmer italic">{t('Press and hold to reorder services', 'ចុចឱ្យជាប់ដើម្បីរៀបចំសេវាកម្មឡើងវិញ')}</p>
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-950/90 backdrop-blur-md animate-fade-in"
            onClick={closeItem}
          />
          <div className="relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scale-up z-10">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div className={`p-4 rounded-2xl bg-white/5 ${selectedService.color.replace('bg-', 'text-')} border border-white/10`}>
                  {selectedService.icon}
                </div>
                <button 
                  onClick={closeItem}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors border border-white/5"
                >
                  <X size={24} />
                </button>
              </div>
              
              <h3 className="text-3xl font-bold text-white mb-4 font-khmer">{t(selectedService.title, selectedService.titleKm)}</h3>
              <p className="text-indigo-400 font-medium mb-6 font-khmer">{t(selectedService.subtitle, selectedService.subtitleKm || selectedService.subtitle)}</p>
              
              <div className="prose prose-invert max-w-none mb-8">
                <p className="text-gray-300 leading-relaxed font-khmer">
                  {t(selectedService.description, selectedService.descriptionKm || selectedService.description)}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(selectedService.features || []).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                    <CheckCircle2 size={18} className="text-green-400 shrink-0" />
                    <span className="text-gray-300 text-sm font-khmer">{t(feature, feature)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

export default Services;
