import { useState, useEffect, useCallback } from 'react';
import { DetoxChallenge, DEFAULT_CHALLENGES } from '@/types/detoxChallenge';
import { JournalEntry } from '@/types/journal';
import { format } from 'date-fns';

const STORAGE_KEY = 'detox-challenges';

// Helper to check if a screen time value is under a target
function isScreenTimeUnder(value: string, target: string): boolean {
  if (!value) return false;
  const getHours = (v: string) => parseInt(v.replace('H+', '').replace('H', ''));
  return getHours(value) < getHours(target);
}

// Helper to check if social media time is under target
function isSocialMediaUnder(value: string, target: string): boolean {
  if (!value) return false;
  const timeToMinutes = (v: string): number => {
    if (v.includes('30min')) return 30;
    if (v.includes('0-30')) return 30;
    if (v.includes('1H') || v.includes('1-2')) return 60;
    if (v.includes('2-3')) return 150;
    if (v.includes('3-4')) return 210;
    if (v.includes('4-5')) return 270;
    if (v.includes('5H+')) return 300;
    return parseInt(v) || 0;
  };
  const targetMinutes = target === '30min' ? 30 : target === '1H' ? 60 : 120;
  return timeToMinutes(value) <= targetMinutes;
}

// Helper to check if first pickup is after target time
function isFirstPickupAfter(value: string, target: string): boolean {
  if (!value) return false;
  const timeToNumber = (v: string): number => {
    const [time, period] = v.split(' ');
    let [hours] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours;
  };
  return timeToNumber(value) >= timeToNumber(target);
}

export function useDetoxChallenges(journalEntries: JournalEntry[]) {
  const [challenges, setChallenges] = useState<DetoxChallenge[]>([]);

  // Load challenges from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setChallenges(JSON.parse(stored));
    }
  }, []);

  const saveChallenges = useCallback((newChallenges: DetoxChallenge[]) => {
    setChallenges(newChallenges);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newChallenges));
  }, []);

  const addChallenge = useCallback((challengeTemplate: {
    name: string;
    description: string;
    icon: string;
    targetType: 'screenTime' | 'socialMedia' | 'firstPickup' | 'custom';
    targetValue: string;
  }) => {
    const newChallenge: DetoxChallenge = {
      ...challengeTemplate,
      id: crypto.randomUUID(),
      isActive: true,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      currentStreak: 0,
      longestStreak: 0,
      completedDays: [],
    };
    saveChallenges([...challenges, newChallenge]);
  }, [challenges, saveChallenges]);

  const removeChallenge = useCallback((id: string) => {
    saveChallenges(challenges.filter(c => c.id !== id));
  }, [challenges, saveChallenges]);

  const toggleChallenge = useCallback((id: string) => {
    saveChallenges(challenges.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ));
  }, [challenges, saveChallenges]);

  // Check if a challenge is completed for a given date based on journal entry
  const checkChallengeCompletion = useCallback((challenge: DetoxChallenge, entry: JournalEntry): boolean => {
    switch (challenge.targetType) {
      case 'screenTime':
        return isScreenTimeUnder(entry.screenTime, challenge.targetValue);
      case 'socialMedia':
        return isSocialMediaUnder(entry.socialMediaTime, challenge.targetValue);
      case 'firstPickup':
        return isFirstPickupAfter(entry.firstPickupTime, challenge.targetValue);
      default:
        return false;
    }
  }, []);

  // Update streaks based on journal entries
  const updateStreaks = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const updatedChallenges = challenges.map(challenge => {
      if (!challenge.isActive) return challenge;

      // Get all journal entries after challenge start date
      const relevantEntries = journalEntries.filter(e => 
        e.date >= challenge.startDate && e.date <= today
      ).sort((a, b) => b.date.localeCompare(a.date)); // Most recent first

      // Check completion for each day
      const completedDays = relevantEntries
        .filter(entry => checkChallengeCompletion(challenge, entry))
        .map(e => e.date);

      // Calculate current streak (consecutive days from today going back)
      let currentStreak = 0;
      const sortedCompleted = [...completedDays].sort((a, b) => b.localeCompare(a));
      
      for (let i = 0; i < sortedCompleted.length; i++) {
        const expectedDate = format(
          new Date(new Date().setDate(new Date().getDate() - i)),
          'yyyy-MM-dd'
        );
        if (sortedCompleted.includes(expectedDate)) {
          currentStreak++;
        } else {
          break;
        }
      }

      const longestStreak = Math.max(challenge.longestStreak, currentStreak);

      return {
        ...challenge,
        completedDays,
        currentStreak,
        longestStreak,
      };
    });

    if (JSON.stringify(updatedChallenges) !== JSON.stringify(challenges)) {
      saveChallenges(updatedChallenges);
    }
  }, [challenges, journalEntries, checkChallengeCompletion, saveChallenges]);

  // Update streaks when journal entries change
  useEffect(() => {
    if (challenges.length > 0 && journalEntries.length > 0) {
      updateStreaks();
    }
  }, [journalEntries.length]);

  return {
    challenges,
    addChallenge,
    removeChallenge,
    toggleChallenge,
    availableChallenges: DEFAULT_CHALLENGES.filter(
      dc => !challenges.some(c => c.name === dc.name)
    ),
  };
}
