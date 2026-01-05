import { AppSection } from '@/types/goal';
import { CheckSquare, Target, BookOpen } from 'lucide-react';

interface SectionToggleProps {
  section: AppSection;
  onSectionChange: (section: AppSection) => void;
}

export function SectionToggle({ section, onSectionChange }: SectionToggleProps) {
  return (
    <div className="card-neon p-1 sm:p-1.5 flex rounded-lg sm:rounded-xl overflow-hidden animate-fade-in">
      <button
        onClick={() => onSectionChange('habits')}
        className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 rounded-md sm:rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
          section === 'habits' ? 'toggle-active' : 'toggle-inactive'
        }`}
      >
        <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>Habits</span>
      </button>
      <button
        onClick={() => onSectionChange('journal')}
        className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 rounded-md sm:rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
          section === 'journal' ? 'toggle-active' : 'toggle-inactive'
        }`}
      >
        <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>Journal</span>
      </button>
      <button
        onClick={() => onSectionChange('goals')}
        className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 rounded-md sm:rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
          section === 'goals' ? 'toggle-active' : 'toggle-inactive'
        }`}
      >
        <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>Goals</span>
      </button>
    </div>
  );
}
