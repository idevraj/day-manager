import { useState, useEffect, useCallback, useMemo } from 'react';
import { Goal, GoalStatus, GoalDays, GoalValue } from '@/types/goal';

const STORAGE_KEY = 'goals-manager-data';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setGoals(JSON.parse(stored));
    }
  }, []);

  const saveGoals = useCallback((newGoals: Goal[]) => {
    setGoals(newGoals);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newGoals));
  }, []);

  const addGoal = useCallback((name: string, status: GoalStatus, days: GoalDays, value: GoalValue) => {
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      name,
      status,
      days,
      value,
      createdAt: new Date().toISOString(),
    };
    setGoals(prev => {
      const updated = [...prev, newGoal];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => {
      const updated = prev.filter(g => g.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => {
    setGoals(prev => {
      const updated = prev.map(g => {
        if (g.id !== id) return g;
        const updatedGoal = { ...g, ...updates };
        if (updates.status === 'done' && g.status !== 'done') {
          updatedGoal.completedAt = new Date().toISOString();
        } else if (updates.status !== 'done' && g.status === 'done') {
          updatedGoal.completedAt = undefined;
        }
        return updatedGoal;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const reorderGoals = useCallback((newGoals: Goal[]) => {
    saveGoals(newGoals);
  }, [saveGoals]);

  const getGoalStats = useCallback(() => {
    const total = goals.length;
    const done = goals.filter(g => g.status === 'done').length;
    const ongoing = goals.filter(g => g.status === 'on-going').length;
    const notYet = goals.filter(g => g.status === 'not-yet').length;
    
    return { total, done, ongoing, notYet };
  }, [goals]);

  const getGoalsByValue = useCallback(() => {
    return {
      vvimp: goals.filter(g => g.value === 'VVIMP'),
      vimp: goals.filter(g => g.value === 'VIMP'),
      imp: goals.filter(g => g.value === 'IMP'),
      nimp: goals.filter(g => g.value === 'NIMP'),
    };
  }, [goals]);

  const getSuggestions = useCallback((): string[] => {
    const suggestions: string[] = [];
    const now = new Date();

    // High priority unstarted goals
    const urgentGoals = goals.filter(g => 
      g.status === 'not-yet' && 
      (g.value === 'VVIMP' || g.value === 'VIMP')
    );
    if (urgentGoals.length > 0) {
      suggestions.push(`🔥 You have ${urgentGoals.length} high-priority goal(s) not started yet. Consider beginning with "${urgentGoals[0].name}".`);
    }

    // Goals with short deadlines still on-going
    const shortDeadlineGoals = goals.filter(g => 
      g.status === 'on-going' && g.days <= 7
    );
    if (shortDeadlineGoals.length > 0) {
      suggestions.push(`⏰ ${shortDeadlineGoals.length} goal(s) with short deadlines (≤7 days) are still in progress. Focus on completing them!`);
    }

    // Long-term goals that need attention
    const longTermOngoing = goals.filter(g => 
      g.status === 'on-going' && g.days >= 180
    );
    if (longTermOngoing.length > 0) {
      suggestions.push(`📅 You have ${longTermOngoing.length} long-term goal(s) in progress. Break them into smaller milestones for better tracking.`);
    }

    // Celebrate completions
    const recentlyCompleted = goals.filter(g => {
      if (g.status !== 'done' || !g.completedAt) return false;
      const completedDate = new Date(g.completedAt);
      const daysDiff = Math.floor((now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    });
    if (recentlyCompleted.length > 0) {
      suggestions.push(`🎉 Great job! You completed ${recentlyCompleted.length} goal(s) in the last week. Keep the momentum going!`);
    }

    // Balance suggestions
    const byValue = getGoalsByValue();
    if (byValue.nimp.length > byValue.vvimp.length + byValue.vimp.length) {
      suggestions.push(`💡 Consider focusing more on important goals. You have more low-priority than high-priority goals.`);
    }

    if (suggestions.length === 0) {
      suggestions.push(`✨ You're doing great! Keep tracking your goals consistently.`);
    }

    return suggestions.slice(0, 4);
  }, [goals, getGoalsByValue]);

  return {
    goals,
    addGoal,
    deleteGoal,
    updateGoal,
    reorderGoals,
    getGoalStats,
    getGoalsByValue,
    getSuggestions,
  };
}
