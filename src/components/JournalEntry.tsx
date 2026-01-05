import { useState, memo, useCallback } from 'react';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface JournalEntryProps {
  heading: string;
  icon: string;
  value: string;
  wordCount: number;
  onChange: (value: string) => void;
}

export const JournalEntryItem = memo(function JournalEntryItem({
  heading,
  icon,
  value,
  wordCount,
  onChange,
}: JournalEntryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isFilled = value.trim().length > 0;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className={cn(
          "flex items-center justify-between p-3 sm:p-4 rounded-lg transition-all duration-500 ease-out",
          "bg-secondary/30 border border-border/50 hover:border-primary/40",
          "hover:bg-secondary/50 group cursor-pointer",
          isOpen && "border-primary/50 bg-secondary/50 shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
        )}>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-lg sm:text-xl transition-transform duration-300 group-hover:scale-110">{icon}</span>
            <span className="text-sm sm:text-base font-medium text-foreground text-left">{heading}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {isFilled ? (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 transition-all duration-300">
                <Check className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium text-primary">{wordCount} words</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/20 border border-destructive/30 transition-all duration-300">
                <AlertCircle className="w-3 h-3 text-destructive" />
                <span className="text-xs font-medium text-destructive">Undone</span>
              </div>
            )}
            <ChevronDown className={cn(
              "w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground transition-all duration-500 ease-out",
              isOpen && "rotate-180 text-primary"
            )} />
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up">
        <div className="pt-3 pb-1 animate-fade-in">
          <Textarea
            value={value}
            onChange={handleChange}
            placeholder={`Write about: ${heading.toLowerCase()}`}
            className="min-h-[120px] bg-secondary/20 border-border/50 focus:border-primary/50 resize-none text-sm sm:text-base transition-all duration-300 focus:shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
});
