import React from 'react';
import PageOverlay from './PageOverlay';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react';

interface CareersProps {
  onClose: () => void;
}

const Careers: React.FC<CareersProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const { jobs = [] } = useData();

  return (
    <PageOverlay title={t("Careers", "ឱកាសការងារ")} bgText="JOIN US" onClose={onClose}>
         <div className="max-w-4xl mx-auto">
             <div className="text-center mb-16">
                 <div className="inline-block p-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 animate-bounce">
                    <Briefcase size={24} />
                 </div>
                 <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-khmer">
                    {t("Join the Revolution", "ចូលរួមជាមួយបដិវត្តន៍")}
                 </h1>
                 <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-khmer">
                    {t(
                        "We are always looking for talented individuals who are passionate about design, technology, and innovation. Help us build the future of Cambodia's digital landscape.",
                        "យើងតែងតែស្វែងរកបុគ្គលដែលមានទេពកោសល្យ និងចំណង់ចំណូលចិត្តលើការរចនា បច្ចេកវិទ្យា និងការច្នៃប្រឌិត។ ជួយយើងកសាងអនាគតនៃវិស័យឌីជីថលនៅកម្ពុជា។"
                    )}
                 </p>
             </div>

             <div className="grid gap-6">
                <h2 className="text-2xl font-bold text-white mb-4 font-khmer border-b border-white/10 pb-4">
                    {t("Open Positions", "តួនាទីដែលកំពុងជ្រើសរើស")}
                </h2>
                
                {jobs.map((job) => (
                    <div key={job.id} className="group bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-white/10 p-6 rounded-2xl transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform text-indigo-400">
                                {job.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-1.5"><Briefcase size={14}/> {job.department}</span>
                                    <span className="flex items-center gap-1.5"><Clock size={14}/> {job.type}</span>
                                    <span className="flex items-center gap-1.5"><MapPin size={14}/> {job.location}</span>
                                </div>
                            </div>
                        </div>
                        
                        <a 
                            href={job.link || `mailto:creative.ponloe.org@gmail.com?subject=Application for ${job.title}`}
                            className="w-full md:w-auto px-6 py-3 rounded-xl bg-white text-indigo-900 font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 shadow-lg opacity-80 group-hover:opacity-100"
                        >
                            {t("Apply Now", "ដាក់ពាក្យ")} <ArrowRight size={18} />
                        </a>
                    </div>
                ))}
             </div>

             <div className="mt-20 bg-gray-900 border border-white/10 rounded-3xl p-8 md:p-12 text-center">
                 <h2 className="text-2xl font-bold text-white mb-4 font-khmer">{t("Don't see your role?", "មិនឃើញតួនាទីរបស់អ្នក?")}</h2>
                 <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                    We are always open to meeting interesting people. If you think you'd be a great fit, send us your portfolio and tell us why.
                 </p>
                 <a 
                    href="mailto:creative.ponloe.org@gmail.com"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-white/20 text-white hover:bg-white hover:text-gray-900 transition-all font-bold"
                 >
                    Contact Us Anyway
                 </a>
             </div>
         </div>
    </PageOverlay>
  );
};

export default Careers;
