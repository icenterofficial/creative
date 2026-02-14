import React from 'react';
import { Edit, Trash2, FileText, Lock } from 'lucide-react';
import { TeamMember, Project, Post, Service } from '../../types';

interface ContentGridProps {
  activeTab: 'team' | 'projects' | 'insights' | 'services' | 'settings';
  isSuperAdmin: boolean;
  memberId: string | undefined;
  data: { team: TeamMember[]; projects: Project[]; insights: Post[]; services: Service[]; };
  onEdit: (item: any) => void;
  onDelete: (type: 'service' | 'project' | 'team' | 'insight', id: string) => void;
}

const ContentGrid: React.FC<ContentGridProps> = ({ activeTab, isSuperAdmin, memberId, data, onEdit, onDelete }) => {
  const getPostCount = (authorId: string) => data.insights.filter(post => post.authorId === authorId).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* TEAM */}
      {activeTab === 'team' && data.team.filter(item => isSuperAdmin || item.id === memberId).map(item => (
            <div key={item.id} className="bg-gray-900 border border-white/10 rounded-xl p-4 flex flex-col gap-4">
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
              </div>
              <div className="mt-auto flex gap-2">
                <button onClick={() => onEdit(item)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><Edit size={14} /> Edit</button>
                {isSuperAdmin && (
                  <button onClick={() => onDelete('team', item.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg"><Trash2 size={16} /></button>
                )}
              </div>
            </div>
      ))}
      {/* PROJECTS */}
      {activeTab === 'projects' && isSuperAdmin && data.projects.map(item => (
        <div key={item.id} className="bg-gray-900 border border-white/10 rounded-xl p-4 flex flex-col gap-4">
          <img src={item.image} alt={item.title} className="w-full h-40 object-cover rounded-lg bg-gray-800" />
          <div>
            <h4 className="font-bold text-white">{item.title}</h4>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">{item.category}</span>
          </div>
          <div className="mt-auto flex gap-2">
            <button onClick={() => onEdit(item)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><Edit size={14} /> Edit</button>
            <button onClick={() => onDelete('project', item.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg"><Trash2 size={16} /></button>
          </div>
        </div>
      ))}
      {/* INSIGHTS */}
      {activeTab === 'insights' && data.insights.filter(item => isSuperAdmin || item.authorId === memberId).map(item => (
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
      {activeTab === 'services' && isSuperAdmin && data.services.map(item => (
        <div key={item.id} className="bg-gray-900 border border-white/10 rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 h-full ${item.color}`}></div>
          <div className="pl-3">
            <h4 className="font-bold text-white">{item.title}</h4>
            <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
          </div>
          <div className="mt-auto flex gap-2">
            <button onClick={() => onEdit(item)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><Edit size={14} /> Edit</button>
          </div>
        </div>
      ))}
    </div>
  );
};
export default ContentGrid;
