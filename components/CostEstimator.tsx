
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ScrollBackgroundText from './ScrollBackgroundText';
import RevealOnScroll from './RevealOnScroll';
import { Calculator, Monitor, Palette, Home, Smartphone, Check, RefreshCcw, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { hapticMedium, hapticSuccess } from '../utils/haptic';

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

const CostEstimator: React.FC = () => {
  const { t } = useLanguage();
  const [selectedService, setSelectedService] = useState<ServiceType>('web');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [currentStep, setCurrentStep] = useState<WizardStep>('service');

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
    hapticMedium();
    setSelectedAddOns(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleServiceChange = (id: ServiceType) => {
    hapticMedium();
    setSelectedService(id);
    setSelectedAddOns([]); // Reset addons when switching service
  };

  const goToNextStep = () => {
    hapticMedium();
    if (currentStep === 'service') {
      setCurrentStep('features');
    } else if (currentStep === 'features') {
      setCurrentStep('summary');
    }
  };

  const goToPrevStep = () => {
    hapticMedium();
    if (currentStep === 'features') {
      setCurrentStep('service');
    } else if (currentStep === 'summary') {
      setCurrentStep('features');
    }
  };

  const resetEstimator = () => {
    hapticSuccess();
    setSelectedService('web');
    setSelectedAddOns([]);
    setCurrentStep('service');
  };

  const progressPercentage = currentStep === 'service' ? 33 : currentStep === 'features' ? 66 : 100;

  return (
    <section id="estimator" className="py-24 bg-gray-900 relative overflow-hidden border-t border-white/5">
      <ScrollBackgroundText text="ESTIMATE" className="top-20" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold font-khmer ${currentStep === 'service' ? 'text-indigo-400' : 'text-gray-500'}`}>
                {t('Service', 'សេវាកម្ម')}
              </span>
              <span className={`text-sm font-bold font-khmer ${currentStep === 'features' ? 'text-indigo-400' : 'text-gray-500'}`}>
                {t('Features', 'មុខងារ')}
              </span>
              <span className={`text-sm font-bold font-khmer ${currentStep === 'summary' ? 'text-indigo-400' : 'text-gray-500'}`}>
                {t('Summary', 'សង្ខេប')}
              </span>
            </div>
            <span className="text-xs text-gray-500">{progressPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Wizard Container */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 min-h-[500px] flex flex-col">
          
          {/* STEP 1: Service Selection */}
          {currentStep === 'service' && (
            <div className="animate-fade-in space-y-8 flex-1">
              <div>
                <h3 className="text-2xl font-bold text-white font-khmer mb-2">
                  {t("Step 1: Select Your Service", "ជំហាន ១៖ ជ្រើសរើសសេវាកម្ម")}
                </h3>
                <p className="text-gray-400 font-khmer">{t("Choose the service that best fits your needs", "ជ្រើសរើសសេវាកម្មដែលសមស្របបំផុត")}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SERVICES_DATA.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceChange(service.id)}
                    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all duration-300 transform hover:scale-105 ${
                      selectedService === service.id
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25 scale-105'
                        : 'bg-gray-800 border-white/5 text-gray-400 hover:bg-gray-700 hover:border-white/10'
                    }`}
                  >
                    {service.icon}
                    <span className="font-bold text-sm font-khmer text-center">{t(service.label, service.labelKm)}</span>
                    <span className="text-xs text-gray-300 font-mono">${service.basePrice}</span>
                  </button>
                ))}
              </div>

              <div className="text-center text-gray-500 text-sm font-khmer">
                {t("Selected:", "បានជ្រើសរើស:")} <span className="text-white font-bold">{t(currentService.label, currentService.labelKm)}</span>
              </div>
            </div>
          )}

          {/* STEP 2: Features Selection */}
          {currentStep === 'features' && (
            <div className="animate-fade-in space-y-8 flex-1">
              <div>
                <h3 className="text-2xl font-bold text-white font-khmer mb-2">
                  {t("Step 2: Add Features", "ជំហាន ២៖ បន្ថែមមុខងារ")}
                </h3>
                <p className="text-gray-400 font-khmer">{t("Customize your project with additional features", "ដាក់ពង្រឹងគម្រោងរបស់អ្នកដោយបន្ថែមលក្ខណៈពិសេស")}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentService.addOns.map((addon) => (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddOn(addon.id)}
                    className={`flex items-center justify-between p-5 rounded-xl border cursor-pointer transition-all duration-200 transform hover:scale-102 ${
                      selectedAddOns.includes(addon.id)
                        ? 'bg-indigo-900/30 border-indigo-500/50 scale-102'
                        : 'bg-gray-800/50 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                        selectedAddOns.includes(addon.id) ? 'bg-indigo-500 border-indigo-500' : 'border-gray-500'
                      }`}>
                        {selectedAddOns.includes(addon.id) && <Check size={14} className="text-white" />}
                      </div>
                      <div>
                        <span className={`text-sm font-khmer block ${selectedAddOns.includes(addon.id) ? 'text-white font-bold' : 'text-gray-400'}`}>
                          {t(addon.label, addon.labelKm)}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-mono text-gray-500">+${addon.price}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-800/50 border border-white/5 rounded-xl p-4">
                <div className="text-sm text-gray-400 font-khmer mb-2">{t("Features Selected:", "មុខងារបានជ្រើសរើស:")}</div>
                <div className="text-lg text-white font-bold font-khmer">
                  {selectedAddOns.length === 0 ? t("None", "គ្មាន") : selectedAddOns.length}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Summary */}
          {currentStep === 'summary' && (
            <div className="animate-fade-in space-y-8 flex-1">
              <div>
                <h3 className="text-2xl font-bold text-white font-khmer mb-2">
                  {t("Step 3: Review Your Estimate", "ជំហាន ៣៖ ពិនិត្យលម្អិតតម្លៃ")}
                </h3>
                <p className="text-gray-400 font-khmer">{t("Here's your project summary and estimated cost", "នេះគឺជាសង្ខេបគម្រោងរបស់អ្នក និងតម្លៃប៉ាន់ស្មាន")}</p>
              </div>

              <div className="space-y-6">
                {/* Service Summary */}
                <div className="bg-gray-800/50 border border-white/5 rounded-xl p-6">
                  <h4 className="text-sm text-gray-400 uppercase tracking-wider font-khmer mb-4">{t("Selected Service", "សេវាកម្មដែលបានជ្រើសរើស")}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {currentService.icon}
                      <div>
                        <div className="text-white font-bold font-khmer">{t(currentService.label, currentService.labelKm)}</div>
                        <div className="text-xs text-gray-500">{t("Base Price", "តម្លៃគោល")}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">${currentService.basePrice}</div>
                  </div>
                </div>

                {/* Features Summary */}
                {selectedAddOns.length > 0 && (
                  <div className="bg-gray-800/50 border border-white/5 rounded-xl p-6">
                    <h4 className="text-sm text-gray-400 uppercase tracking-wider font-khmer mb-4">{t("Added Features", "មុខងារបន្ថែម")}</h4>
                    <div className="space-y-3">
                      {selectedAddOns.map(id => {
                        const item = currentService.addOns.find(a => a.id === id);
                        if (!item) return null;
                        return (
                          <div key={id} className="flex justify-between items-center">
                            <span className="text-gray-300 font-khmer">{t(item.label, item.labelKm)}</span>
                            <span className="text-green-400 font-mono font-bold">+${item.price}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Total Cost */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-center">
                  <div className="text-gray-200 text-sm uppercase tracking-wider font-khmer mb-2">{t("Total Estimated Cost", "តម្លៃសរុបប៉ាន់ស្មាន")}</div>
                  <div className="text-5xl font-black text-white font-mono mb-2">${totalCost}</div>
                  <div className="text-xs text-indigo-200 font-khmer">{t("*Final price may vary based on requirements", "*តម្លៃចុងក្រោយអាចផ្លាស់ប្តូរដោយផ្អែកលើតម្រូវការ")}</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-12 pt-8 border-t border-white/10">
            <button
              onClick={goToPrevStep}
              disabled={currentStep === 'service'}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all font-khmer ${
                currentStep === 'service'
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              <ChevronLeft size={18} /> {t("Back", "ថយក្រោយ")}
            </button>

            {currentStep !== 'summary' ? (
              <button
                onClick={goToNextStep}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all font-khmer"
              >
                {t("Next", "បន្ទាប់")} <ChevronRight size={18} />
              </button>
            ) : (
              <>
                <a 
                  href={`mailto:creative.ponloe.org@gmail.com?subject=Quote Request for ${currentService.label}&body=I am interested in a ${currentService.label} project with the following features: ${selectedAddOns.join(', ')}. Estimated budget: $${totalCost}.`}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-white text-gray-950 hover:bg-gray-200 transition-all font-khmer"
                >
                  {t("Get Official Quote", "ស្នើសុំតម្លៃផ្លូវការ")} <ArrowRight size={18} />
                </a>
                <button 
                  onClick={resetEstimator}
                  className="px-6 py-3 rounded-xl font-bold bg-white/5 text-gray-400 hover:bg-white/10 transition-all font-khmer flex items-center gap-2"
                >
                  <RefreshCcw size={18} /> {t("Reset", "ឡើងវិញ")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
    </section>
  );
};

export default CostEstimator;
