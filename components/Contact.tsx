import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, Check, Loader2, AlertCircle } from 'lucide-react';
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
  const [errorMessage, setErrorMessage] = useState('');

  const TELEGRAM_BOT_TOKEN = '8263160608:AAFngJ6_jVXnFYlqs0lKZQplu8wh-UxS2Bo'; 
  const TELEGRAM_CHAT_ID = '1276188382'; 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      const { name, email, service, message } = formData;
      const text = `🚀 *New Inquiry from Website* 🚀\n\n👤 *Name:* ${name}\n📧 *Email:* ${email}\n🛠 *Service:* ${service}\n\n📝 *Message:*\n${message}`;
      
      try {
          const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: text, parse_mode: 'Markdown' }),
          });

          const data = await response.json();
          if (data.ok) {
              setSuccessMessage(t('Message sent successfully!', 'សារត្រូវបានផ្ញើដោយជោគជ័យ!'));
              setFormData({ name: '', email: '', service: 'Graphic Design', message: '' });
              setTimeout(() => setSuccessMessage(''), 5000);
          } else {
              throw new Error(data.description);
          }
      } catch (err) {
          setErrorMessage(t('Failed to send message.', 'បរាជ័យក្នុងការផ្ញើសារ។'));
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-gray-900 relative overflow-hidden">
      <ScrollBackgroundText text="CONTACT" className="top-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-16">
              
              <RevealOnScroll variant="slide-right" duration={1000}>
                <div className="space-y-6 md:space-y-8">
                    <div>
                        <span className="text-indigo-400 font-bold tracking-wider uppercase text-xs md:text-sm font-khmer">{t('Get in Touch', 'ទំនាក់ទំនងយើង')}</span>
                        <h2 className="mt-2 md:mt-4 text-3xl md:text-5xl font-bold text-white font-khmer leading-tight">
                            {t("Let's Build Something", "បង្កើតអ្វីមួយ")} <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{t("Extraordinary.", "ដែលអស្ចារ្យ")}</span>
                        </h2>
                        <p className="mt-4 md:mt-6 text-gray-400 text-base md:text-lg leading-relaxed font-khmer">
                            {t("Ready to start your project? Contact us today.", "តើអ្នកត្រៀមខ្លួនចាប់ផ្តើមគម្រោងរបស់អ្នកហើយឬនៅ? ទាក់ទងមកយើងថ្ងៃនេះ។")}
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-1 md:grid-cols-1 gap-4 md:gap-6">
                        <a href="tel:+85515627458" className="flex items-center gap-4 md:gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-all"><Phone size={20} /></div>
                            <div><p className="text-gray-500 text-[10px] md:text-xs font-khmer uppercase font-bold">{t('Call Us', 'ទូរស័ព្ទ')}</p><p className="text-white font-bold text-base md:text-lg font-mono">+855 15 627 458</p></div>
                        </a>
                        <a href="mailto:creative.ponloe.org@gmail.com" className="flex items-center gap-4 md:gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-all"><Mail size={20} /></div>
                            <div className="min-w-0"><p className="text-gray-500 text-[10px] md:text-xs font-khmer uppercase font-bold">{t('Email Us', 'អ៊ីមែល')}</p><p className="text-white font-bold text-base md:text-lg truncate">creative.ponloe.org@gmail.com</p></div>
                        </a>
                        <div className="flex items-center gap-4 md:gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 group">
                            <div className="p-3 bg-pink-500/20 text-pink-400 rounded-xl"><MapPin size={20} /></div>
                            <div><p className="text-gray-500 text-[10px] md:text-xs font-khmer uppercase font-bold">{t('Visit Us', 'អាសយដ្ឋាន')}</p><p className="text-white font-bold font-khmer text-sm md:text-base">ឫស្សីកែវ​, រាជធានីភ្នំពេញ</p></div>
                        </div>
                    </div>
                </div>
              </RevealOnScroll>

              <RevealOnScroll variant="slide-left" duration={1000} delay={200}>
                <div className="relative mt-8 lg:mt-0">
                    <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl opacity-10 blur-xl"></div>
                    <div className="relative bg-gray-950 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/10">
                        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-1.5 md:space-y-2">
                                    <label className="text-[10px] md:text-xs font-bold text-gray-500 ml-1 font-khmer uppercase tracking-wider">{t('Name', 'ឈ្មោះ')}</label>
                                    <input name="name" value={formData.name} onChange={handleChange} type="text" required className="w-full px-4 py-3 md:py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-khmer" placeholder="John Doe" />
                                </div>
                                <div className="space-y-1.5 md:space-y-2">
                                    <label className="text-[10px] md:text-xs font-bold text-gray-500 ml-1 font-khmer uppercase tracking-wider">{t('Email', 'អ៊ីមែល')}</label>
                                    <input name="email" value={formData.email} onChange={handleChange} type="email" required className="w-full px-4 py-3 md:py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-khmer" placeholder="john@example.com" />
                                </div>
                            </div>
                            <div className="space-y-1.5 md:space-y-2">
                                <label className="text-[10px] md:text-xs font-bold text-gray-500 ml-1 font-khmer uppercase tracking-wider">{t('Service', 'សេវាកម្ម')}</label>
                                <select name="service" value={formData.service} onChange={handleChange} className="w-full px-4 py-3 md:py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-khmer">
                                    <option value="Graphic Design">{t('Graphic Design', 'ការរចនាក្រាហ្វិក')}</option>
                                    <option value="Web Development">{t('Web Development', 'ការអភិវឌ្ឍវេបសាយ')}</option>
                                    <option value="Architecture">{t('Architecture', 'ស្ថាបត្យកម្ម')}</option>
                                    <option value="MVAC System">{t('MVAC System', 'ប្រព័ន្ធម៉ាស៊ីនត្រជាក់')}</option>
                                    <option value="Translation">{t('Translation', 'ការបកប្រែ')}</option>
                                    <option value="Other">{t('Other', 'ផ្សេងៗ')}</option>
                                </select>
                            </div>
                            <div className="space-y-1.5 md:space-y-2">
                                <label className="text-[10px] md:text-xs font-bold text-gray-500 ml-1 font-khmer uppercase tracking-wider">{t('Message', 'សារ')}</label>
                                <textarea name="message" value={formData.message} onChange={handleChange} rows={4} required className="w-full px-4 py-3 md:py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-khmer resize-none" placeholder={t('Tell us about your project...', 'ប្រាប់យើងអំពីគម្រោងរបស់អ្នក...')}></textarea>
                            </div>
                            {successMessage && <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center gap-3 text-green-400 text-xs md:text-sm font-khmer"><Check size={14} />{successMessage}</div>}
                            {errorMessage && <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs md:text-sm font-khmer"><AlertCircle size={14} />{errorMessage}</div>}
                            <button type="submit" disabled={isSubmitting} className="w-full py-3 md:py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base md:text-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 font-khmer disabled:opacity-70">
                                {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> {t('Sending...', 'កំពុងផ្ញើ...')}</> : <>{t('Send Request', 'ផ្ញើសំណើ')} <Send size={20} /></>}
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
