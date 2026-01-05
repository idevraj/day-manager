import { useState, useEffect, useMemo, useCallback } from 'react';
import { Habit, HABIT_COLORS } from '@/types/habit';

const STORAGE_KEY = 'habit-tracker-data';

export function useHabits(selectedMonth: Date) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = useMemo(() => 
    `${STORAGE_KEY}-${selectedMonth.getFullYear()}-${selectedMonth.getMonth()}`,
    [selectedMonth]
  );

  // Auto-migrate habits to new month if needed
  useEffect(() => {
    const now = new Date();
    const currentMonthKey = `${STORAGE_KEY}-${now.getFullYear()}-${now.getMonth()}`;
    const stored = localStorage.getItem(currentMonthKey);
    
    // If current month has no habits, try to carry over from last month
    if (!stored) {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthKey = `${STORAGE_KEY}-${lastMonth.getFullYear()}-${lastMonth.getMonth()}`;
      const lastMonthData = localStorage.getItem(lastMonthKey);
      
      if (lastMonthData) {
        const lastMonthHabits: Habit[] = JSON.parse(lastMonthData);
        // Carry habits forward with empty completedDays
        const newMonthHabits = lastMonthHabits.map(h => ({
          ...h,
          completedDays: [],
        }));
        localStorage.setItem(currentMonthKey, JSON.stringify(newMonthHabits));
      }
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    // Simulate brief loading for smooth skeleton transition
    const timer = setTimeout(() => {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migrate old habits without color
        const migratedHabits = parsed.map((h: Habit, index: number) => ({
          ...h,
          color: h.color || HABIT_COLORS[index % HABIT_COLORS.length].value,
        }));
        setHabits(migratedHabits);
      } else {
        setHabits([]);
      }
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [storageKey]);

  const saveHabits = useCallback((newHabits: Habit[]) => {
    setHabits(newHabits);
    localStorage.setItem(storageKey, JSON.stringify(newHabits));
  }, [storageKey]);

  const addHabit = useCallback((name: string, color: string) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      color,
      completedDays: [],
      createdAt: new Date().toISOString(),
    };
    setHabits(prev => {
      const updated = [...prev, newHabit];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  }, [storageKey]);

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => {
      const updated = prev.filter(h => h.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  }, [storageKey]);

  const updateHabit = useCallback((id: string, name: string, color?: string) => {
    setHabits(prev => {
      const updated = prev.map(h => {
        if (h.id !== id) return h;
        return { 
          ...h, 
          name,
          color: color ?? h.color,
        };
      });
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  }, [storageKey]);

  const reorderHabits = useCallback((newHabits: Habit[]) => {
    saveHabits(newHabits);
  }, [saveHabits]);

  const toggleDay = useCallback((habitId: string, day: number) => {
    // Only allow toggling today and past 2 days (3 days total)
    const now = new Date();
    const isCurrentMonth = 
      selectedMonth.getFullYear() === now.getFullYear() && 
      selectedMonth.getMonth() === now.getMonth();
    
    if (!isCurrentMonth) return; // Can't edit past months
    
    const today = now.getDate();
    if (day < today - 2 || day > today) return; // Only today and past 2 days
    
    setHabits(prev => {
      const updated = prev.map(h => {
        if (h.id !== habitId) return h;
        const isCompleted = h.completedDays.includes(day);
        return {
          ...h,
          completedDays: isCompleted
            ? h.completedDays.filter(d => d !== day)
            : [...h.completedDays, day],
        };
      });
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  }, [selectedMonth, storageKey]);

  const getDaysInMonth = useCallback(() => {
    return new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
  }, [selectedMonth]);

  const getCompletionStats = useCallback(() => {
    const daysInMonth = getDaysInMonth();

    // Total possible = habits × all days in month
    let totalPossible = habits.length * daysInMonth;
    let totalCompleted = habits.reduce((sum, h) => sum + h.completedDays.length, 0);

    return {
      completed: totalCompleted,
      total: totalPossible,
      percentage: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0,
    };
  }, [habits, getDaysInMonth]);

  const getHeatmapData = useCallback(() => {
    const daysInMonth = getDaysInMonth();
    const heatmap: number[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const completedCount = habits.filter(h => h.completedDays.includes(day)).length;
      heatmap.push(completedCount);
    }

    return heatmap;
  }, [habits, getDaysInMonth]);

  return {
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
  };
}