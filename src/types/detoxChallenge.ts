export interface DetoxChallenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  targetType: 'screenTime' | 'socialMedia' | 'firstPickup' | 'custom';
  targetValue: string;
  isActive: boolean;
  startDate: string;
  currentStreak: number;
  longestStreak: number;
  completedDays: string[]; // dates in YYYY-MM-DD format
}

export const DEFAULT_CHALLENGES: Omit<DetoxChallenge, 'id' | 'isActive' | 'startDate' | 'currentStreak' | 'longestStreak' | 'completedDays'>[] = [
  {
    name: 'Screen Time Under 4H',
    description: 'Keep total screen time under 4 hours daily',
    icon: '📱',
    targetType: 'screenTime',
    targetValue: '4H',
  },
  {
    name: 'No Social Before 10 AM',
    description: 'Avoid social media before 10:00 AM',
    icon: '🌅',
    targetType: 'firstPickup',
    targetValue: '10:00 AM',
  },
  {
    name: 'Social Media Under 1H',
    description: 'Limit social media usage to under 1 hour',
    icon: '⏰',
    targetType: 'socialMedia',
    targetValue: '1H',
  },
  {
    name: 'Screen Time Under 3H',
    description: 'Keep total screen time under 3 hours daily',
    icon: '🎯',
    targetType: 'screenTime',
    targetValue: '3H',
  },
  {
    name: 'Social Media Under 30min',
    description: 'Keep social media under 30 minutes',
    icon: '🏆',
    targetType: 'socialMedia',
    targetValue: '30min',
  },
  {
    name: 'No Phone First Hour',
    description: 'Wait at least 1 hour after waking before phone use',
    icon: '☀️',
    targetType: 'firstPickup',
    targetValue: '8:00 AM',
  },
];
