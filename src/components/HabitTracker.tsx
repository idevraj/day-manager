import { useState, useEffect, useMemo, useCallback } from 'react';
import { ViewMode, Habit } from '@/types/habit';
import { Goal, AppSection } from '@/types/goal';
import { useHabits } from '@/hooks/useHabits';
import { useGoals } from '@/hooks/useGoals';
import { useSwipe } from '@/hooks/useSwipe';
import { LiveClock } from './LiveClock';
import { SectionToggle } from './SectionToggle';
import { ViewToggle } from './ViewToggle';
import { ProgressCard } from './ProgressCard';
import { Heatmap } from './Heatmap';
import { HabitTable } from './HabitTable';
import { AddHabitDialog } from './AddHabitDialog';
import { EditHabitDialog } from './EditHabitDialog';
import { DeleteHabitDialog } from './DeleteHabitDialog';
import { HabitHeatmap } from './HabitHeatmap';
import { MonthSelector } from './MonthSelector';
import { AnalyticsView } from './AnalyticsView';
import { WeeklyAnalytics } from './WeeklyAnalytics';
import { GoalsManager } from './GoalsManager';
import { JournalManager } from './JournalManager';
import { StreakCounter } from './StreakCounter';
import { ExportDataDialog } from './ExportDataDialog';
import { SupportPopover } from './SupportPopover';
import { ThemeToggle } from './ThemeToggle';
import { Skeleton } from './ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Loading skeleton for habits section
function HabitsLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Progress card skeleton */}
      <div className="card-neon p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        <Skeleton className="h-2 w-full rounded-full mt-3" />
      </div>
      
      {/* Table skeleton */}
      <div className="card-neon p-4 space-y-3">
        <div className="flex items-center gap-4 pb-3 border-b border-border/30">
          <Skeleton className="h-5 w-20 rounded" />
          <div className="flex gap-2 ml-auto">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-10 rounded-lg" />
            ))}
          </div>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div 
            key={i} 
            className={`flex items-center gap-4 py-2 animate-fade-in animate-fill-both stagger-${i + 1}`}
          >
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-32 rounded" />
            <div className="flex gap-2 ml-auto">
              {Array.from({ length: 7 }).map((_, j) => (
                <Skeleton key={j} className="h-10 w-10 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HabitTracker() {
  const [appSection, setAppSection] = useState<AppSection>('habits');
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
  const [swipeHint, setSwipeHint] = useState<'left' | 'right' | null>(null);

  // Swipe navigation handlers
  const now = new Date();
  
  const canGoNext = useMemo(() => {
    const nextMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1);
    return nextMonth.getFullYear() < now.getFullYear() || 
           (nextMonth.getFullYear() === now.getFullYear() && nextMonth.getMonth() <= now.getMonth());
  }, [selectedMonth, now]);

  const handlePrevMonth = useCallback(() => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSwipeHint('right');
    setTimeout(() => setSwipeHint(null), 500);
  }, []);

  const handleNextMonth = useCallback(() => {
    if (canGoNext) {
      setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
      setSwipeHint('left');
      setTimeout(() => setSwipeHint(null), 500);
    }
  }, [canGoNext]);

  // Toggle between sections with swipe
  const handleSwipeSection = useCallback((direction: 'left' | 'right') => {
    const sections: AppSection[] = ['habits', 'journal', 'goals'];
    const currentIndex = sections.indexOf(appSection);
    if (direction === 'left' && currentIndex < sections.length - 1) {
      setAppSection(sections[currentIndex + 1]);
    } else if (direction === 'right' && currentIndex > 0) {
      setAppSection(sections[currentIndex - 1]);
    }
  }, [appSection]);

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => appSection === 'habits' ? handleNextMonth() : handleSwipeSection('left'),
    onSwipeRight: () => appSection === 'habits' ? handlePrevMonth() : handleSwipeSection('right'),
    threshold: 60,
  });

  useEffect(() => {
    const checkMonth = () => {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      if (selectedMonth.getTime() !== currentMonthStart.getTime()) {
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        if (selectedMonth.getTime() === prevMonth.getTime()) {
          setSelectedMonth(currentMonthStart);
        }
      }
    };

    const nowDate = new Date();
    const tomorrow = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - nowDate.getTime();

    const timeout = setTimeout(() => {
      checkMonth();
      const interval = setInterval(checkMonth, 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, [selectedMonth]);

  const {
    habits,
    isLoading,
    addHabit,
    deleteHabit,
    updateHabit,
    reorderHabits,
    toggleDay,
    getDaysInMonth,
    getCompletionStats,
    getHeatmapData,
  } = useHabits(selectedMonth);

  const { goals } = useGoals();

  // Get journal entries for export - re-read on any localStorage update
  const [journalEntries, setJournalEntries] = useState(() => {
    const stored = localStorage.getItem('journal-data');
    return stored ? JSON.parse(stored) : [];
  });

  // Sync journal entries when dialog opens or localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('journal-data');
      setJournalEntries(stored ? JSON.parse(stored) : []);
    };

    // Listen for storage events (cross-tab) and custom events (same tab)
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('journal-updated', handleStorageChange);
    
    // Also refresh on focus to catch any changes
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('journal-updated', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const stats = useMemo(() => getCompletionStats(), [getCompletionStats]);
  const heatmapData = useMemo(() => getHeatmapData(), [getHeatmapData]);
  const daysInMonth = useMemo(() => getDaysInMonth(), [getDaysInMonth]);
  
  const today = new Date();
  const isCurrentMonth = useMemo(() => 
    selectedMonth.getFullYear() === today.getFullYear() && 
    selectedMonth.getMonth() === today.getMonth(),
    [selectedMonth, today]
  );
  const currentDay = isCurrentMonth ? today.getDate() : daysInMonth;

  const handleDeleteConfirm = useCallback(() => {
    if (deletingHabit) {
      deleteHabit(deletingHabit.id);
      setDeletingHabit(null);
    }
  }, [deletingHabit, deleteHabit]);

  const handleEditHabit = useCallback((habit: Habit) => setEditingHabit(habit), []);
  const handleDeleteHabit = useCallback((habit: Habit) => setDeletingHabit(habit), []);

  return (
    <div 
      className="min-h-screen bg-background px-2 sm:px-4 py-4 sm:py-6 smooth-scroll"
      {...swipeHandlers}
    >
      {/* Swipe hint indicator */}
      <div className={`swipe-indicator ${swipeHint ? 'visible' : ''}`}>
        {swipeHint === 'left' && <ChevronRight className="w-4 h-4 inline mr-1" />}
        {swipeHint === 'right' && <ChevronLeft className="w-4 h-4 inline mr-1" />}
        {swipeHint && 'Swipe to navigate'}
      </div>

      {/* Neon ambient background - GPU accelerated */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden gpu-accelerated">
        <div className="absolute top-0 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-primary/8 dark:bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-neon-purple/8 dark:bg-neon-purple/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-[32rem] h-64 sm:h-[32rem] bg-neon-pink/4 dark:bg-neon-pink/4 rounded-full blur-3xl" />
        {/* Additional light mode depth orbs */}
        <div className="hidden light:block absolute top-1/4 right-1/3 w-72 h-72 bg-neon-cyan/5 rounded-full blur-3xl" />
        <div className="hidden light:block absolute bottom-1/3 left-1/3 w-80 h-80 bg-primary/6 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-6 relative z-10">
        <LiveClock />

        {/* Section Toggle */}
        <SectionToggle section={appSection} onSectionChange={setAppSection} />

        {/* Mobile swipe hint */}
        <div className="sm:hidden text-center text-xs text-muted-foreground/60 -mt-2">
          ← Swipe to navigate →
        </div>

        {/* Conditional rendering based on section */}
        {appSection === 'goals' ? (
          <GoalsManager />
        ) : appSection === 'journal' ? (
          <JournalManager />
        ) : (
          <>
            {/* Habit Tracker Header */}
            <div className="glass-card p-3 sm:p-5 flex flex-wrap items-center justify-between gap-2 sm:gap-4 animate-fade-in">
              <h1 className="text-lg sm:text-2xl font-bold neon-text-primary">Habit Tracker</h1>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <MonthSelector 
                  selectedMonth={selectedMonth} 
                  onMonthChange={setSelectedMonth} 
                />
                <AddHabitDialog onAdd={addHabit} />
                <ExportDataDialog habits={habits} goals={goals} journalEntries={journalEntries} selectedMonth={selectedMonth} />
                <SupportPopover />
                <ThemeToggle />
              </div>
            </div>

            {/* Streak Counter */}
            <StreakCounter habits={habits} selectedMonth={selectedMonth} daysInMonth={daysInMonth} />

            {/* View Toggle */}
            <ViewToggle mode={viewMode} onModeChange={setViewMode} />

            {/* Show loading skeleton or content */}
            {isLoading ? (
              <HabitsLoadingSkeleton />
            ) : viewMode === 'analytics' ? (
              <AnalyticsView 
                habits={habits} 
                selectedMonth={selectedMonth}
                daysInMonth={daysInMonth}
              />
            ) : viewMode === 'weekly' ? (
              <>
                <ProgressCard {...stats} />
                <WeeklyAnalytics 
                  habits={habits} 
                  currentDay={currentDay}
                  selectedMonth={selectedMonth}
                />
                <HabitTable
                  habits={habits}
                  daysInMonth={daysInMonth}
                  viewMode={viewMode}
                  currentDay={currentDay}
                  selectedMonth={selectedMonth}
                  onToggleDay={toggleDay}
                  onEdit={handleEditHabit}
                  onDelete={handleDeleteHabit}
                  onReorder={reorderHabits}
                />
              </>
            ) : (
              <>
                <ProgressCard {...stats} />
                {habits.length === 0 && (
                  <div className="card-neon p-8 text-center animate-fade-in">
                    <div className="text-4xl mb-3">📝</div>
                    <p className="text-muted-foreground">No habits yet. Click "Add Habit" to get started!</p>
                  </div>
                )}
                {habits.length > 0 && (
                  <Heatmap 
                    data={heatmapData} 
                    maxValue={habits.length} 
                    selectedMonth={selectedMonth}
                  />
                )}
                <HabitTable
                  habits={habits}
                  daysInMonth={daysInMonth}
                  viewMode={viewMode}
                  currentDay={currentDay}
                  selectedMonth={selectedMonth}
                  onToggleDay={toggleDay}
                  onEdit={handleEditHabit}
                  onDelete={handleDeleteHabit}
                  onReorder={reorderHabits}
                />
                {habits.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 px-1 neon-text-primary">
                      <span>📊</span> Individual Habit Progress
                    </h2>
                    {habits.map(habit => (
                      <HabitHeatmap 
                        key={habit.id} 
                        habit={habit} 
                        daysInMonth={daysInMonth}
                        selectedMonth={selectedMonth}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Edit Dialog */}
            <EditHabitDialog
              habit={editingHabit}
              open={!!editingHabit}
              onOpenChange={(open) => !open && setEditingHabit(null)}
              onSave={updateHabit}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteHabitDialog
              open={!!deletingHabit}
              habitName={deletingHabit?.name || ''}
              onConfirm={handleDeleteConfirm}
              onCancel={() => setDeletingHabit(null)}
            />
          </>
        )}
      </div>
    </div>
  );
}
