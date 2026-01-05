export const HABIT_COLORS = [
  { name: 'Teal', value: '187 100% 42%', class: 'bg-primary' },
  { name: 'Emerald', value: '160 84% 39%', class: 'bg-emerald-500' },
  { name: 'Violet', value: '258 90% 66%', class: 'bg-violet-500' },
  { name: 'Rose', value: '350 89% 60%', class: 'bg-rose-500' },
  { name: 'Amber', value: '38 92% 50%', class: 'bg-amber-500' },
  { name: 'Sky', value: '199 89% 48%', class: 'bg-sky-500' },
  { name: 'Lime', value: '84 81% 44%', class: 'bg-lime-500' },
  { name: 'Pink', value: '330 81% 60%', class: 'bg-pink-500' },
] as const;

export type HabitColor = typeof HABIT_COLORS[number];

export interface Habit {
  id: string;
  name: string;
  color: string; // HSL value
  completedDays: number[]; // Array of day numbers (1-31) that are completed
  createdAt: string;
}

export type ViewMode = 'monthly' | 'weekly' | 'analytics';
