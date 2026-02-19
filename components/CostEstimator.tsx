
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ScrollBackgroundText from './ScrollBackgroundText';
import RevealOnScroll from './RevealOnScroll';
import { Calculator, Monitor, Palette, Home, Smartphone, Check, RefreshCcw, ArrowRight } from 'lucide-react';

type ServiceType = 'web' | 'app' | 'design' | 'architecture';

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

const CostEstimator: React.FC = () => {
  const { t } = useLanguage();
  const [selectedService, setSelectedService] = useState<ServiceType>('web');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [totalCost, setTotalCost] = useState(0);

  const SERVICES_DATA: ServiceOption[] = [
    {
      id: 'web',
      label: 'Website',
      labelKm: 'គេហទំព័រ',
      icon: <Monitor size={24} />,
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
      icon: <Smartphone size={24} />,
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
      icon: <Palette size={24} />,
      basePrice: 50,
      addOns: [
        { id: 'logo', label: 'Logo Design', labelKm: 'រចនាឡូហ្គោ', price: 100 },
        { id: 'branding', label: 'Full Branding Kit', labelKm: 'កញ្ចប់ម៉ាកយីហោពេញលេញ', price: 250 },
        { id: 'social', label: 'Social Media Pack (5 Posts)', labelKm: 'រូបភាពផុស Facebook (៥ រូប)', price: 80 },
        { id: 'print', label: 'Print Materials', labelKm: 'សម្ភារៈបោះពុម្ព', price: 120 },
      ]
    },
    {
      id: 'architecture',
      label: 'Architecture',
      labelKm: 'ស្ថាបត្យកម្ម',
      icon: <Home size={24} />,
      basePrice: 500,
      addOns: [
        { id: '3d-ext', label: '3D Exterior Rendering', labelKm: 'រចនា 3D ផ្នែកខាងក្រៅ', price: 300 },
        { id: '3d-int', label: '3D Interior Design', labelKm: 'រចនា 3D ផ្នែកខាងក្នុង', price: 400 },
        { id: 'blueprint', label: 'Construction Blueprint', labelKm: 'ប្លង់សាងសង់លម្អិត', price: 500 },
        { id: 'video', label: 'Walkthrough Video', labelKm: 'វីដេអូបង្ហាញគម្រោង', price: 250 },
      ]
    }
  ];

  const currentService = SERVICES_DATA.find(s => s.id === selectedService)!;

  useEffect(() => {
    // Calculate total
    let total = currentService.basePrice;
    selectedAddOns.forEach(addOnId => {
      const addon = currentService.addOns.find(a => a.id === addOnId);
      if (addon) total += addon.price;
    });
    setTotalCost(total);
  }, [selectedService, selectedAddOns, currentService]);

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleServiceChange = (id: ServiceType) => {
    setSelectedService(id);
    setSelectedAddOns([]); // Reset addons when switching service
  };

  return (
    <section id="estimator" className="py-24 bg-gray-900 relative overflow-hidden border-t border-white/5">
      <ScrollBackgroundText text="ESTIMATE" className="top-20" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 animate-bounce">
                <Calculator size={20} />
                <span className="font-bold text-sm font-khmer">{t("Cost Estimator", "ឧបករណ៍គណនាតម្លៃ")}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white font-khmer">
              {t("Calculate Your", "គណនា")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">{t("Investment", "តម្លៃគម្រោង")}</span>
            </h2>
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto font-khmer">
              {t(
                "Get a quick estimate for your project. Choose a service and customize features to see the approximate cost.",
                "ទទួលបានតម្លៃប៉ាន់ស្មានសម្រាប់គម្រោងរបស់អ្នក។ ជ្រើសរើសសេវាកម្ម និងមុខងារបន្ថែមដើម្បីមើលតម្លៃប្រហាក់ប្រហែល។"
              )}
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT: Inputs */}
          <div className="lg:col-span-8 space-y-8">
            {/* Service Selection */}
            <RevealOnScroll delay={100} variant="slide-right">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4 font-khmer flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
                  {t("Select Service", "ជ្រើសរើសសេវាកម្ម")}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {SERVICES_DATA.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceChange(service.id)}
                      className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
                        selectedService === service.id
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25 scale-105'
                          : 'bg-gray-800 border-white/5 text-gray-400 hover:bg-gray-700 hover:border-white/10'
                      }`}
                    >
                      {service.icon}
                      <span className="font-bold text-sm font-khmer">{t(service.label, service.labelKm)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </RevealOnScroll>

            {/* Features Selection */}
            <RevealOnScroll delay={200} variant="slide-right">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4 font-khmer flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
                  {t("Add Features", "បន្ថែមមុខងារ")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentService.addOns.map((addon) => (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddOn(addon.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        selectedAddOns.includes(addon.id)
                          ? 'bg-indigo-900/30 border-indigo-500/50'
                          : 'bg-gray-800/50 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          selectedAddOns.includes(addon.id) ? 'bg-indigo-500 border-indigo-500' : 'border-gray-500'
                        }`}>
                          {selectedAddOns.includes(addon.id) && <Check size={12} className="text-white" />}
                        </div>
                        <span className={`text-sm font-khmer ${selectedAddOns.includes(addon.id) ? 'text-white font-bold' : 'text-gray-400'}`}>
                          {t(addon.label, addon.labelKm)}
                        </span>
                      </div>
                      <span className="text-sm font-mono text-gray-500">+${addon.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* RIGHT: Result Card */}
          <div className="lg:col-span-4">
            <RevealOnScroll delay={300} variant="slide-left" className="sticky top-24">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                {/* Decorative Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-[50px] pointer-events-none"></div>
                
                <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-6 font-khmer">{t("Estimated Cost", "តម្លៃប៉ាន់ស្មាន")}</h3>
                
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-black text-white tracking-tight">${totalCost}</span>
                  <span className="text-xl text-gray-500 font-bold">+</span>
                </div>
                <p className="text-xs text-gray-500 mb-8 font-khmer">
                  {t("*This is a rough estimate. Final price may vary.", "*នេះគ្រាន់តែជាតម្លៃប៉ាន់ស្មានបឋម។")}
                </p>

                <div className="space-y-4 mb-8 border-t border-white/10 pt-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-khmer">{t("Base Price", "តម្លៃគោល")}</span>
                    <span className="text-white font-mono">${currentService.basePrice}</span>
                  </div>
                  {selectedAddOns.map(id => {
                    const item = currentService.addOns.find(a => a.id === id);
                    if (!item) return null;
                    return (
                      <div key={id} className="flex justify-between text-sm">
                        <span className="text-gray-400 font-khmer">{t(item.label, item.labelKm)}</span>
                        <span className="text-green-400 font-mono">+${item.price}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  <a 
                    href={`mailto:creative.ponloe.org@gmail.com?subject=Quote Request for ${currentService.label}&body=I am interested in a ${currentService.label} project with the following features: ${selectedAddOns.join(', ')}. Estimated budget: $${totalCost}.`}
                    className="block w-full py-4 rounded-xl bg-white text-gray-950 font-bold text-center hover:bg-gray-200 transition-colors font-khmer flex items-center justify-center gap-2"
                  >
                    {t("Get Official Quote", "ស្នើសុំតម្លៃផ្លូវការ")} <ArrowRight size={18} />
                  </a>
                  <button 
                    onClick={() => { setSelectedAddOns([]); setTotalCost(currentService.basePrice); }}
                    className="block w-full py-3 rounded-xl bg-white/5 text-gray-400 font-bold text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2 font-khmer"
                  >
                    <RefreshCcw size={14} /> {t("Reset Calculator", "គណនាឡើងវិញ")}
                  </button>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CostEstimator;
