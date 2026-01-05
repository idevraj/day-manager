import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function MonthSelector({ selectedMonth, onMonthChange }: MonthSelectorProps) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const now = new Date();
  const currentYear = selectedMonth.getFullYear();
  const currentMonth = selectedMonth.getMonth();

  // Check if a month is in the future
  const isFutureMonth = (year: number, month: number): boolean => {
    if (year > now.getFullYear()) return true;
    if (year === now.getFullYear() && month > now.getMonth()) return true;
    return false;
  };

  // Check if selected month is the current month
  const isCurrentMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth();

  const handlePrevMonth = () => {
    onMonthChange(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentYear, currentMonth + 1, 1);
    // Don't allow going to future months
    if (!isFutureMonth(nextMonth.getFullYear(), nextMonth.getMonth())) {
      onMonthChange(nextMonth);
    }
  };

  const handleMonthSelect = (monthIndex: number) => {
    // Don't allow selecting future months
    if (!isFutureMonth(currentYear, monthIndex)) {
      onMonthChange(new Date(currentYear, monthIndex, 1));
    }
  };

  const handleYearChange = (delta: number) => {
    const newYear = currentYear + delta;
    // Don't allow going to future years
    if (newYear <= now.getFullYear()) {
      // If changing to current year, ensure month isn't in the future
      const newMonth = newYear === now.getFullYear() && currentMonth > now.getMonth() 
        ? now.getMonth() 
        : currentMonth;
      onMonthChange(new Date(newYear, newMonth, 1));
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-border text-foreground gap-2 hover:bg-secondary btn-glow">
          <Calendar className="w-4 h-4 text-primary" />
          {months[currentMonth]} {currentYear}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 card-neon border-primary/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleYearChange(-1)}
            className="text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-foreground font-semibold neon-text-primary">{currentYear}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleYearChange(1)}
            disabled={currentYear >= now.getFullYear()}
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => {
            const isFuture = isFutureMonth(currentYear, index);
            const isSelected = index === currentMonth;
            return (
              <Button
                key={month}
                variant={isSelected ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleMonthSelect(index)}
                disabled={isFuture}
                className={
                  isSelected
                    ? 'bg-primary text-primary-foreground btn-glow' 
                    : isFuture
                    ? 'text-muted-foreground/30 cursor-not-allowed'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }
              >
                {month.slice(0, 3)}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}