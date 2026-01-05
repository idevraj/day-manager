import { useMemo } from 'react';
import { Trophy, Flame, Target, Zap, Medal, Star, Crown, Shield, Award, Sparkles } from 'lucide-react';
import { DetoxChallenge } from '@/types/detoxChallenge';
import { JournalEntry } from '@/types/journal';
import { useDetoxChallenges } from '@/hooks/useDetoxChallenges';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgesProps {
  journalEntries: JournalEntry[];
}

export function AchievementBadges({ journalEntries }: AchievementBadgesProps) {
  const { challenges } = useDetoxChallenges(journalEntries);
  
  const achievements = useMemo((): Achievement[] => {
    const maxStreak = Math.max(0, ...challenges.map(c => c.longestStreak));
    const currentMaxStreak = Math.max(0, ...challenges.map(c => c.currentStreak));
    const totalCompletedDays = challenges.reduce((sum, c) => sum + c.completedDays.length, 0);
    const journalDays = journalEntries.filter(e => e.howWasYourDay || e.productiveThing).length;
    const fiveStarDays = journalEntries.filter(e => e.dayRating === 5).length;
    const lowScreenDays = journalEntries.filter(e => {
      const hours = parseInt(e.screenTime?.replace(/\D/g, '') || '99');
      return hours <= 3;
    }).length;

    return [
      {
        id: 'first-steps',
        name: 'First Steps',
        description: 'Complete your first day of any challenge',
        icon: <Sparkles className="w-5 h-5" />,
        color: 'text-neon-cyan',
        unlocked: totalCompletedDays >= 1,
        progress: Math.min(totalCompletedDays, 1),
        maxProgress: 1,
      },
      {
        id: 'week-warrior',
        name: '7-Day Warrior',
        description: 'Maintain a 7-day streak on any challenge',
        icon: <Flame className="w-5 h-5" />,
        color: 'text-orange-500',
        unlocked: maxStreak >= 7,
        progress: Math.min(currentMaxStreak, 7),
        maxProgress: 7,
      },
      {
        id: 'two-week-titan',
        name: '14-Day Titan',
        description: 'Maintain a 14-day streak on any challenge',
        icon: <Shield className="w-5 h-5" />,
        color: 'text-neon-purple',
        unlocked: maxStreak >= 14,
        progress: Math.min(currentMaxStreak, 14),
        maxProgress: 14,
      },
      {
        id: 'monthly-master',
        name: '30-Day Master',
        description: 'Achieve a 30-day streak on any challenge',
        icon: <Crown className="w-5 h-5" />,
        color: 'text-amber-400',
        unlocked: maxStreak >= 30,
        progress: Math.min(currentMaxStreak, 30),
        maxProgress: 30,
      },
      {
        id: 'journal-starter',
        name: 'Journal Starter',
        description: 'Write journal entries for 7 days',
        icon: <Award className="w-5 h-5" />,
        color: 'text-neon-green',
        unlocked: journalDays >= 7,
        progress: Math.min(journalDays, 7),
        maxProgress: 7,
      },
      {
        id: 'journal-master',
        name: 'Journal Master',
        description: 'Write journal entries for 30 days',
        icon: <Medal className="w-5 h-5" />,
        color: 'text-neon-pink',
        unlocked: journalDays >= 30,
        progress: Math.min(journalDays, 30),
        maxProgress: 30,
      },
      {
        id: 'perfect-week',
        name: 'Perfect Week',
        description: 'Rate 7 days with 5 stars',
        icon: <Star className="w-5 h-5" />,
        color: 'text-yellow-400',
        unlocked: fiveStarDays >= 7,
        progress: Math.min(fiveStarDays, 7),
        maxProgress: 7,
      },
      {
        id: 'digital-minimalist',
        name: 'Digital Minimalist',
        description: 'Keep screen time under 3H for 7 days',
        icon: <Target className="w-5 h-5" />,
        color: 'text-emerald-400',
        unlocked: lowScreenDays >= 7,
        progress: Math.min(lowScreenDays, 7),
        maxProgress: 7,
      },
      {
        id: 'challenge-collector',
        name: 'Challenge Collector',
        description: 'Have 3 active challenges at once',
        icon: <Zap className="w-5 h-5" />,
        color: 'text-blue-400',
        unlocked: challenges.filter(c => c.isActive).length >= 3,
        progress: challenges.filter(c => c.isActive).length,
        maxProgress: 3,
      },
      {
        id: 'legendary',
        name: 'Legendary',
        description: 'Achieve a 100-day streak',
        icon: <Trophy className="w-5 h-5" />,
        color: 'text-amber-300',
        unlocked: maxStreak >= 100,
        progress: Math.min(currentMaxStreak, 100),
        maxProgress: 100,
      },
    ];
  }, [challenges, journalEntries]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="card-neon p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Achievements
        </h2>
        <span className="text-sm text-muted-foreground">
          {unlockedCount}/{achievements.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={cn(
              "relative p-3 rounded-lg border text-center transition-all duration-500",
              achievement.unlocked
                ? "bg-gradient-to-br from-secondary/50 to-secondary/30 border-primary/40 shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                : "bg-secondary/10 border-border/30 opacity-50 grayscale"
            )}
          >
            <div className={cn(
              "mx-auto mb-2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
              achievement.unlocked
                ? `bg-gradient-to-br from-secondary to-card ${achievement.color}`
                : "bg-secondary/50 text-muted-foreground"
            )}>
              {achievement.icon}
            </div>
            <h4 className="text-xs font-semibold truncate">{achievement.name}</h4>
            <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">
              {achievement.description}
            </p>
            
            {/* Progress bar for locked achievements */}
            {!achievement.unlocked && achievement.progress !== undefined && (
              <div className="mt-2">
                <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-neon-purple to-neon-pink rounded-full transition-all duration-300"
                    style={{ width: `${(achievement.progress / (achievement.maxProgress || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {achievement.progress}/{achievement.maxProgress}
                </span>
              </div>
            )}

            {/* Unlocked badge */}
            {achievement.unlocked && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-neon-green rounded-full flex items-center justify-center text-xs shadow-[0_0_10px_hsl(var(--neon-green))]">
                ✓
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
