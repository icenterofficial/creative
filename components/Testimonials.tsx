import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TESTIMONIALS } from '../constants';
import { Quote, Star, MessageSquare, X, Send, User, Briefcase, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import ScrollBackgroundText from './ScrollBackgroundText';
import RevealOnScroll from './RevealOnScroll';
import { getSupabaseClient } from '../lib/supabase';
import { Testimonial } from '../types';

const Testimonials: React.FC = () => {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Testimonial[]>(TESTIMONIALS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formMsg, setFormMsg] = useState('');

  // Fetch Reviews from DB
  useEffect(() => {
    const fetchReviews = async () => {
        const supabase = getSupabaseClient();
        if(!supabase) return;

        const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if(data && data.length > 0) {
            // Merge DB reviews with static ones, or just replace.
            // Let's prepend DB reviews to static ones so they appear first in marquee
            const dbReviews: Testimonial[] = data.map((r:any) => ({
                id: r.id,
                name: r.name,
                role: r.role || 'Client',
                company: r.company || '',
                content: r.content,
                contentKm: r.content, // Fallback
                avatar: r.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=random`
            }));
            
            // Combine: New DB reviews first + original static reviews
            setReviews([...dbReviews, ...TESTIMONIALS]);
        }
    };
    fetchReviews();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    const supabase = getSupabaseClient();
    
    // Fallback if no supabase
    if(!supabase) {
        setTimeout(() => {
            setIsSending(false);
            setIsSubmitted(true);
        }, 1000);
        return;
    }

    try {
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formName)}&background=random`;
        
        const { error } = await supabase.from('reviews').insert({
            name: formName,
            role: formRole.split(' at ')[0] || 'Client', // Simple parsing
            company: formRole.split(' at ')[1] || '',
            content: formMsg,
            rating: rating || 5,
            avatar: avatarUrl
        });

        if(error) throw error;

        setIsSubmitted(true);
    } catch(err) {
        console.error(err);
        alert("Failed to submit review.");
    } finally {
        setIsSending(false);
    }
  };

  const resetForm = () => {
      setIsModalOpen(false);
      setTimeout(() => {
          setIsSubmitted(false);
          setRating(0);
          setFormName('');
          setFormRole('');
          setFormMsg('');
      }, 300);
  };

  return (
    <section className="py-24 bg-gray-900 overflow-hidden relative border-y border-white/5">
      {/* Background Text */}
      <ScrollBackgroundText text="STORIES" className="top-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center relative z-10">
        <RevealOnScroll>
          <h2 className="text-3xl md:text-4xl font-bold text-white font-khmer mb-6">
             {t('Client', 'សក្ខីកម្ម')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{t('Stories', 'អតិថិជន')}</span>
          </h2>
          
          <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/30 transition-all font-khmer text-sm font-bold shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]"
          >
              <MessageSquare size={16} className="text-purple-400" />
              {t('Share Your Experience', 'ចែករំលែកបទពិសោធន៍របស់អ្នក')}
          </button>
        </RevealOnScroll>
      </div>

      {/* Infinite Scrolling Marquee */}
      <div className="relative w-full overflow-hidden z-10">
        <RevealOnScroll delay={200}>
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-900 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-900 to-transparent z-10" />
          
          <div className="flex animate-scroll gap-6 w-max hover:pause">
            {/* Double map to ensure seamless loop - Using the State 'reviews' instead of constant */}
            {[...reviews, ...reviews].map((tm, idx) => (
              <div 
                key={`${tm.id}-${idx}`}
                className="w-[350px] md:w-[450px] bg-white/5 backdrop-blur-sm border border-white/5 p-8 rounded-2xl shrink-0 hover:bg-white/10 transition-colors"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} className="text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                
                <div className="mb-6 relative">
                   <Quote className="absolute -top-2 -left-2 text-indigo-500/20 transform scale-150 rotate-180" size={40} />
                   <p className="text-gray-300 text-lg relative z-10 italic font-khmer line-clamp-4">
                      "{t(tm.content, tm.contentKm || tm.content)}"
                   </p>
                </div>

                <div className="flex items-center gap-4">
                  <img 
                    src={tm.avatar} 
                    alt={tm.name} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/30 bg-gray-800" 
                  />
                  <div>
                    <h4 className="text-white font-bold">{tm.name}</h4>
                    <p className="text-indigo-400 text-xs">{tm.role} {tm.company ? `, ${tm.company}` : ''}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </div>

      {/* Review Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-gray-950/90 backdrop-blur-md animate-fade-in"
                onClick={resetForm}
            />

            <div className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
                    <h3 className="text-xl font-bold text-white font-khmer">
                        {isSubmitted ? t('Thank You!', 'សូមអរគុណ!') : t('Write a Review', 'សរសេរការវាយតម្លៃ')}
                    </h3>
                    <button onClick={resetForm} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {isSubmitted ? (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send size={32} />
                            </div>
                            <h4 className="text-2xl font-bold text-white mb-2 font-khmer">{t('Feedback Received', 'ទទួលបានមតិយោបល់')}</h4>
                            <p className="text-gray-400 font-khmer">
                                {t(
                                    'Your review has been submitted successfully. Thank you for sharing your experience with us!', 
                                    'ការវាយតម្លៃរបស់អ្នកត្រូវបានដាក់ស្នើដោយជោគជ័យ។ សូមអរគុណសម្រាប់ការចែករំលែកបទពិសោធន៍របស់អ្នកជាមួយយើង!'
                                )}
                            </p>
                            <button 
                                onClick={resetForm}
                                className="mt-8 px-8 py-3 bg-white text-gray-950 rounded-full font-bold hover:bg-gray-200 transition-colors font-khmer"
                            >
                                {t('Close', 'បិទ')}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Star Rating */}
                            <div className="flex flex-col items-center gap-2 mb-6">
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider font-khmer">{t('Rate your experience', 'វាយតម្លៃបទពិសោធន៍របស់អ្នក')}</span>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star 
                                                size={32} 
                                                className={`transition-colors ${
                                                    star <= (hoverRating || rating) 
                                                    ? 'text-yellow-400 fill-yellow-400' 
                                                    : 'text-gray-600 fill-gray-900'
                                                }`} 
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 ml-1 font-khmer">{t('Name', 'ឈ្មោះ')}</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input 
                                            required 
                                            value={formName}
                                            onChange={e => setFormName(e.target.value)}
                                            type="text" 
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-600 font-khmer text-sm" 
                                            placeholder={t('Your Name', 'ឈ្មោះរបស់អ្នក')} 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 ml-1 font-khmer">{t('Role / Company', 'តួនាទី / ក្រុមហ៊ុន')}</label>
                                    <div className="relative">
                                        <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input 
                                            value={formRole}
                                            onChange={e => setFormRole(e.target.value)}
                                            type="text" 
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-600 font-khmer text-sm" 
                                            placeholder={t('CEO at Company', 'នាយកប្រតិបត្តិ')} 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 ml-1 font-khmer">{t('Message', 'សារ')}</label>
                                <textarea 
                                    required 
                                    value={formMsg}
                                    onChange={e => setFormMsg(e.target.value)}
                                    rows={4} 
                                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-600 font-khmer text-sm resize-none" 
                                    placeholder={t('Share your thoughts...', 'ចែករំលែកមតិរបស់អ្នក...')} 
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSending}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 font-khmer disabled:opacity-50"
                            >
                                {isSending ? <Loader2 size={18} className="animate-spin"/> : <><span className="font-khmer">{t('Submit Review', 'បញ្ជូនការវាយតម្លៃ')}</span> <Send size={18} /></>}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .hover\\:pause:hover {
          animation-play-state: paused;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
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

export default Testimonials;
