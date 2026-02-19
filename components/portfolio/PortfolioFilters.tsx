
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface PortfolioFiltersProps {
  categories: { id: string; label: string }[];
  currentFilter: string;
  onFilterChange: (id: string) => void;
}

const PortfolioFilters: React.FC<PortfolioFiltersProps> = ({ categories, currentFilter, onFilterChange }) => {
  return (
    <div className="flex flex-wrap justify-start md:justify-end gap-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onFilterChange(cat.id)}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-300 border font-khmer ${
            currentFilter === cat.id 
            ? 'bg-white text-gray-950 border-white' 
            : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export default PortfolioFilters;
