import { useState, useEffect } from 'react';
import { Quote, Sparkles } from 'lucide-react';
import { MOTIVATIONAL_QUOTES } from '@/types/journal';

export function QuotesDisplay() {
  const [currentQuote, setCurrentQuote] = useState(() => 
    MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
  );
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
      }, 500);
      setTimeout(() => {
        setIsAnimating(false);
      }, 600);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card-neon p-4 sm:p-5 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 via-primary/5 to-neon-pink/5 animate-pulse opacity-50" />
      
      <div className="relative z-10">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-neon-purple" />
          </div>
          
          <div 
            className={`flex-1 transition-all duration-600 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isAnimating 
                ? 'opacity-0 translate-y-4 blur-[3px] scale-95' 
                : 'opacity-100 translate-y-0 blur-0 scale-100'
            }`}
            style={{ transitionDuration: '600ms' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl transition-transform duration-500">{currentQuote.emoji}</span>
              <span className="text-xs text-neon-purple font-medium uppercase tracking-wide">Daily Inspiration</span>
            </div>
            
            <blockquote className="text-sm sm:text-base text-foreground/90 italic leading-relaxed">
              "{currentQuote.quote}"
            </blockquote>
            
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <Quote className="w-3 h-3" />
              — {currentQuote.author}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
