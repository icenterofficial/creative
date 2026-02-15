import React from 'react';
import PageOverlay from './PageOverlay';
import { useLanguage } from '../contexts/LanguageContext';
import { Users, Lightbulb, Heart, Target, Sparkles, Award } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';

interface AboutProps {
  onClose: () => void;
}

const About: React.FC<AboutProps> = ({ onClose }) => {
  const { t } = useLanguage();

  const values = [
    {
        icon: <Lightbulb className="text-yellow-400" size={32} />,
        title: "Innovation",
        desc: "We push boundaries and explore new technologies to deliver cutting-edge solutions."
    },
    {
        icon: <Heart className="text-red-400" size={32} />,
        title: "Passion",
        desc: "We love what we do, and that enthusiasm shines through in every pixel and line of code."
    },
    {
        icon: <Users className="text-indigo-400" size={32} />,
        title: "Community",
        desc: "Deeply rooted in Cambodian culture, we strive to uplift and empower our local community."
    },
    {
        icon: <Target className="text-green-400" size={32} />,
        title: "Excellence",
        desc: "Good isn't enough. We aim for greatness in every project, big or small."
    }
  ];

  return (
    <PageOverlay title={t("About Us", "អំពីយើង")} bgText="STORY" onClose={onClose}>
        <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-khmer leading-tight">
                    {t("We are", "យើងគឺជា")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Ponloe Creative</span>
                </h1>
                <p className="text-xl text-gray-400 leading-relaxed font-khmer">
                    {t(
                        "A multidisciplinary design and technology agency based in the heart of Phnom Penh, dedicated to transforming ideas into digital reality.",
                        "ភ្នាក់ងាររចនា និងបច្ចេកវិទ្យាដែលមានមូលដ្ឋាននៅកណ្តាលរាជធានីភ្នំពេញ ដែលប្តេជ្ញាចិត្តប្រែក្លាយគំនិតទៅជាការពិតក្នុងពិភពឌីជីថល។"
                    )}
                </p>
            </div>

            {/* Image Banner */}
            <div className="relative h-64 md:h-96 w-full rounded-3xl overflow-hidden mb-16 border border-white/10 shadow-2xl">
                <img 
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2000" 
                    alt="Team working together" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-indigo-900/30 mix-blend-multiply"></div>
                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                    <p className="text-white font-bold flex items-center gap-2">
                        <Sparkles size={18} className="text-yellow-400"/> Est. 2020 in Phnom Penh
                    </p>
                </div>
            </div>

            {/* Our Story */}
            <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-6 font-khmer">{t("Our Story", "ប្រវត្តិរបស់យើង")}</h2>
                    <div className="space-y-4 text-gray-300 leading-relaxed font-khmer">
                        <p>
                            {t(
                                "Ponloe Creative started as a small collective of freelancers passionate about bringing modern design aesthetics to the Cambodian market. We noticed a gap between traditional local businesses and the rapidly evolving digital landscape.",
                                "Ponloe Creative បានចាប់ផ្តើមជាក្រុមតូចមួយនៃអ្នកធ្វើការឯករាជ្យដែលមានចំណង់ចំណូលចិត្តក្នុងការនាំយកសោភ័ណភាពរចនាទំនើបមកកាន់ទីផ្សារកម្ពុជា។ យើងបានកត់សម្គាល់ឃើញគម្លាតរវាងអាជីវកម្មក្នុងស្រុកបែបប្រពៃណី និងទេសភាពឌីជីថលដែលកំពុងវិវត្តយ៉ាងឆាប់រហ័ស។"
                            )}
                        </p>
                        <p>
                            {t(
                                "Today, we have grown into a full-service agency offering web development, graphic design, architectural planning, and more. Our diverse team combines international standards with deep local insights.",
                                "សព្វថ្ងៃនេះ យើងបានរីកចម្រើនទៅជាភ្នាក់ងារផ្តល់សេវាកម្មពេញលេញដែលផ្តល់ជូននូវការអភិវឌ្ឍន៍គេហទំព័រ ការរចនាក្រាហ្វិក ការរៀបចំផែនការស្ថាបត្យកម្ម និងច្រើនទៀត។ ក្រុមចម្រុះរបស់យើងរួមបញ្ចូលគ្នានូវស្តង់ដារអន្តរជាតិជាមួយនឹងការយល់ដឹងស៊ីជម្រៅក្នុងស្រុក។"
                            )}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
                        <h3 className="text-4xl font-bold text-white mb-2">50+</h3>
                        <p className="text-indigo-400 text-sm uppercase font-bold">Projects</p>
                     </div>
                     <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
                        <h3 className="text-4xl font-bold text-white mb-2">15+</h3>
                        <p className="text-indigo-400 text-sm uppercase font-bold">Experts</p>
                     </div>
                     <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center col-span-2">
                        <h3 className="text-4xl font-bold text-white mb-2">100%</h3>
                        <p className="text-indigo-400 text-sm uppercase font-bold">Client Satisfaction</p>
                     </div>
                </div>
            </div>

            {/* Values */}
            <div>
                <h2 className="text-3xl font-bold text-white mb-10 text-center font-khmer">{t("Core Values", "គុណតម្លៃស្នូល")}</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {values.map((val, idx) => (
                        <div key={idx} className="bg-gray-900 border border-white/10 p-6 rounded-2xl hover:border-indigo-500/50 transition-colors group">
                            <div className="mb-4 bg-white/5 w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                {val.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{val.title}</h3>
                            <p className="text-gray-400 text-sm">{val.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="mt-20 p-8 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-center">
                <h2 className="text-3xl font-bold text-white mb-4 font-khmer">{t("Ready to work with us?", "ត្រៀមខ្លួនធ្វើការជាមួយយើងហើយឬនៅ?")}</h2>
                <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
                    Let's create something extraordinary together.
                </p>
                <button 
                    onClick={() => { onClose(); window.location.hash = '#contact'; }}
                    className="px-8 py-3 bg-white text-indigo-600 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg"
                >
                    {t("Get in Touch", "ទំនាក់ទំនងយើង")}
                </button>
            </div>
        </div>
    </PageOverlay>
  );
};

export default About;
