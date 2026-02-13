import React from 'react';
import { Phone, Mail, MapPin, Send, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import ScrollBackgroundText from './ScrollBackgroundText';
import RevealOnScroll from './RevealOnScroll';

export default function Contact() {
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-24 bg-gray-900 relative overflow-hidden">
      {/* Background Text */}
      <ScrollBackgroundText text="CONTACT" className="top-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16">
              
              {/* Left Side: Information - Slide in from Left */}
              <RevealOnScroll variant="slide-right" duration={1000}>
                <div className="space-y-8">
                    <div>
                        <span className="text-indigo-400 font-bold tracking-wider uppercase text-sm font-khmer">{t('Get in Touch', 'ទំនាក់ទំនងយើង')}</span>
                        <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white font-khmer leading-tight">
                            {t("Let's Build Something", "បង្កើតអ្វីមួយ")} <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{t("Extraordinary.", "ដែលអស្ចារ្យ")}</span>
                        </h2>
                        <p className="mt-6 text-gray-400 text-lg leading-relaxed font-khmer">
                            {t(
                                "Ready to start your project? Contact us today for a consultation.",
                                "តើអ្នកត្រៀមខ្លួនចាប់ផ្តើមគម្រោងរបស់អ្នកហើយឬនៅ? ទាក់ទងមកយើងថ្ងៃនេះ ដើម្បីប្រឹក្សាយោបល់។"
                            )}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                <Phone size={24} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm font-khmer">{t('Call Us', 'ទូរស័ព្ទ')}</p>
                                <p className="text-white font-bold text-lg font-mono">+855 15 627 458</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-all">
                                <Mail size={24} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm font-khmer">{t('Email Us', 'អ៊ីមែល')}</p>
                                <p className="text-white font-bold text-lg">creative.ponloe.org@gmail.com</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                            <div className="p-3 bg-pink-500/20 text-pink-400 rounded-xl group-hover:bg-pink-500 group-hover:text-white transition-all">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm font-khmer">{t('Visit Us', 'អាសយដ្ឋាន')}</p>
                                <p className="text-white font-bold font-khmer">ឫស្សីកែវ​, រាជធានីភ្នំពេញ</p>
                            </div>
                        </div>
                    </div>
                </div>
              </RevealOnScroll>

              {/* Right Side: Form - Slide in from Right */}
              <RevealOnScroll variant="slide-left" duration={1000} delay={200}>
                <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl opacity-20 blur-xl"></div>
                    <div className="relative bg-gray-950 rounded-3xl p-8 border border-white/10">
                        <form className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400 ml-1 font-khmer">{t('Name', 'ឈ្មោះ')}</label>
                                    <input type="text" className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-600" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400 ml-1 font-khmer">{t('Email', 'អ៊ីមែល')}</label>
                                    <input type="email" className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-600" placeholder="john@example.com" />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400 ml-1 font-khmer">{t('Service', 'សេវាកម្ម')}</label>
                                <select className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all [&>option]:bg-gray-900 font-khmer">
                                    <option>{t('Graphic Design', 'ការរចនាក្រាហ្វិក')}</option>
                                    <option>{t('Web Development', 'ការអភិវឌ្ឍវេបសាយ')}</option>
                                    <option>{t('Architecture', 'ស្ថាបត្យកម្ម')}</option>
                                    <option>{t('MVAC System', 'ប្រព័ន្ធម៉ាស៊ីនត្រជាក់')}</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400 ml-1 font-khmer">{t('Message', 'សារ')}</label>
                                <textarea rows={4} className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-600" placeholder={t('Tell us about your project...', 'ប្រាប់យើងអំពីគម្រោងរបស់អ្នក...')}></textarea>
                            </div>
                            
                            <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 font-khmer">
                                {t('Send Request', 'ផ្ញើសំណើ')} <ArrowRight size={20} />
                            </button>
                        </form>
                    </div>
                </div>
              </RevealOnScroll>
          </div>
      </div>
    </section>
  );
}