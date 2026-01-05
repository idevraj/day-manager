import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export function WelcomeOverlay() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Check if user has seen welcome before in this session
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (hasSeenWelcome) {
      setIsVisible(false);
      return;
    }

    // Start exit animation after delay
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 1800);

    // Remove from DOM after animation
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('hasSeenWelcome', 'true');
    }, 2500);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-700 ${
        isExiting ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, hsl(225 50% 3%) 0%, hsl(270 40% 8%) 50%, hsl(225 50% 5%) 100%)',
      }}
    >
      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl transition-all duration-1000 ${isExiting ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-72 h-72 bg-neon-pink/15 rounded-full blur-3xl transition-all duration-1000 delay-100 ${isExiting ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl transition-all duration-1000 delay-200 ${isExiting ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`} />
      </div>

      {/* Welcome content */}
      <div className={`relative z-10 text-center transition-all duration-500 ${isExiting ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="flex items-center justify-center gap-3 mb-4 animate-fade-in">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
        </div>
        
        <h1 
          className="text-4xl sm:text-5xl font-bold mb-3 animate-fade-in"
          style={{ 
            animationDelay: '0.2s',
            background: 'linear-gradient(135deg, hsl(187 100% 55%), hsl(270 100% 65%), hsl(320 100% 65%))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Welcome Back
        </h1>
        
        <p 
          className="text-muted-foreground text-lg animate-fade-in animate-fill-both"
          style={{ animationDelay: '0.4s' }}
        >
          Let's build great habits today ✨
        </p>
      </div>

      {/* Loading bar */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 h-1 rounded-full bg-secondary/50 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary via-neon-pink to-primary rounded-full"
          style={{
            animation: 'loading-bar 1.8s ease-out forwards',
          }}
        />
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
