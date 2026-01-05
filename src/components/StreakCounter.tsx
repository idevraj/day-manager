import { useMemo } from 'react';
import { Habit } from '@/types/habit';
import { Flame, Zap, Trophy } from 'lucide-react';

interface StreakCounterProps {
  habits: Habit[];
  selectedMonth: Date;
  daysInMonth: number;
}

interface StreakInfo {
  habitName: string;
  habitColor: string;
  currentStreak: number;
  longestStreak: number;
}

export function StreakCounter({ habits, selectedMonth, daysInMonth }: StreakCounterProps) {
  const streakData = useMemo(() => {
    const today = new Date();
    const isCurrentMonth = 
      selectedMonth.getFullYear() === today.getFullYear() && 
      selectedMonth.getMonth() === today.getMonth();
    const currentDay = isCurrentMonth ? today.getDate() : daysInMonth;

    let overallLongestStreak = 0;
    let overallCurrentStreak = 0;
    let bestHabit: StreakInfo | null = null;

    habits.forEach(habit => {
      const sortedDays = [...habit.completedDays].sort((a, b) => a - b);
      
      // Calculate longest streak
      let longestStreak = 0;
      let currentRun = 0;
      let prevDay = 0;
      
      sortedDays.forEach(day => {
        if (day <= currentDay) {
          if (prevDay === 0 || day === prevDay + 1) {
            currentRun++;
          } else {
            currentRun = 1;
          }
          longestStreak = Math.max(longestStreak, currentRun);
          prevDay = day;
        }
      });

      // Calculate current streak (counting backwards from today)
      let currentStreak = 0;
      for (let day = currentDay; day >= 1; day--) {
        if (sortedDays.includes(day)) {
          currentStreak++;
        } else {
          break;
        }
      }

      if (longestStreak > overallLongestStreak) {
        overallLongestStreak = longestStreak;
        bestHabit = {
          habitName: habit.name,
          habitColor: habit.color,
          currentStreak,
          longestStreak,
        };
      }

      overallCurrentStreak = Math.max(overallCurrentStreak, currentStreak);
    });

    // Calculate total active days across all habits
    const totalActiveDays = habits.reduce((sum, h) => sum + h.completedDays.length, 0);

    return {
      longestStreak: overallLongestStreak,
      currentStreak: overallCurrentStreak,
      bestHabit,
      totalActiveDays,
    };
  }, [habits, selectedMonth, daysInMonth]);

  if (habits.length === 0) return null;

  return (
    <div className="card-neon p-3 sm:p-4 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Longest Streak */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-neon-orange/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-neon-orange" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Longest Streak</p>
            <p className="text-lg sm:text-2xl font-bold neon-text-orange">
              {streakData.longestStreak} <span className="text-sm font-normal text-muted-foreground">days</span>
            </p>
          </div>
        </div>

        {/* Current Streak */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-neon-green/20 flex items-center justify-center">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-neon-green" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current Streak</p>
            <p className="text-lg sm:text-2xl font-bold neon-text-green">
              {streakData.currentStreak} <span className="text-sm font-normal text-muted-foreground">days</span>
            </p>
          </div>
        </div>

        {/* Total Activities */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Check-ins</p>
            <p className="text-lg sm:text-2xl font-bold neon-text-primary">
              {streakData.totalActiveDays}
            </p>
          </div>
        </div>

        {/* Best Habit */}
        {streakData.bestHabit && (
          <div className="flex items-center gap-2 sm:gap-3">
            <div 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `hsl(${streakData.bestHabit.habitColor} / 0.2)` }}
            >
              <span className="text-lg">🏆</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Best Habit</p>
              <p 
                className="text-sm sm:text-base font-semibold truncate max-w-[100px] sm:max-w-[150px]"
                style={{ color: `hsl(${streakData.bestHabit.habitColor})` }}
              >
                {streakData.bestHabit.habitName}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
