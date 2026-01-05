import { useState, useEffect, useCallback, useMemo } from 'react';
import { JournalEntry, JournalHeadingKey } from '@/types/journal';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';

const STORAGE_KEY = 'journal-data';

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  // Load entries from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setEntries(JSON.parse(stored));
    }
  }, []);

  const saveEntries = useCallback((newEntries: JournalEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('journal-updated'));
  }, []);

  const getEntryByDate = useCallback((date: Date): JournalEntry | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return entries.find(e => e.date === dateStr);
  }, [entries]);

  const createOrUpdateEntry = useCallback((date: Date, updates: Partial<Omit<JournalEntry, 'id' | 'date' | 'createdAt' | 'updatedAt'>>) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existing = entries.find(e => e.date === dateStr);
    
    if (existing) {
      const updatedEntries = entries.map(e => 
        e.date === dateStr 
          ? { ...e, ...updates, updatedAt: new Date().toISOString() }
          : e
      );
      saveEntries(updatedEntries);
    } else {
      const newEntry: JournalEntry = {
        id: crypto.randomUUID(),
        date: dateStr,
        howWasYourDay: '',
        productiveThing: '',
        learnedToday: '',
        missedToday: '',
        tomorrowPlan: '',
        screenTime: '',
        dayRating: 0,
        socialMediaTime: '',
        firstPickupTime: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...updates,
      };
      saveEntries([...entries, newEntry]);
    }
  }, [entries, saveEntries]);

  const updateField = useCallback((date: Date, field: JournalHeadingKey | 'screenTime' | 'dayRating' | 'socialMediaTime' | 'firstPickupTime', value: string | number) => {
    createOrUpdateEntry(date, { [field]: value });
  }, [createOrUpdateEntry]);

  const getWordCount = useCallback((text: string): number => {
    if (!text || text.trim() === '') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, []);

  const getEntriesInRange = useCallback((startDate: Date, endDate: Date): JournalEntry[] => {
    return entries.filter(entry => {
      const entryDate = parseISO(entry.date);
      return isWithinInterval(entryDate, { start: startDate, end: endDate });
    });
  }, [entries]);

  const getAnalytics = useCallback((startDate: Date, endDate: Date) => {
    const rangeEntries = getEntriesInRange(startDate, endDate);
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Word counts per heading
    const headingWordCounts = {
      howWasYourDay: 0,
      productiveThing: 0,
      learnedToday: 0,
      missedToday: 0,
      tomorrowPlan: 0,
    };

    let totalRating = 0;
    let ratedDays = 0;
    const screenTimeData: Record<string, number> = {};
    const dailyWordCounts: { date: string; words: number }[] = [];
    const ratingDistribution = [0, 0, 0, 0, 0, 0]; // 0-5 ratings

    rangeEntries.forEach(entry => {
      // Word counts
      headingWordCounts.howWasYourDay += getWordCount(entry.howWasYourDay);
      headingWordCounts.productiveThing += getWordCount(entry.productiveThing);
      headingWordCounts.learnedToday += getWordCount(entry.learnedToday);
      headingWordCounts.missedToday += getWordCount(entry.missedToday);
      headingWordCounts.tomorrowPlan += getWordCount(entry.tomorrowPlan);

      // Daily word count
      const dayWords = getWordCount(entry.howWasYourDay) + 
                       getWordCount(entry.productiveThing) + 
                       getWordCount(entry.learnedToday) + 
                       getWordCount(entry.missedToday) + 
                       getWordCount(entry.tomorrowPlan);
      dailyWordCounts.push({ date: entry.date, words: dayWords });

      // Ratings
      if (entry.dayRating > 0) {
        totalRating += entry.dayRating;
        ratedDays++;
        ratingDistribution[entry.dayRating]++;
      }

      // Screen time
      if (entry.screenTime) {
        screenTimeData[entry.screenTime] = (screenTimeData[entry.screenTime] || 0) + 1;
      }
    });

    const totalWords = Object.values(headingWordCounts).reduce((a, b) => a + b, 0);
    const avgRating = ratedDays > 0 ? totalRating / ratedDays : 0;
    const completionRate = allDays.length > 0 ? (rangeEntries.length / allDays.length) * 100 : 0;

    // Rank headings by word count
    const headingRanks = Object.entries(headingWordCounts)
      .map(([key, count]) => ({ key, count, percentage: totalWords > 0 ? (count / totalWords) * 100 : 0 }))
      .sort((a, b) => b.count - a.count);

    return {
      totalEntries: rangeEntries.length,
      totalWords,
      avgWordsPerEntry: rangeEntries.length > 0 ? Math.round(totalWords / rangeEntries.length) : 0,
      avgRating: Math.round(avgRating * 10) / 10,
      completionRate: Math.round(completionRate),
      headingWordCounts,
      headingRanks,
      screenTimeData,
      dailyWordCounts,
      ratingDistribution,
    };
  }, [getEntriesInRange, getWordCount]);

  return {
    entries,
    getEntryByDate,
    createOrUpdateEntry,
    updateField,
    getWordCount,
    getEntriesInRange,
    getAnalytics,
  };
}
