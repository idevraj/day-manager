import { Mail, MessageCircle, Phone, Heart, ArrowLeft, Send, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: "How do I add a new habit?",
    answer: "Click the '+' button or 'Add Habit' on the main dashboard. Enter your habit name, choose a frequency, and optionally set reminders. Your new habit will appear in your tracking list."
  },
  {
    question: "Can I track my progress over time?",
    answer: "Yes! Navigate to the Analytics section to view detailed charts showing your habit completion rates, streaks, and trends over days, weeks, or months."
  },
  {
    question: "How do streaks work?",
    answer: "A streak counts consecutive days you complete a habit. Missing a day resets the streak to zero. Maintaining streaks helps build lasting habits through consistency."
  },
  {
    question: "What are goals and how are they different from habits?",
    answer: "Habits are recurring actions you want to build (daily/weekly). Goals are specific targets with deadlines (e.g., 'Read 12 books this year'). Track both to maximize your personal growth."
  },
  {
    question: "Is my data saved securely?",
    answer: "Your data is stored locally in your browser and synced securely when you're logged in. We prioritize your privacy and never share personal data with third parties."
  },
  {
    question: "Can I export my habit data?",
    answer: "Yes! Go to Settings or Analytics and use the Export option to download your data in various formats like CSV or PDF for backup or analysis."
  }
];

export default function Support() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Message sent! We\'ll get back to you soon.');
    setName('');
    setEmail('');
    setMessage('');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 flex items-center justify-center">
      {/* Neon ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-neon-pink/4 rounded-full blur-3xl" />
      </div>

      <div className="glass-card p-6 sm:p-10 max-w-2xl w-full relative z-10 animate-fade-in max-h-[90vh] overflow-y-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="flex flex-col items-center gap-6 pt-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Heart className="w-5 h-5 text-neon-pink animate-pulse" />
            <span className="text-lg font-medium">Connect With Us</span>
            <Heart className="w-5 h-5 text-neon-pink animate-pulse" />
          </div>
          
          {/* Contact Options */}
          <div className="flex flex-col gap-3 w-full">
            <a 
              href="mailto:devraj.onemail@gmail.com"
              className="flex items-center gap-4 px-4 py-3 rounded-xl glass-card border-primary/20 hover:border-primary/50 group transition-all duration-300"
            >
              <div className="p-2.5 rounded-lg bg-neon-purple/20">
                <Mail className="w-5 h-5 text-neon-purple group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Write Us</p>
                <span className="text-sm text-foreground font-medium">devraj.onemail@gmail.com</span>
              </div>
            </a>
            
            <a 
              href="mailto:devraj.main@gmail.com"
              className="flex items-center gap-4 px-4 py-3 rounded-xl glass-card border-neon-cyan/20 hover:border-neon-cyan/50 group transition-all duration-300"
            >
              <div className="p-2.5 rounded-lg bg-neon-cyan/20">
                <MessageCircle className="w-5 h-5 text-neon-cyan group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Feedback</p>
                <span className="text-sm text-foreground font-medium">devraj.main@gmail.com</span>
              </div>
            </a>
            
            <a 
              href="https://wa.link/dq8h9w"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-4 py-3 rounded-xl glass-card border-neon-green/20 hover:border-neon-green/50 group transition-all duration-300"
            >
              <div className="p-2.5 rounded-lg bg-neon-green/20">
                <Phone className="w-5 h-5 text-neon-green group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">WhatsApp</p>
                <span className="text-sm text-neon-green font-medium">Chat with us →</span>
              </div>
            </a>
          </div>

          {/* FAQ Section */}
          <div className="w-full pt-4 border-t border-border/30">
            <h3 className="text-center text-sm font-medium text-muted-foreground mb-4">
              Frequently Asked Questions
            </h3>
            <Accordion type="single" collapsible className="w-full space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="glass-card border border-border/30 rounded-xl px-4 overflow-hidden"
                >
                  <AccordionTrigger className="text-sm text-left hover:no-underline py-3 text-foreground">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-3">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Feedback Form */}
          <div className="w-full pt-4 border-t border-border/30">
            <h3 className="text-center text-sm font-medium text-muted-foreground mb-4">
              Or send us a message directly
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-button border-border/50 focus:border-primary/50"
                maxLength={100}
              />
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-button border-border/50 focus:border-primary/50"
                maxLength={255}
              />
              <Textarea
                placeholder="Your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="glass-button border-border/50 focus:border-primary/50 min-h-[100px] resize-none"
                maxLength={1000}
              />
              <Button 
                type="submit" 
                className="w-full gap-2 btn-glow bg-gradient-to-r from-primary to-neon-pink"
                disabled={isSubmitting}
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}