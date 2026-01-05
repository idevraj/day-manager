import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const GREETINGS = [
  { text: 'Hey', emoji: '👋' },
  { text: 'Hello', emoji: '😊' },
  { text: 'Hi there', emoji: '✨' },
  { text: 'Yo!', emoji: '🔥' },
  { text: 'Welcome', emoji: '🌟' },
  { text: 'Howdy', emoji: '🤠' },
  { text: 'Hiya', emoji: '💫' },
];

function getTimeOfDay(): { greeting: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { greeting: 'Good Morning', emoji: '🌅' };
  } else if (hour >= 12 && hour < 17) {
    return { greeting: 'Good Afternoon', emoji: '☀️' };
  } else if (hour >= 17 && hour < 21) {
    return { greeting: 'Good Evening', emoji: '🌆' };
  } else {
    return { greeting: 'Good Night', emoji: '🌙' };
  }
}

export function GreetingPanel() {
  const [currentGreeting, setCurrentGreeting] = useState(() => 
    GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
  );
  const [timeGreeting, setTimeGreeting] = useState(getTimeOfDay);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
        setTimeGreeting(getTimeOfDay());
      }, 400);
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-secondary/50 backdrop-blur-sm border border-neon-purple/30 shadow-[0_0_15px_hsl(var(--neon-purple)/0.15)]">
      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neon-purple" />
      <span 
        className={`font-medium text-xs sm:text-sm transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isAnimating 
            ? 'opacity-0 translate-y-3 blur-[2px] scale-95' 
            : 'opacity-100 translate-y-0 blur-0 scale-100'
        }`}
      >
        <span className="text-neon-purple">{currentGreeting.text}</span>
        <span className="mx-1 inline-block transition-transform duration-500">{currentGreeting.emoji}</span>
        <span className="text-foreground">• {timeGreeting.greeting}</span>
        <span className="ml-1 inline-block transition-transform duration-500">{timeGreeting.emoji}</span>
      </span>
    </div>
  );
}
