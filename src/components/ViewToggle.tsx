import { ViewMode } from '@/types/habit';
import { BarChart3, Calendar, CalendarDays } from 'lucide-react';

interface ViewToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ mode, onModeChange }: ViewToggleProps) {
  return (
    <div className="card-neon p-1 sm:p-1.5 flex rounded-lg sm:rounded-xl overflow-hidden animate-fade-in">
      <button
        onClick={() => onModeChange('monthly')}
        className={`flex-1 py-2 sm:py-3 px-2 sm:px-6 rounded-md sm:rounded-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
          mode === 'monthly' ? 'toggle-active' : 'toggle-inactive'
        }`}
      >
        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>Monthly</span>
      </button>
      <button
        onClick={() => onModeChange('weekly')}
        className={`flex-1 py-2 sm:py-3 px-2 sm:px-6 rounded-md sm:rounded-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
          mode === 'weekly' ? 'toggle-active' : 'toggle-inactive'
        }`}
      >
        <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>Weekly</span>
      </button>
      <button
        onClick={() => onModeChange('analytics')}
        className={`flex-1 py-2 sm:py-3 px-2 sm:px-6 rounded-md sm:rounded-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
          mode === 'analytics' ? 'toggle-active' : 'toggle-inactive'
        }`}
      >
        <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>Analytics</span>
      </button>
    </div>
  );
}
