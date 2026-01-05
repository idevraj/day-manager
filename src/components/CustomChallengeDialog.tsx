import { useState } from 'react';
import { Plus, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CustomChallengeDialogProps {
  onAdd: (challenge: {
    name: string;
    description: string;
    icon: string;
    targetType: 'screenTime' | 'socialMedia' | 'firstPickup' | 'custom';
    targetValue: string;
  }) => void;
}

const EMOJI_OPTIONS = ['🎯', '🏆', '💪', '🧘', '🌟', '🔥', '⚡', '🌈', '🎮', '📵', '🧠', '💎'];

const TARGET_TYPES = [
  { value: 'screenTime', label: 'Screen Time Limit', placeholder: 'e.g., 3H' },
  { value: 'socialMedia', label: 'Social Media Limit', placeholder: 'e.g., 30min' },
  { value: 'firstPickup', label: 'First Pickup After', placeholder: 'e.g., 9:00 AM' },
  { value: 'custom', label: 'Custom Goal', placeholder: 'Your target' },
];

export function CustomChallengeDialog({ onAdd }: CustomChallengeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [targetType, setTargetType] = useState<'screenTime' | 'socialMedia' | 'firstPickup' | 'custom'>('custom');
  const [targetValue, setTargetValue] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !targetValue.trim()) return;

    onAdd({
      name: name.trim(),
      description: description.trim() || `Custom challenge: ${name}`,
      icon,
      targetType,
      targetValue: targetValue.trim(),
    });

    // Reset form
    setName('');
    setDescription('');
    setIcon('🎯');
    setTargetType('custom');
    setTargetValue('');
    setIsOpen(false);
  };

  const currentTargetType = TARGET_TYPES.find(t => t.value === targetType);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 border-dashed border-primary/50 hover:border-primary">
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">Custom Challenge</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="card-neon max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-neon-purple" />
            Create Custom Challenge
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Icon Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Choose Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all duration-300 ${
                    icon === emoji 
                      ? 'bg-primary/20 border-2 border-primary scale-110' 
                      : 'bg-secondary/50 border border-border/50 hover:border-primary/50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Challenge Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Challenge Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., No Phone in Bed"
              className="bg-secondary/50 border-border"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Description (optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your challenge..."
              className="bg-secondary/50 border-border resize-none h-20"
            />
          </div>

          {/* Target Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Challenge Type</label>
            <Select value={targetType} onValueChange={(v) => setTargetType(v as typeof targetType)}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {TARGET_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Value */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Target Value</label>
            <Input
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder={currentTargetType?.placeholder || 'Enter target'}
              className="bg-secondary/50 border-border"
            />
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit}
            disabled={!name.trim() || !targetValue.trim()}
            className="w-full gap-2 bg-gradient-to-r from-neon-purple to-neon-pink hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Create Challenge
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
