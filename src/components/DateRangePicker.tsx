import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format, subDays, subMonths, startOfMonth, endOfMonth, isAfter, isBefore } from 'date-fns';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onRangeChange: (start: Date, end: Date) => void;
}

export function DateRangePicker({ startDate, endDate, onRangeChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const today = new Date();

  const presets = [
    { label: 'Last 7 days', getValue: () => ({ start: subDays(today, 6), end: today }) },
    { label: 'Last 30 days', getValue: () => ({ start: subDays(today, 29), end: today }) },
    { label: 'This month', getValue: () => ({ start: startOfMonth(today), end: today }) },
    { label: 'Last month', getValue: () => ({ start: startOfMonth(subMonths(today, 1)), end: endOfMonth(subMonths(today, 1)) }) },
    { label: 'Last 3 months', getValue: () => ({ start: subMonths(today, 2), end: today }) },
    { label: 'Last 6 months', getValue: () => ({ start: subMonths(today, 5), end: today }) },
  ];

  const handlePresetClick = (preset: typeof presets[0]) => {
    const { start, end } = preset.getValue();
    onRangeChange(start, end);
    setIsOpen(false);
  };

  // Generate month options for custom selection
  const months: Date[] = [];
  for (let i = 0; i < 12; i++) {
    months.push(subMonths(today, i));
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="btn-glow bg-secondary/50 border-primary/40 hover:bg-secondary hover:border-primary/60 hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] gap-2 min-w-[200px] transition-all duration-300"
        >
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm text-foreground font-medium">
            {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
          </span>
          <ChevronDown className="w-4 h-4 text-primary/70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2 card-neon border-primary/30" align="start">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-primary uppercase tracking-wide px-2 py-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            Quick Select
          </div>
          {presets.map((preset, i) => (
            <button
              key={i}
              onClick={() => handlePresetClick(preset)}
              className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-primary/20 hover:text-primary transition-all duration-200 text-foreground border border-transparent hover:border-primary/30"
            >
              {preset.label}
            </button>
          ))}
          <div className="border-t border-primary/20 my-2" />
          <div className="text-xs font-semibold text-neon-purple uppercase tracking-wide px-2 py-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-purple animate-pulse" />
            By Month
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1 scrollbar-thin">
            {months.map((month, i) => (
              <button
                key={i}
                onClick={() => {
                  const start = startOfMonth(month);
                  const end = isAfter(endOfMonth(month), today) ? today : endOfMonth(month);
                  onRangeChange(start, end);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-neon-purple/20 hover:text-neon-purple transition-all duration-200 text-foreground border border-transparent hover:border-neon-purple/30"
              >
                {format(month, 'MMMM yyyy')}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
