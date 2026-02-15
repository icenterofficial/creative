import React from 'react';
import PageOverlay from './PageOverlay';
import { useLanguage } from '../contexts/LanguageContext';
import { ShieldCheck } from 'lucide-react';

interface PrivacyPolicyProps {
  onClose: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  const { t } = useLanguage();

  return (
    <PageOverlay title={t("Privacy Policy", "គោលការណ៍​ភាព​ឯកជន")} bgText="PRIVACY" onClose={onClose}>
        <div className="max-w-3xl mx-auto">
             <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
                 <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                    <ShieldCheck size={32} />
                 </div>
                 <div>
                     <h1 className="text-3xl font-bold text-white font-khmer">{t("Privacy Policy", "គោលការណ៍​ភាព​ឯកជន")}</h1>
                     <p className="text-gray-400 text-sm mt-1">Last Updated: March 2025</p>
                 </div>
             </div>

             <div className="space-y-10 text-gray-300 leading-relaxed font-khmer">
                 <section>
                     <h2 className="text-xl font-bold text-white mb-4">1. Introduction</h2>
                     <p>
                         Ponloe Creative ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or use our services.
                     </p>
                 </section>

                 <section>
                     <h2 className="text-xl font-bold text-white mb-4">2. Information We Collect</h2>
                     <p className="mb-4">We may collect personal information that you voluntarily provide to us when you:</p>
                     <ul className="list-disc pl-5 space-y-2 text-gray-400">
                         <li>Contact us via our contact form or email.</li>
                         <li>Apply for a job position.</li>
                         <li>Sign up for our newsletter.</li>
                     </ul>
                     <p className="mt-4">This information may include your name, email address, phone number, and any other details you choose to provide.</p>
                 </section>

                 <section>
                     <h2 className="text-xl font-bold text-white mb-4">3. How We Use Your Information</h2>
                     <p>We use the information we collect to:</p>
                     <ul className="list-disc pl-5 space-y-2 text-gray-400 mt-2">
                         <li>Respond to your inquiries and provide customer support.</li>
                         <li>Process job applications.</li>
                         <li>Improve our website and services.</li>
                         <li>Send you updates or marketing materials (only if you have opted in).</li>
                     </ul>
                 </section>

                 <section>
                     <h2 className="text-xl font-bold text-white mb-4">4. Data Security</h2>
                     <p>
                         We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
                     </p>
                 </section>

                 <section>
                     <h2 className="text-xl font-bold text-white mb-4">5. Contact Us</h2>
                     <p>
                         If you have any questions about this Privacy Policy, please contact us at:
                     </p>
                     <p className="mt-4 font-bold text-white">creative.ponloe.org@gmail.com</p>
                 </section>
             </div>
        </div>
    </PageOverlay>
  );
};

export default PrivacyPolicy;
