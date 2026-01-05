import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Goal,
  GoalStatus, 
  GoalDays, 
  GoalValue,
  GOAL_DAYS_OPTIONS,
  GOAL_STATUS_OPTIONS,
  GOAL_VALUE_OPTIONS,
} from '@/types/goal';

interface EditGoalDialogProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => void;
}

export function EditGoalDialog({ goal, open, onOpenChange, onSave }: EditGoalDialogProps) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<GoalStatus>('not-yet');
  const [days, setDays] = useState<GoalDays>(30);
  const [value, setValue] = useState<GoalValue>('IMP');

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setStatus(goal.status);
      setDays(goal.days);
      setValue(goal.value);
    }
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal && name.trim()) {
      onSave(goal.id, { name: name.trim(), status, days, value });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="card-neon border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-foreground text-lg neon-text-primary">Edit Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Goal Name</label>
            <Input
              placeholder="Enter goal name..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Status</label>
              <Select value={status} onValueChange={(v) => setStatus(v as GoalStatus)}>
                <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  {GOAL_STATUS_OPTIONS.map(s => (
                    <SelectItem key={s} value={s} className="text-foreground hover:bg-secondary/50 capitalize">
                      {s.replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Days</label>
              <Select value={days.toString()} onValueChange={(v) => setDays(Number(v) as GoalDays)}>
                <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  {GOAL_DAYS_OPTIONS.map(d => (
                    <SelectItem key={d} value={d.toString()} className="text-foreground hover:bg-secondary/50">
                      {d} days
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Value</label>
              <Select value={value} onValueChange={(v) => setValue(v as GoalValue)}>
                <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  {GOAL_VALUE_OPTIONS.map(v => (
                    <SelectItem key={v.value} value={v.value} className="text-foreground hover:bg-secondary/50">
                      {v.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border text-foreground hover:text-foreground hover:bg-secondary/50"
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
