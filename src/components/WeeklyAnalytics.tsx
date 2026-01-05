import { useMemo } from 'react';
import { Habit } from '@/types/habit';
import { TrendingUp, TrendingDown, Minus, Flame, Target, Award, Calendar } from 'lucide-react';

interface WeeklyAnalyticsProps {
  habits: Habit[];
  currentDay: number;
  selectedMonth: Date;
}

export function WeeklyAnalytics({ habits, currentDay, selectedMonth }: WeeklyAnalyticsProps) {
  const analytics = useMemo(() => {
    // Get current week days (last 7 days)
    const weekDays: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = currentDay - i;
      if (day > 0) weekDays.push(day);
    }

    // Calculate stats per habit
    const habitStats = habits.map(habit => {
      const weeklyCompleted = habit.completedDays.filter(d => weekDays.includes(d)).length;
      const weeklyTotal = weekDays.length;
      const weeklyRate = weeklyTotal > 0 ? (weeklyCompleted / weeklyTotal) * 100 : 0;

      // Calculate streak
      let currentStreak = 0;
      for (let day = currentDay; day >= 1; day--) {
        if (habit.completedDays.includes(day)) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Best streak calculation
      let bestStreak = 0;
      let tempStreak = 0;
      for (let day = 1; day <= currentDay; day++) {
        if (habit.completedDays.includes(day)) {
          tempStreak++;
          bestStreak = Math.max(bestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      // Previous week comparison
      const prevWeekDays = weekDays.map(d => d - 7).filter(d => d > 0);
      const prevWeekCompleted = habit.completedDays.filter(d => prevWeekDays.includes(d)).length;
      const prevWeekRate = prevWeekDays.length > 0 ? (prevWeekCompleted / prevWeekDays.length) * 100 : 0;
      const trend = weeklyRate - prevWeekRate;

      return {
        ...habit,
        weeklyCompleted,
        weeklyTotal,
        weeklyRate,
        currentStreak,
        bestStreak,
        trend,
      };
    });

    // Overall stats
    const totalWeeklyPossible = habits.length * weekDays.length;
    const totalWeeklyCompleted = habitStats.reduce((sum, h) => sum + h.weeklyCompleted, 0);
    const overallRate = totalWeeklyPossible > 0 ? (totalWeeklyCompleted / totalWeeklyPossible) * 100 : 0;

    // Best performer
    const bestHabit = habitStats.reduce((best, curr) => 
      curr.weeklyRate > (best?.weeklyRate ?? 0) ? curr : best, habitStats[0]);

    // Needs improvement
    const needsWork = habitStats.reduce((worst, curr) => 
      curr.weeklyRate < (worst?.weeklyRate ?? 100) ? curr : worst, habitStats[0]);

    // Longest streak
    const longestStreak = habitStats.reduce((best, curr) => 
      curr.currentStreak > (best?.currentStreak ?? 0) ? curr : best, habitStats[0]);

    return {
      habitStats,
      overallRate,
      bestHabit,
      needsWork,
      longestStreak,
      weekDays,
      totalWeeklyCompleted,
      totalWeeklyPossible,
    };
  }, [habits, currentDay]);

  if (habits.length === 0) {
    return (
      <div className="card-neon p-6 text-center">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-muted-foreground">Add habits to see weekly analytics</p>
      </div>
    );
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUp className="w-4 h-4 text-neon-green" />;
    if (trend < -5) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card-neon p-4 text-center">
          <div className="text-3xl font-bold neon-text-primary">{Math.round(analytics.overallRate)}%</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <Target className="w-3 h-3" /> Weekly Rate
          </div>
        </div>

        <div className="card-neon p-4 text-center">
          <div className="text-3xl font-bold text-neon-green flex items-center justify-center gap-1">
            <Flame className="w-6 h-6" />
            {analytics.longestStreak?.currentStreak ?? 0}
          </div>
          <div className="text-xs text-muted-foreground mt-1 truncate">
            {analytics.longestStreak?.name ?? 'No streak'}
          </div>
        </div>

        <div className="card-neon p-4 text-center">
          <div className="text-3xl font-bold text-neon-cyan flex items-center justify-center gap-1">
            <Award className="w-6 h-6" />
            {Math.round(analytics.bestHabit?.weeklyRate ?? 0)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1 truncate">
            {analytics.bestHabit?.name ?? 'Best'}
          </div>
        </div>

        <div className="card-neon p-4 text-center">
          <div className="text-3xl font-bold text-foreground">
            {analytics.totalWeeklyCompleted}/{analytics.totalWeeklyPossible}
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3" /> Check-ins
          </div>
        </div>
      </div>

      {/* Per-Habit Weekly Stats */}
      <div className="card-neon p-4">
        <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2">
          <span>📈</span> Habit Performance
        </h3>
        <div className="space-y-3">
          {analytics.habitStats.map(habit => (
            <div 
              key={habit.id} 
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all"
            >
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ 
                  backgroundColor: `hsl(${habit.color})`,
                  boxShadow: `0 0 10px hsl(${habit.color} / 0.6)`
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{habit.name}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{habit.weeklyCompleted}/{habit.weeklyTotal} days</span>
                  <span>•</span>
                  <Flame className="w-3 h-3 text-neon-orange" />
                  <span>{habit.currentStreak} streak</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-semibold" style={{ color: `hsl(${habit.color})` }}>
                    {Math.round(habit.weeklyRate)}%
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {getTrendIcon(habit.trend)}
                    <span className={habit.trend > 0 ? 'text-neon-green' : habit.trend < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                      {habit.trend > 0 ? '+' : ''}{Math.round(habit.trend)}%
                    </span>
                  </div>
                </div>
                {/* Mini progress bar */}
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${habit.weeklyRate}%`,
                      backgroundColor: `hsl(${habit.color})`,
                      boxShadow: `0 0 8px hsl(${habit.color} / 0.5)`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Tips */}
      <div className="card-neon p-4">
        <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
          <span>💡</span> Weekly Insights
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          {analytics.overallRate >= 80 && (
            <p className="text-neon-green">🎉 Excellent week! You're crushing it with {Math.round(analytics.overallRate)}% completion!</p>
          )}
          {analytics.overallRate >= 50 && analytics.overallRate < 80 && (
            <p className="text-neon-cyan">👍 Good progress this week! Focus on consistency to reach 80%+</p>
          )}
          {analytics.overallRate < 50 && (
            <p className="text-neon-orange">💪 Room for improvement! Try starting with just one habit per day</p>
          )}
          {analytics.longestStreak && analytics.longestStreak.currentStreak >= 3 && (
            <p>🔥 {analytics.longestStreak.name} has a {analytics.longestStreak.currentStreak}-day streak! Keep it going!</p>
          )}
          {analytics.needsWork && analytics.needsWork.weeklyRate < 30 && (
            <p>📌 {analytics.needsWork.name} needs attention - try linking it to an existing habit</p>
          )}
        </div>
      </div>
    </div>
  );
}
