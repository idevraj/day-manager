import { Mail, MessageCircle, Phone, Heart } from 'lucide-react';

export function SupportSection() {
  return (
    <div className="glass-card p-4 sm:p-6 animate-fade-in">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Heart className="w-4 h-4 text-neon-pink" />
          <span className="text-sm font-medium">Connect With Us</span>
          <Heart className="w-4 h-4 text-neon-pink" />
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {/* Write Us */}
          <a 
            href="mailto:devraj.onemail@gmail.com"
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-button group"
          >
            <Mail className="w-4 h-4 text-neon-purple group-hover:scale-110 transition-transform duration-300" />
            <span className="text-xs sm:text-sm text-foreground font-medium">
              devraj.onemail@gmail.com
            </span>
          </a>
          
          {/* Feedback */}
          <a 
            href="mailto:devraj.main@gmail.com"
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-button group"
          >
            <MessageCircle className="w-4 h-4 text-neon-cyan group-hover:scale-110 transition-transform duration-300" />
            <span className="text-xs sm:text-sm text-foreground font-medium">
              devraj.main@gmail.com
            </span>
          </a>
          
          {/* WhatsApp */}
          <a 
            href="https://wa.me/919199953777"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-button group"
          >
            <Phone className="w-4 h-4 text-neon-green group-hover:scale-110 transition-transform duration-300" />
            <span className="text-xs sm:text-sm text-foreground font-medium">
              +91 91-999-53-777
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
