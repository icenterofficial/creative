import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ScrollBackgroundText from './ScrollBackgroundText';
import RevealOnScroll from './RevealOnScroll';
import { 
  Calculator, Monitor, Palette, Home, Smartphone, Check, 
  RefreshCcw, ArrowRight, ChevronLeft, ChevronRight, Zap 
} from 'lucide-react';
import { hapticMedium, hapticSuccess } from '../utils/haptic';
import { useRouter } from '../hooks/useRouter';

type ServiceType = 'web' | 'app' | 'design' | 'architecture';
type WizardStep = 'service' | 'features' | 'summary';

interface AddOn {
  id: string;
  label: string;
  labelKm: string;
  price: number;
}

interface ServiceOption {
  id: ServiceType;
  label: string;
  labelKm: string;
  icon: React.ReactNode;
  basePrice: number;
  addOns: AddOn[];
}

interface CostEstimatorProps {
  showPopupOnMount?: boolean;
  usePathRouting?: boolean;
}

const CostEstimator: React.FC<CostEstimatorProps> = ({ showPopupOnMount = false, usePathRouting = false }) => {
  const { t } = useLanguage();
  const [selectedService, setSelectedService] = useState<ServiceType>('web');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [currentStep, setCurrentStep] = useState<WizardStep>('service');

  // Use Router Hook
  const { activeId } = useRouter('estimator', '', usePathRouting);

  const SERVICES_DATA: ServiceOption[] = [
    {
      id: 'web',
      label: 'Website',
      labelKm: 'គេហទំព័រ',
      icon: <Monitor size={32} strokeWidth={1.5} />,
      basePrice: 300,
      addOns: [
        { id: 'cms', label: 'CMS (Admin Panel)', labelKm: 'ប្រព័ន្ធគ្រប់គ្រង (Admin)', price: 200 },
        { id: 'ecommerce', label: 'E-commerce', labelKm: 'ប្រព័ន្ធលក់ទំនិញ', price: 500 },
        { id: 'seo', label: 'Advanced SEO', labelKm: 'SEO កម្រិតខ្ពស់', price: 150 },
        { id: 'multi-lang', label: 'Multi-language', labelKm: 'ពហុភាសា', price: 100 },
      ]
    },
    {
      id: 'app',
      label: 'Mobile App',
      labelKm: 'កម្មវិធីទូរស័ព្ទ',
      icon: <Smartphone size={32} strokeWidth={1.5} />,
      basePrice: 800,
      addOns: [
        { id: 'ios-android', label: 'Both iOS & Android', labelKm: 'ទាំង iOS និង Android', price: 400 },
        { id: 'auth', label: 'User Login/Auth', labelKm: 'ប្រព័ន្ធចុះឈ្មោះអ្នកប្រើ', price: 200 },
        { id: 'api', label: 'Custom API Integration', labelKm: 'ការតភ្ជាប់ API', price: 300 },
        { id: 'notifications', label: 'Push Notifications', labelKm: 'ការជូនដំណឹង (Noti)', price: 150 },
      ]
    },
    {
      id: 'design',
      label: 'Graphic Design',
      labelKm: 'រចនាក្រាហ្វិក',
      icon: <Palette size={32} strokeWidth={1.5} />,
      basePrice: 0,
      addOns: [
        { id: 'poster_1pc', label: 'Poster Design (1pc)', labelKm: 'រចនាផ្ទាំងរូបភាព (1pc)', price: 10 },
        { id: 'poster_10pc', label: 'Poster Package (10pcs)', labelKm: 'កញ្ចប់រចនាផ្ទាំងរូបភាព (10pcs)', price: 95 },
        { id: 'poster_15pc', label: 'Monthly Package (15pcs)', labelKm: 'កញ្ចប់រចនាផ្ទាំងរូបភាពប្រចាំខែ (15pcs)', price: 130 },
        { id: 'poster_event', label: 'Event Poster (1pc)', labelKm: 'កញ្ចប់រចនាផ្ទាំងរូបភាពបុណ្យជាតិ (1pc)', price: 10 },
        { id: 'logo_new', label: 'Logo Design (New)', labelKm: 'រចនាផ្លាកសញ្ញាថ្មី (1pc)', price: 69 },
        { id: 'logo_redesign', label: 'Logo Redesign', labelKm: 'រចនាផ្លាកសញ្ញាឡើងវិញ (Redesign)', price: 22 },
        { id: 'logo_branding', label: 'Logo + Branding Guideline', labelKm: 'រចនាផ្លាកសញ្ញា + Branding Guideline', price: 99 },
        { id: 'fb_cover', label: 'Facebook Cover', labelKm: 'រចនា Facebook Cover (1pc)', price: 11 },
        { id: 'menu_design', label: 'Menu Design', labelKm: 'រចនារចនាសម្ព័ន្ធផ្សេងៗ (Menu)', price: 13 },
      ]
    },
    {
      id: 'architecture',
      label: 'Architecture (3D)',
      labelKm: 'ស្ថាបត្យកម្ម (3D Concept)',
      icon: <Home size={32} strokeWidth={1.5} />,
      basePrice: 0, // Base price 0, sum depends on selection
      addOns: [
        // Items from the image provided, priced competitively (30-40% cheaper than market)
        { id: 'fence_gate', label: 'Steel Fence/Gate Design', labelKm: 'រចនាទ្វាររបងដែកស្វិត', price: 40 },
        { id: 'association_house', label: 'Association House Design', labelKm: 'រចនាផ្ទះជំនួយពីសមាគម', price: 85 },
        { id: 'coffee_shop', label: 'Coffee Shop Design', labelKm: 'រចនាហាងកាហ្វេ', price: 120 },
        { id: 'restaurant', label: 'Restaurant Design', labelKm: 'រចនាភោជនីយដ្ឋាន', price: 150 },
        { id: 'villa', label: 'Villa House Design', labelKm: 'រចនាផ្ទះវីឡា', price: 220 },
        { id: 'school', label: 'School Design', labelKm: 'រចនាសាលារៀន', price: 350 },
        // Add-on for details
        { id: '2d_layout', label: '2D Layout Plan', labelKm: 'ប្លង់រៀបចំសង្ហារឹម (2D Layout)', price: 50 },
      ]
    }
  ];

  const currentService = SERVICES_DATA.find(s => s.id === selectedService)!;

  useEffect(() => {
    let total = currentService.basePrice;
    selectedAddOns.forEach(addOnId => {
      const addon = currentService.addOns.find(a => a.id === addOnId);
      if (addon) total += addon.price;
    });
    setTotalCost(total);
  }, [selectedService, selectedAddOns, currentService]);

  const toggleAddOn = (id: string) => {
    hapticMedium();
    setSelectedAddOns(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleServiceChange = (id: ServiceType) => {
    hapticMedium();
    setSelectedService(id);
    setSelectedAddOns([]);
  };

  const goToNextStep = () => {
    hapticMedium();
    if (currentStep === 'service') setCurrentStep('features');
    else if (currentStep === 'features') setCurrentStep('summary');
  };

  const goToPrevStep = () => {
    hapticMedium();
    if (currentStep === 'features') setCurrentStep('service');
    else if (currentStep === 'summary') setCurrentStep('features');
  };

  const resetEstimator = () => {
    hapticSuccess();
    setSelectedService('web');
    setSelectedAddOns([]);
    setCurrentStep('service');
  };

  const progressPercentage = currentStep === 'service' ? 33 : currentStep === 'features' ? 66 : 100;

  return (
    <section id="estimator" className="py-24 bg-gray-950 relative overflow-hidden border-t border-white/5">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <ScrollBackgroundText text="ESTIMATE" className="top-20 opacity-50" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6 backdrop-blur-sm">
                <Calculator size={18} />
                <span className="font-bold text-sm font-khmer uppercase tracking-wide">{t("Cost Estimator", "ឧបករណ៍គណនាតម្លៃ")}</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white font-khmer leading-tight mb-6 tracking-tight drop-shadow-lg">
              {t("Calculate Your", "គណនា")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">{t("Investment", "តម្លៃគម្រោង")}</span>
            </h2>
            
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto font-khmer text-lg leading-relaxed">
              {t(
                "Get a quick estimate for your project. Choose a service and customize features to see the approximate cost.",
                "ទទួលបានតម្លៃប៉ាន់ស្មានសម្រាប់គម្រោងរបស់អ្នក។ ជ្រើសរើសសេវាកម្ម និងមុខងារបន្ថែមដើម្បីមើលតម្លៃប្រហាក់ប្រហែល។"
              )}
            </p>
          </div>
        </RevealOnScroll>

        {/* --- MAIN CARD --- */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-[40px] p-6 md:p-12 shadow-2xl relative overflow-hidden">
          
          {/* Progress Bar Top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-800">
             <div 
               className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] transition-all duration-700 ease-out"
               style={{ width: `${progressPercentage}%` }}
             />
          </div>

          <div className="flex flex-col min-h-[550px]">
            {/* Steps Indicator */}
            <div className="flex justify-between items-center mb-12 px-2">
                 {['service', 'features', 'summary'].map((step, idx) => {
                     const isActive = step === currentStep;
                     const isCompleted = (step === 'service' && currentStep !== 'service') || (step === 'features' && currentStep === 'summary');
                     
                     return (
                         <div key={step} className={`flex items-center gap-2 md:gap-3 transition-colors duration-300 ${isActive || isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all
                                 ${isActive ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-110' : 
                                   isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-transparent border-gray-600 text-gray-400'}
                             `}>
                                 {isCompleted ? <Check size={16} /> : idx + 1}
                             </div>
                             <span className="hidden md:block font-bold font-khmer text-sm tracking-wide text-white">
                                {step === 'service' ? t('Service', 'សេវាកម្ម') : 
                                 step === 'features' ? t('Features', 'មុខងារ') : 
                                 t('Summary', 'សង្ខេប')}
                             </span>
                         </div>
                     );
                 })}
            </div>

            {/* Content Area */}
            <div className="flex-1">
              
              {/* STEP 1: SERVICE */}
              {currentStep === 'service' && (
                <div className="animate-fade-in space-y-8">
                  <div className="text-center md:text-left">
                    <h3 className="text-3xl font-bold text-white font-khmer mb-2">{t("Step 1: Select Service", "ជំហាន ១៖ ជ្រើសរើសសេវាកម្ម")}</h3>
                    <p className="text-gray-400 font-khmer">{t("Choose the service that best fits your needs", "ជ្រើសរើសសេវាកម្មដែលសមស្របបំផុតសម្រាប់អ្នក")}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {SERVICES_DATA.map((service) => {
                      const isSelected = selectedService === service.id;
                      return (
                        <button
                          key={service.id}
                          onClick={() => handleServiceChange(service.id)}
                          className={`group relative flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border-2 transition-all duration-300
                            ${isSelected 
                              ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.2)]' 
                              : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'}
                          `}
                        >
                          <div className={`p-4 rounded-2xl transition-all duration-300 ${isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700 group-hover:text-white'}`}>
                             {service.icon}
                          </div>
                          
                          <div className="text-center">
                              <span className={`block font-bold text-lg font-khmer mb-1 ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                {t(service.label, service.labelKm)}
                              </span>
                              {/* Only show base price if it's not 0 */}
                              <span className={`text-sm font-mono font-bold ${isSelected ? 'text-indigo-300' : 'text-gray-500'}`}>
                                {service.basePrice > 0 ? `$${service.basePrice}` : t('Select items', 'ជ្រើសរើសមុខងារ')}
                              </span>
                          </div>
                          
                          {/* Selection Ring Animation */}
                          {isSelected && (
                              <div className="absolute inset-0 border-2 border-indigo-500 rounded-3xl animate-pulse-slow pointer-events-none" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: FEATURES */}
              {currentStep === 'features' && (
                <div className="animate-fade-in space-y-8">
                   <div className="text-center md:text-left flex items-center justify-between">
                    <div>
                        <h3 className="text-3xl font-bold text-white font-khmer mb-2">{t("Step 2: Add Features", "ជំហាន ២៖ បន្ថែមមុខងារ")}</h3>
                        <p className="text-gray-400 font-khmer">{t("Customize your project with additional features", "ដាក់ពង្រឹងគម្រោងរបស់អ្នកដោយបន្ថែមលក្ខណៈពិសេស")}</p>
                    </div>
                    <div className="hidden md:block text-right">
                        <p className="text-sm text-gray-500 uppercase font-bold mb-1">{t("Current Total", "តម្លៃបច្ចុប្បន្ន")}</p>
                        <p className="text-3xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">${totalCost}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentService.addOns.map((addon) => {
                       const isSelected = selectedAddOns.includes(addon.id);
                       return (
                        <div
                          key={addon.id}
                          onClick={() => toggleAddOn(addon.id)}
                          className={`relative flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 group
                            ${isSelected
                              ? 'bg-indigo-900/20 border-indigo-500 shadow-inner'
                              : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'}
                          `}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shrink-0
                              ${isSelected ? 'bg-indigo-500 text-white scale-110' : 'bg-gray-800 text-transparent border border-gray-600 group-hover:border-gray-400'}
                            `}>
                              <Check size={16} strokeWidth={3} />
                            </div>
                            <div>
                              <span className={`text-lg font-khmer block transition-colors ${isSelected ? 'text-white font-bold' : 'text-gray-300'}`}>
                                {t(addon.label, addon.labelKm)}
                              </span>
                            </div>
                          </div>
                          <span className={`text-lg font-mono font-bold transition-colors ${isSelected ? 'text-indigo-400' : 'text-gray-500'}`}>
                            +${addon.price}
                          </span>
                        </div>
                       );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: SUMMARY */}
              {currentStep === 'summary' && (
                <div className="animate-fade-in flex flex-col items-center justify-center h-full py-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 mb-6 animate-scale-up">
                    <Zap size={40} className="text-white fill-white" />
                  </div>
                  
                  <h3 className="text-3xl font-bold text-white font-khmer mb-2 text-center">{t("Estimated Investment", "តម្លៃវិនិយោគប៉ាន់ស្មាន")}</h3>
                  <p className="text-gray-400 font-khmer text-center mb-8">{t("Based on your selected preferences", "យោងតាមជម្រើសដែលអ្នកបានជ្រើសរើស")}</p>

                  <div className="w-full max-w-lg bg-gray-800/80 rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                    {/* Glow Effect behind card */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[35px] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-center pb-6 border-b border-white/10 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                                    {currentService.icon}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">{t("Base Service", "សេវាកម្មមូលដ្ឋាន")}</p>
                                    <p className="text-xl font-bold text-white font-khmer">{t(currentService.label, currentService.labelKm)}</p>
                                </div>
                            </div>
                            <span className="text-xl font-mono font-bold text-gray-300">${currentService.basePrice}</span>
                        </div>
                        
                        {selectedAddOns.length > 0 ? (
                            <div className="space-y-3 mb-8">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">{t("Add-ons", "មុខងារបន្ថែម")}</p>
                                {selectedAddOns.map(id => {
                                const addon = currentService.addOns.find(a => a.id === id)!;
                                return (
                                    <div key={id} className="flex justify-between items-center text-sm group/item">
                                        <span className="text-gray-300 font-khmer flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            {t(addon.label, addon.labelKm)}
                                        </span>
                                        <span className="text-gray-400 font-mono">+${addon.price}</span>
                                    </div>
                                );
                                })}
                            </div>
                        ) : (
                            <div className="mb-8 p-4 bg-white/5 rounded-xl text-center text-gray-500 text-sm font-khmer italic">
                                {t("No additional features selected.", "មិនមានមុខងារបន្ថែមត្រូវបានជ្រើសរើសទេ។")}
                            </div>
                        )}

                        <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                            <span className="text-lg font-bold text-gray-400 font-khmer">{t("Total Estimate", "តម្លៃសរុប")}:</span>
                            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 font-mono tracking-tight">
                                ${totalCost}
                            </span>
                        </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
            
            {/* Navigation Footer */}
            <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-8">
                {/* Back Button */}
                <button
                    onClick={goToPrevStep}
                    disabled={currentStep === 'service'}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold font-khmer transition-all
                        ${currentStep === 'service' 
                            ? 'opacity-0 pointer-events-none' 
                            : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'}
                    `}
                >
                    <ChevronLeft size={20} /> {t("Back", "ថយក្រោយ")}
                </button>

                {/* Primary Action Button */}
                {currentStep === 'summary' ? (
                    <button
                        onClick={resetEstimator}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all font-khmer active:scale-95 group"
                    >
                        <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" /> {t("Calculate New", "គណនាថ្មី")}
                    </button>
                ) : (
                    <button
                        onClick={goToNextStep}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-gray-900 font-bold hover:bg-indigo-50 transition-all font-khmer active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                    >
                        {t("Continue", "បន្ត")} <ChevronRight size={20} />
                    </button>
                )}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <RevealOnScroll delay={200}>
          <div className="mt-16 text-center">
            <p className="text-gray-500 text-sm font-khmer mb-8 max-w-xl mx-auto opacity-70">
              {t(
                "*This is an approximate estimation based on standard requirements. Actual pricing may vary based on specific needs and complexity.",
                "*នេះគ្រាន់តែជាតម្លៃប៉ាន់ស្មានប៉ុណ្ណោះ។ តម្លៃជាក់ស្តែងអាចប្រែប្រួលទៅតាមតម្រូវការជាក់លាក់ និងភាពស្មុគស្មាញនៃគម្រោង។"
              )}
            </p>
            <button 
                onClick={() => {
                   window.location.hash = 'contact';
                }}
                className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-lg hover:from-indigo-500 hover:to-blue-500 transition-all shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-1 font-khmer"
            >
              {t("Get Official Quote", "ទទួលបានការដកស្រង់តម្លៃផ្លូវការ")} 
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default CostEstimator;
