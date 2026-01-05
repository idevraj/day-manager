import { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Target, BookOpen, Smartphone, Award, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JournalEntry } from '@/types/journal';
import { cn } from '@/lib/utils';

interface MonthlySummaryProps {
  entries: JournalEntry[];
  isOpen: boolean;
  onClose: () => void;
}

export function MonthlySummary({ entries, isOpen, onClose }: MonthlySummaryProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const monthlyStats = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const monthEntries = entries.filter(e => {
      const entryDate = new Date(e.date);
      return isSameMonth(entryDate, selectedMonth);
    });

    // Calculate completion rate
    const completedDays = monthEntries.filter(e => 
      e.howWasYourDay || e.productiveThing || e.learnedToday || e.missedToday || e.tomorrowPlan
    ).length;
    const completionRate = daysInMonth.length > 0 ? (completedDays / daysInMonth.length) * 100 : 0;

    // Average rating
    const ratedEntries = monthEntries.filter(e => e.dayRating > 0);
    const avgRating = ratedEntries.length > 0 
      ? ratedEntries.reduce((sum, e) => sum + e.dayRating, 0) / ratedEntries.length 
      : 0;

    // Total words
    const totalWords = monthEntries.reduce((sum, e) => {
      const count = (field: string) => field?.split(/\s+/).filter(Boolean).length || 0;
      return sum + count(e.howWasYourDay) + count(e.productiveThing) + 
             count(e.learnedToday) + count(e.missedToday) + count(e.tomorrowPlan);
    }, 0);

    // Screen time stats
    const screenTimeToHours = (st: string) => {
      if (!st) return 0;
      const match = st.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    };
    const screenTimeEntries = monthEntries.filter(e => e.screenTime);
    const avgScreenTime = screenTimeEntries.length > 0
      ? screenTimeEntries.reduce((sum, e) => sum + screenTimeToHours(e.screenTime), 0) / screenTimeEntries.length
      : 0;

    // Social media stats
    const socialToMinutes = (sm: string) => {
      if (!sm) return 0;
      if (sm.includes('30min')) return 30;
      if (sm.includes('1-2')) return 90;
      if (sm.includes('2-3')) return 150;
      if (sm.includes('3+')) return 200;
      return 0;
    };
    const socialEntries = monthEntries.filter(e => e.socialMediaTime);
    const avgSocialMedia = socialEntries.length > 0
      ? socialEntries.reduce((sum, e) => sum + socialToMinutes(e.socialMediaTime), 0) / socialEntries.length
      : 0;

    // Best/Worst days
    const bestDay = [...monthEntries].sort((a, b) => b.dayRating - a.dayRating)[0];
    const worstDay = [...monthEntries].filter(e => e.dayRating > 0).sort((a, b) => a.dayRating - b.dayRating)[0];

    return {
      completionRate,
      avgRating,
      totalWords,
      avgScreenTime,
      avgSocialMedia,
      totalEntries: monthEntries.length,
      daysInMonth: daysInMonth.length,
      bestDay,
      worstDay,
    };
  }, [entries, selectedMonth]);

  const handlePrevMonth = () => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="card-neon w-full max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6 text-neon-purple" />
            <span className="neon-text-purple">Monthly Summary</span>
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-destructive/20">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-lg font-semibold min-w-[150px] text-center">
            {format(selectedMonth, 'MMMM yyyy')}
          </span>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={<Target className="w-5 h-5 text-neon-purple" />}
            label="Completion"
            value={`${monthlyStats.completionRate.toFixed(0)}%`}
            trend={monthlyStats.completionRate >= 70 ? 'up' : 'down'}
          />
          <StatCard
            icon={<span className="text-lg">⭐</span>}
            label="Avg Rating"
            value={monthlyStats.avgRating.toFixed(1)}
            trend={monthlyStats.avgRating >= 3.5 ? 'up' : 'down'}
          />
          <StatCard
            icon={<BookOpen className="w-5 h-5 text-neon-cyan" />}
            label="Total Words"
            value={monthlyStats.totalWords.toLocaleString()}
          />
          <StatCard
            icon={<Smartphone className="w-5 h-5 text-neon-pink" />}
            label="Avg Screen Time"
            value={`${monthlyStats.avgScreenTime.toFixed(1)}H`}
            trend={monthlyStats.avgScreenTime <= 4 ? 'up' : 'down'}
          />
        </div>

        {/* Detailed Stats */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">📱 Phone Usage Overview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Social Media</span>
                  <span className="font-medium">{Math.round(monthlyStats.avgSocialMedia)} min/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days Tracked</span>
                  <span className="font-medium">{monthlyStats.totalEntries}/{monthlyStats.daysInMonth}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">📝 Journal Highlights</h3>
              <div className="space-y-2 text-sm">
                {monthlyStats.bestDay && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best Day</span>
                    <span className="font-medium text-neon-green">
                      {format(new Date(monthlyStats.bestDay.date), 'MMM d')} ({monthlyStats.bestDay.dayRating}⭐)
                    </span>
                  </div>
                )}
                {monthlyStats.worstDay && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hardest Day</span>
                    <span className="font-medium text-neon-orange">
                      {format(new Date(monthlyStats.worstDay.date), 'MMM d')} ({monthlyStats.worstDay.dayRating}⭐)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-neon-purple/10 to-neon-pink/10 border border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Monthly Progress</span>
              <span className="text-sm text-muted-foreground">{monthlyStats.totalEntries} entries</span>
            </div>
            <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-neon-purple to-neon-pink rounded-full transition-all duration-500"
                style={{ width: `${monthlyStats.completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: 'up' | 'down';
}

function StatCard({ icon, label, value, trend }: StatCardProps) {
  return (
    <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 text-center">
      <div className="flex items-center justify-center gap-1 mb-1">
        {icon}
        {trend && (
          trend === 'up' 
            ? <TrendingUp className="w-4 h-4 text-neon-green" />
            : <TrendingDown className="w-4 h-4 text-neon-orange" />
        )}
      </div>
      <div className="text-lg sm:text-xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
