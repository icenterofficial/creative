import React from 'react';
import { Edit, Trash2, FileText, Lock, GripVertical, MapPin, Briefcase } from 'lucide-react';
import { TeamMember, Project, Post, Service, Job, Partner } from '../../types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ContentGridProps {
  activeTab: 'team' | 'projects' | 'insights' | 'services' | 'careers' | 'settings' | 'partners';
  isSuperAdmin: boolean;
  memberId: string | undefined;
  data: { team: TeamMember[]; projects: Project[]; insights: Post[]; services: Service[]; jobs: Job[]; partners: Partner[] };
  onEdit: (item: any) => void;
  onDelete: (type: 'service' | 'project' | 'team' | 'insight' | 'job' | 'partner', id: string) => void;
  onReorderTeam?: (newOrder: TeamMember[]) => void;
}

// Sortable Item Component
const SortableTeamItem = ({ item, isSuperAdmin, memberId, getPostCount, onEdit, onDelete }: any) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    const isEditable = isSuperAdmin || item.id === memberId;

    return (
        <div ref={setNodeRef} style={style} className={`bg-gray-900 border border-white/10 rounded-xl p-4 flex flex-col gap-4 relative group ${isDragging ? 'opacity-50' : ''}`}>
            {isSuperAdmin && (
                <div {...attributes} {...listeners} className="absolute top-2 left-2 z-20 p-2 bg-black/50 rounded cursor-grab active:cursor-grabbing text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical size={16} />
                </div>
            )}
            
            <div className="relative">
                <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded-lg bg-gray-800" />
                {getPostCount(item.id) > 0 && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-indigo-600/90 backdrop-blur-sm rounded-lg border border-white/10 text-white text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                    <FileText size={10} /> {getPostCount(item.id)} Articles
                  </div>
                )}
            </div>
            <div>
                <h4 className="font-bold text-lg text-white">{item.name}</h4>
                <p className="text-gray-400 text-sm">{item.role}</p>
                {isSuperAdmin && item.pinCode && (
                     <div className="flex items-center gap-1 mt-2 text-xs text-indigo-400 font-mono bg-indigo-500/10 px-2 py-1 rounded w-fit">
                        <Lock size={10} /> PIN: {item.pinCode}
                     </div>
                )}
            </div>
            {isEditable && (
                <div className="mt-auto flex gap-2">
                    <button onClick={() => onEdit(item)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><Edit size={14} /> Edit</button>
                    {isSuperAdmin && (
                        <button onClick={() => onDelete('team', item.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg"><Trash2 size={16} /></button>
                    )}
                </div>
            )}
        </div>
    );
};

const ContentGrid: React.FC<ContentGridProps> = ({ activeTab, isSuperAdmin, memberId, data, onEdit, onDelete, onReorderTeam }) => {
  const getPostCount = (authorId: string) => (data.insights || []).filter(post => post.authorId === authorId).length;
  
  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id && onReorderTeam) {
          const oldIndex = data.team.findIndex(item => item.id === active.id);
          const newIndex = data.team.findIndex(item => item.id === over.id);
          const newOrder = arrayMove(data.team, oldIndex, newIndex);
          onReorderTeam(newOrder);
      }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* TEAM - WRAPPED IN DND CONTEXT */}
      {activeTab === 'team' && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={data.team.map(t => t.id)} strategy={rectSortingStrategy}>
                 {data.team.filter(item => isSuperAdmin || item.id === memberId).map(item => (
                     <SortableTeamItem 
                        key={item.id} 
                        item={item} 
                        isSuperAdmin={isSuperAdmin} 
                        memberId={memberId} 
                        getPostCount={getPostCount} 
                        onEdit={onEdit} 
                        onDelete={onDelete} 
                     />
                 ))}
              </SortableContext>
          </DndContext>
      )}

      {/* PROJECTS */}
      {activeTab === 'projects' && (data.projects || []).map(item => {
        const canDelete = isSuperAdmin || (memberId && item.createdBy === memberId);
        return (
            <div key={item.id} className="bg-gray-900 border border-white/10 rounded-xl p-4 flex flex-col gap-4">
            <img src={item.image} alt={item.title} className="w-full h-40 object-cover rounded-lg bg-gray-800" />
            <div>
                <h4 className="font-bold text-white">{item.title}</h4>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">{item.category}</span>
                {item.createdBy && isSuperAdmin && (
                    <span className="block text-[10px] text-gray-500 mt-1">Added by: {item.createdBy.substring(0,8)}...</span>
                )}
            </div>
            <div className="mt-auto flex gap-2">
                <button onClick={() => onEdit(item)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><Edit size={14} /> Edit</button>
                {canDelete && (
                    <button onClick={() => onDelete('project', item.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg"><Trash2 size={16} /></button>
                )}
            </div>
            </div>
        );
      })}
      
      {/* INSIGHTS */}
      {activeTab === 'insights' && (data.insights || []).filter(item => isSuperAdmin || item.authorId === memberId).map(item => (
            <div key={item.id} className="bg-gray-900 border border-white/10 rounded-xl p-4 flex flex-col gap-4">
              <img src={item.image} alt={item.title} className="w-full h-40 object-cover rounded-lg bg-gray-800" />
              <div>
                <h4 className="font-bold text-white line-clamp-2">{item.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{item.date}</p>
              </div>
              <div className="mt-auto flex gap-2">
                <button onClick={() => onEdit(item)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><Edit size={14} /> Edit</button>
                <button onClick={() => onDelete('insight', item.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
      ))}
      
      {/* SERVICES */}
      {activeTab === 'services' && isSuperAdmin && (data.services || []).map(item => (
        <div key={item.id} className="bg-gray-900 border border-white/10 rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden group">
          {item.image && (
              <div className="absolute inset-0 opacity-10 group-hover:opacity-30 transition-opacity">
                  <img src={item.image} className="w-full h-full object-cover" />
              </div>
          )}
          <div className={`absolute top-0 left-0 w-1 h-full ${item.color} z-10`}></div>
          <div className="pl-3 relative z-10">
            <h4 className="font-bold text-white">{item.title}</h4>
            <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
          </div>
          <div className="mt-auto flex gap-2 relative z-10">
            <button onClick={() => onEdit(item)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold flex items-center justify-center gap-2 backdrop-blur-sm"><Edit size={14} /> Edit</button>
            <button onClick={() => onDelete('service', item.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg"><Trash2 size={16} /></button>
          </div>
        </div>
      ))}

      {/* CAREERS / JOBS */}
      {activeTab === 'careers' && isSuperAdmin && (data.jobs || []).map(item => (
        <div key={item.id} className="bg-gray-900 border border-white/10 rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:bg-white/5 transition-colors">
          <div>
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-white text-lg">{item.title}</h4>
                <div className="p-2 bg-white/5 rounded-lg text-indigo-400">
                    {item.icon}
                </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Briefcase size={12}/> {item.department}</span>
                <span className="flex items-center gap-1"><MapPin size={12}/> {item.location}</span>
            </div>
            <span className="inline-block mt-3 px-2 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded uppercase tracking-wide">
                {item.type}
            </span>
          </div>
          <div className="mt-auto flex gap-2 relative z-10 pt-4 border-t border-white/5">
            <button onClick={() => onEdit(item)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold flex items-center justify-center gap-2 backdrop-blur-sm"><Edit size={14} /> Edit</button>
            <button onClick={() => onDelete('job', item.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg"><Trash2 size={16} /></button>
          </div>
        </div>
      ))}

      {/* PARTNERS */}
      {activeTab === 'partners' && isSuperAdmin && (data.partners || []).map(item => (
        <div key={item.id} className="bg-gray-900 border border-white/10 rounded-xl p-6 flex flex-col items-center gap-4 text-center hover:bg-white/5 transition-colors">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-300">
                {item.icon}
            </div>
            <h4 className="font-bold text-white">{item.name}</h4>
            <div className="mt-auto flex gap-2 w-full">
                <button onClick={() => onEdit(item)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><Edit size={14} /> Edit</button>
                <button onClick={() => onDelete('partner', item.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg"><Trash2 size={16} /></button>
            </div>
        </div>
      ))}
    </div>
  );
};
export default ContentGrid;
