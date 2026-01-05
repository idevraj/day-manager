import { useState } from 'react';
import { Flame, Plus, X, Trophy, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDetoxChallenges } from '@/hooks/useDetoxChallenges';
import { JournalEntry } from '@/types/journal';
import { cn } from '@/lib/utils';
import { CustomChallengeDialog } from './CustomChallengeDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DetoxChallengesProps {
  journalEntries: JournalEntry[];
}

export function DetoxChallenges({ journalEntries }: DetoxChallengesProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { challenges, addChallenge, removeChallenge, availableChallenges } = useDetoxChallenges(journalEntries);

  const handleAddChallenge = (challenge: typeof availableChallenges[number]) => {
    addChallenge(challenge);
    setIsAddOpen(false);
  };

  const handleAddCustomChallenge = (challenge: {
    name: string;
    description: string;
    icon: string;
    targetType: 'screenTime' | 'socialMedia' | 'firstPickup' | 'custom';
    targetValue: string;
  }) => {
    addChallenge(challenge);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Challenges Section */}
      <div className="card-neon p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-neon-purple" />
            Digital Detox Challenges
          </h2>
          <div className="flex items-center gap-2">
            <CustomChallengeDialog onAdd={handleAddCustomChallenge} />
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Preset</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="card-neon max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-neon-purple" />
                    Choose a Challenge
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto">
                  {availableChallenges.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      You've added all preset challenges! 🎉
                      <br />
                      <span className="text-sm">Try creating a custom challenge.</span>
                    </p>
                  ) : (
                    availableChallenges.map((challenge, index) => (
                      <button
                        key={index}
                        onClick={() => handleAddChallenge(challenge)}
                        className="w-full p-4 rounded-lg bg-secondary/50 hover:bg-secondary border border-border hover:border-primary/50 transition-all duration-500 text-left group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{challenge.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold group-hover:text-primary transition-colors duration-300">
                              {challenge.name}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {challenge.description}
                            </p>
                          </div>
                          <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {challenges.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No active challenges yet.</p>
            <p className="text-sm">Add a challenge to start your digital detox journey!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className={cn(
                  "relative p-4 rounded-lg border transition-all duration-500",
                  challenge.isActive
                    ? "bg-gradient-to-br from-secondary/50 to-secondary/30 border-primary/30"
                    : "bg-secondary/20 border-border/50 opacity-60"
                )}
              >
                <button
                  onClick={() => removeChallenge(challenge.id)}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all duration-300"
                  aria-label="Remove challenge"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-3">
                  <span className="text-2xl">{challenge.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate pr-6">
                      {challenge.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {challenge.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1.5">
                    <Flame className={cn(
                      "w-4 h-4 transition-colors duration-300",
                      challenge.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-sm font-bold transition-colors duration-300",
                      challenge.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"
                    )}>
                      {challenge.currentStreak}
                    </span>
                    <span className="text-xs text-muted-foreground">day streak</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-amber-400">
                      {challenge.longestStreak}
                    </span>
                    <span className="text-xs text-muted-foreground">best</span>
                  </div>
                </div>

                {challenge.currentStreak >= 7 && (
                  <div className="mt-2 text-center animate-fade-in">
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                      🔥 On Fire!
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
}
