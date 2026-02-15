import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, ArrowRight, Check, Copy, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import ScrollBackgroundText from './ScrollBackgroundText';
import RevealOnScroll from './RevealOnScroll';

export default function Contact() {
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      service: 'Graphic Design',
      message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      const { name, email, service, message } = formData;
      
      // Format the message for Telegram
      const text = `🚀 *New Inquiry from Website* 🚀\n\n👤 *Name:* ${name}\n📧 *Email:* ${email}\n🛠 *Service:* ${service}\n\n📝 *Message:*\n${message}`;
      
      try {
          // Copy to clipboard
          await navigator.clipboard.writeText(text);
          
          // Show feedback
          setSuccessMessage(t('Message copied! Opening Telegram...', 'បានចម្លងសារ! កំពុងបើក Telegram...'));
          
          // Open Telegram after a brief delay to allow user to read feedback
          setTimeout(() => {
              window.open('https://t.me/khmermuslim', '_blank');
              setIsSubmitting(false);
              setSuccessMessage(t('Please paste the message in the chat.', 'សូម Paste សារនៅក្នុងប្រអប់សារ។'));
              setFormData({ name: '', email: '', service: 'Graphic Design', message: '' });
              
              // Clear success message after 5s
              setTimeout(() => setSuccessMessage(''), 5000);
          }, 1500);

      } catch (err) {
          console.error("Failed to copy", err);
          // Fallback if clipboard fails (rare)
          window.open('https://t.me/khmermuslim', '_blank');
          setIsSubmitting(false);
      }
  };

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
                        <a href="tel:+85515627458" className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                <Phone size={24} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm font-khmer">{t('Call Us', 'ទូរស័ព្ទ')}</p>
                                <p className="text-white font-bold text-lg font-mono">+855 15 627 458</p>
                            </div>
                        </a>
                        
                        <a href="mailto:creative.ponloe.org@gmail.com" className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-all">
                                <Mail size={24} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm font-khmer">{t('Email Us', 'អ៊ីមែល')}</p>
                                <p className="text-white font-bold text-lg">creative.ponloe.org@gmail.com</p>
                            </div>
                        </a>

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
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400 ml-1 font-khmer">{t('Name', 'ឈ្មោះ')}</label>
                                    <input 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        type="text" 
                                        required
                                        className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-600 font-khmer" 
                                        placeholder="John Doe" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400 ml-1 font-khmer">{t('Email', 'អ៊ីមែល')}</label>
                                    <input 
                                        name="email" 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        type="email" 
                                        required
                                        className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-600 font-khmer" 
                                        placeholder="john@example.com" 
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400 ml-1 font-khmer">{t('Service', 'សេវាកម្ម')}</label>
                                <select 
                                    name="service"
                                    value={formData.service}
                                    onChange={handleChange}
                                    className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all [&>option]:bg-gray-900 font-khmer"
                                >
                                    <option value="Graphic Design">{t('Graphic Design', 'ការរចនាក្រាហ្វិក')}</option>
                                    <option value="Web Development">{t('Web Development', 'ការអភិវឌ្ឍវេបសាយ')}</option>
                                    <option value="Architecture">{t('Architecture', 'ស្ថាបត្យកម្ម')}</option>
                                    <option value="MVAC System">{t('MVAC System', 'ប្រព័ន្ធម៉ាស៊ីនត្រជាក់')}</option>
                                    <option value="Translation">{t('Translation', 'ការបកប្រែ')}</option>
                                    <option value="Other">{t('Other', 'ផ្សេងៗ')}</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400 ml-1 font-khmer">{t('Message', 'សារ')}</label>
                                <textarea 
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={4} 
                                    required
                                    className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-600 font-khmer" 
                                    placeholder={t('Tell us about your project...', 'ប្រាប់យើងអំពីគម្រោងរបស់អ្នក...')}
                                ></textarea>
                            </div>
                            
                            {successMessage && (
                                <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center gap-3 text-green-400 animate-fade-in">
                                    <div className="p-1 bg-green-500 rounded-full text-white"><Check size={12} /></div>
                                    <span className="font-khmer text-sm">{successMessage}</span>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 font-khmer disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        {t('Processing...', 'កំពុងដំណើរការ...')}
                                    </>
                                ) : (
                                    <>
                                        {t('Send Request', 'ផ្ញើសំណើ')} <Send size={20} />
                                    </>
                                )}
                            </button>
                            
                            <p className="text-center text-xs text-gray-500 font-khmer">
                                {t('We will copy your message and open Telegram for you.', 'យើងនឹងចម្លងសាររបស់អ្នក ហើយបើក Telegram ជូនអ្នក។')}
                            </p>
                        </form>
                    </div>
                </div>
              </RevealOnScroll>
          </div>
      </div>
    </section>
  );
}
