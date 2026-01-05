import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { GreetingPanel } from './GreetingPanel';

export function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const dayName = time.toLocaleDateString('en-US', { weekday: 'long' });
  const timeStr = time.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  });
  const dateStr = time.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });

  return (
    <div className="text-center py-2 sm:py-3 animate-fade-in">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {/* Greeting Panel */}
        <GreetingPanel />
        
        {/* Date/Time Panel */}
        <div className="inline-flex items-center justify-center gap-3 sm:gap-5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-secondary/50 backdrop-blur-sm border border-neon-purple/30 shadow-[0_0_15px_hsl(var(--neon-purple)/0.15)]">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neon-purple" />
            <span className="text-foreground font-medium text-xs sm:text-sm">{dayName}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neon-purple" />
            <span className="neon-text-purple font-semibold text-xs sm:text-sm tracking-wide">{timeStr}</span>
          </div>
          <span className="text-foreground font-medium text-xs sm:text-sm">{dateStr}</span>
        </div>
      </div>
    </div>
  );
}
