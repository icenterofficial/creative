export const SkeletonCard = () => (
  <div className="w-full h-64 bg-gray-800/50 rounded-3xl animate-pulse border border-white/5 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
  </div>
);

// បន្ថែម CSS ក្នុង index.html
// @keyframes shimmer { 100% { transform: translateX(100%); } }
