import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';
import { Habit, HABIT_COLORS } from '@/types/habit';

interface EditHabitDialogProps {
  habit: Habit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, name: string, color?: string) => void;
}

export function EditHabitDialog({ habit, open, onOpenChange, onSave }: EditHabitDialogProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(HABIT_COLORS[0].value);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setSelectedColor(habit.color || HABIT_COLORS[0].value);
    }
  }, [habit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (habit && name.trim()) {
      onSave(habit.id, name.trim(), selectedColor);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="card-neon border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-foreground text-lg neon-text-primary">Edit Habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Habit Name</label>
            <Input
              placeholder="Enter habit name..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
              autoFocus
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-sm text-muted-foreground">Choose Color</label>
            <div className="flex flex-wrap gap-3">
              {HABIT_COLORS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-11 h-11 rounded-xl transition-all duration-300 flex items-center justify-center
                    hover:scale-115 active:scale-95
                    ${selectedColor === color.value ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110' : ''}`}
                  style={{ 
                    backgroundColor: `hsl(${color.value})`,
                    boxShadow: selectedColor === color.value 
                      ? `0 0 20px hsl(${color.value} / 0.6), 0 0 40px hsl(${color.value} / 0.3)` 
                      : `0 0 10px hsl(${color.value} / 0.3)`
                  }}
                  title={color.name}
                >
                  {selectedColor === color.value && (
                    <Check className="w-5 h-5 text-white drop-shadow-lg" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground btn-glow">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}