import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowUpRight, Facebook, Send, Instagram, Mail, MapPin } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gray-950 pt-24 overflow-hidden">
      {/* Decorative Top Gradient Line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Section: Big CTA */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20 items-center border-b border-white/5 pb-20">
            <RevealOnScroll>
                <h2 className="text-4xl md:text-6xl font-bold text-white font-khmer leading-tight">
                    {t("Let's create something", "តោះបង្កើតអ្វីមួយ")} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                        {t("extraordinary together.", "ដែលអស្ចារ្យទាំងអស់គ្នា។")}
                    </span>
                </h2>
            </RevealOnScroll>
            
            <RevealOnScroll delay={100} className="flex flex-col items-start lg:items-end">
                <a 
                    href="#contact" 
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-950 rounded-full font-bold text-lg hover:bg-indigo-50 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                >
                    <span className="font-khmer">{t("Start a Project", "ចាប់ផ្តើមគម្រោង")}</span>
                    <div className="w-8 h-8 rounded-full bg-gray-950 text-white flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                        <ArrowUpRight size={18} className="group-hover:rotate-45 transition-transform duration-300" />
                    </div>
                </a>
                <p className="mt-6 text-gray-500 font-khmer text-sm">
                    {t("Have an idea? We'd love to hear about it.", "មានគំនិតទេ? យើងចង់ស្តាប់ពីវា។")}
                </p>
            </RevealOnScroll>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-24">
            {/* Brand Column */}
            <div className="lg:col-span-4 space-y-8">
                <a href="#" className="flex items-center gap-2 group w-fit">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform text-xl">P</div>
                    <span className="text-3xl font-bold text-white tracking-tight">ponloe<span className="text-gray-500">.creative</span></span>
                </a>
                <p className="text-gray-400 leading-relaxed font-khmer max-w-sm text-lg">
                    {t(
                        "Pioneering the future of digital design and architectural innovation in Cambodia. We build brands that matter.",
                        "ត្រួសត្រាយអនាគតនៃការរចនាឌីជីថល និងនវានុវត្តន៍ស្ថាបត្យកម្មនៅកម្ពុជា។ យើងកសាងម៉ាកយីហោដែលមានតម្លៃ។"
                    )}
                </p>
                <div className="flex gap-4">
                    {[
                        { icon: Facebook, href: "https://facebook.com" },
                        { icon: Send, href: "https://telegram.org" }, 
                        { icon: Instagram, href: "https://instagram.com" }
                    ].map((Item, idx) => (
                        <a key={idx} href={Item.href} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:bg-white hover:text-gray-950 hover:scale-110 transition-all duration-300">
                            <Item.icon size={20} />
                        </a>
                    ))}
                </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-2 md:col-span-1">
                <h4 className="text-white font-bold mb-8 font-khmer text-lg">{t("Services", "សេវាកម្ម")}</h4>
                <ul className="space-y-4">
                    {['Web Development', 'App Development', 'Graphic Design', 'Architecture', 'MVAC System'].map((item) => (
                        <li key={item}>
                            <a href="#services" className="text-gray-500 hover:text-indigo-400 transition-colors text-base font-khmer block hover:translate-x-2 duration-300 flex items-center gap-2 group">
                                <span className="w-1 h-1 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                {item}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="lg:col-span-2 md:col-span-1">
                <h4 className="text-white font-bold mb-8 font-khmer text-lg">{t("Company", "ក្រុមហ៊ុន")}</h4>
                <ul className="space-y-4">
                    {[
                        { label: t('About Us', 'អំពីយើង'), href: '#about' },
                        { label: t('Careers', 'ឱកាសការងារ'), href: '#careers' },
                        { label: t('Insights', 'អត្ថបទ'), href: '#insights' },
                        { label: t('Privacy Policy', 'គោលការណ៍​ភាព​ឯកជន'), href: '#privacy' }
                    ].map((item) => (
                        <li key={item.href}>
                            <a 
                                href={item.href} 
                                className="text-gray-500 hover:text-indigo-400 transition-colors text-base font-khmer block hover:translate-x-2 duration-300 flex items-center gap-2 group"
                            >
                                <span className="w-1 h-1 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                {item.label}
                            </a>
                        </li>
                    ))}
                     <li>
                        <a href="#admin" className="text-gray-500 hover:text-indigo-400 transition-colors text-base font-khmer block hover:translate-x-2 duration-300 flex items-center gap-2 group">
                             <span className="w-1 h-1 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                             Admin Login
                        </a>
                    </li>
                </ul>
            </div>

            {/* Contact Column - Stylized Card */}
            <div className="lg:col-span-4 md:col-span-2">
                 <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 border border-white/10 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                     {/* Glow Effect */}
                     <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
                     
                     <h4 className="text-white font-bold mb-6 font-khmer text-lg relative z-10">{t("Contact Info", "ព័ត៌មានទំនាក់ទំនង")}</h4>
                     <div className="space-y-6 relative z-10">
                        <a href="mailto:creative.ponloe.org@gmail.com" className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors group/link">
                            <div className="p-3 bg-gray-950 rounded-xl group-hover/link:bg-indigo-600 transition-colors border border-white/5"><Mail size={20} /></div>
                            <span className="text-base font-medium">creative.ponloe.org@gmail.com</span>
                        </a>
                        <div className="flex items-center gap-4 text-gray-400 group/link">
                            <div className="p-3 bg-gray-950 rounded-xl border border-white/5"><MapPin size={20} /></div>
                            <span className="text-base font-medium font-khmer">Russey Keo, Phnom Penh, Cambodia</span>
                        </div>
                     </div>
                 </div>
            </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative border-t border-white/5 pt-8 pb-12 flex flex-col md:flex-row justify-between items-center gap-4 z-20">
             <p className="text-gray-600 text-sm font-khmer">
                © {currentYear} Ponloe Creative. All Rights Reserved.
             </p>
             <p className="text-gray-600 text-sm font-khmer flex items-center gap-1.5">
                Made with <span className="text-red-500 animate-pulse">♥</span> in Cambodia
             </p>
        </div>
        
        {/* Massive Watermark Text - Fixed Position at bottom */}
        <div className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none overflow-hidden z-0">
            <h1 className="text-[18vw] md:text-[22vw] font-black leading-none text-white/[0.02] tracking-tighter scale-y-110">
                PONLOE
            </h1>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
