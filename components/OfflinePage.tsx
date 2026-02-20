import React from 'react';
import { WifiOff } from 'lucide-react';

const OfflinePage: React.FC = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  React.useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);
  if (isOnline) return null;
  return (
    <div className="fixed inset-0 z-40 bg-gray-950 flex flex-col items-center justify-center p-4 text-center">
      <WifiOff size={64} className="text-indigo-500 mb-6" />
      <h1 className="text-3xl font-bold text-white font-khmer mb-4">គ្មានការតភ្ជាប់</h1>
      <p className="text-gray-400 font-khmer">សូមពិនិត្យមើលអ៊ីនធឺណិតរបស់អ្នក។</p>
    </div>
  );
};
export default OfflinePage;
