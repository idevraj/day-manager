export type GoalStatus = 'done' | 'on-going' | 'not-yet';
export type GoalDays = 1 | 7 | 15 | 30 | 45 | 90 | 150 | 180 | 270 | 365;
export type GoalValue = 'IMP' | 'NIMP' | 'VIMP' | 'VVIMP';

export const GOAL_DAYS_OPTIONS: GoalDays[] = [1, 7, 15, 30, 45, 90, 150, 180, 270, 365];
export const GOAL_STATUS_OPTIONS: GoalStatus[] = ['done', 'on-going', 'not-yet'];
export const GOAL_VALUE_OPTIONS: { value: GoalValue; label: string }[] = [
  { value: 'VVIMP', label: 'Very Very Important' },
  { value: 'VIMP', label: 'Very Important' },
  { value: 'IMP', label: 'Important' },
  { value: 'NIMP', label: 'Not Important' },
];

export interface Goal {
  id: string;
  name: string;
  status: GoalStatus;
  days: GoalDays;
  value: GoalValue;
  createdAt: string;
  completedAt?: string;
}

export type AppSection = 'habits' | 'journal' | 'goals';
export type GoalAnalyticsPeriod = 'weekly' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';
