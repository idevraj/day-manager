export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  howWasYourDay: string;
  productiveThing: string;
  learnedToday: string;
  missedToday: string;
  tomorrowPlan: string;
  screenTime: string;
  dayRating: number; // 0-5
  // Phone usage metrics
  socialMediaTime: string;
  firstPickupTime: string;
  createdAt: string;
  updatedAt: string;
}

export const SCREEN_TIME_OPTIONS = [
  '1H', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', '10H', '11H', '12H+'
] as const;

export const SOCIAL_MEDIA_TIME_OPTIONS = [
  '0-30min', '30min-1H', '1-2H', '2-3H', '3-4H', '4-5H', '5H+'
] as const;

export const TIME_OF_DAY_OPTIONS = [
  '5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM',
  '9:00 PM', '10:00 PM', '11:00 PM', '12:00 AM', '1:00 AM', '2:00 AM'
] as const;

export type ScreenTimeOption = typeof SCREEN_TIME_OPTIONS[number];

export const JOURNAL_HEADINGS = [
  { key: 'howWasYourDay', label: 'How was your day?', icon: '🌅' },
  { key: 'productiveThing', label: 'The productive thing you have done today?', icon: '⚡' },
  { key: 'learnedToday', label: 'What you have learned today?', icon: '📚' },
  { key: 'missedToday', label: 'What important thing you have missed today?', icon: '❌' },
  { key: 'tomorrowPlan', label: "What's your plan for tomorrow?", icon: '📋' },
] as const;

export type JournalHeadingKey = typeof JOURNAL_HEADINGS[number]['key'];

// Motivational quotes for the journal
export const MOTIVATIONAL_QUOTES = [
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs", emoji: "💼" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", emoji: "✨" },
  { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", emoji: "🐢" },
  { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", emoji: "🦁" },
  { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", emoji: "🌟" },
  { quote: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs", emoji: "⏰" },
  { quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", emoji: "🎯" },
  { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", emoji: "🌱" },
  { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", emoji: "⏱️" },
  { quote: "Everything you've ever wanted is on the other side of fear.", author: "George Addair", emoji: "🚀" },
  { quote: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis", emoji: "🎨" },
  { quote: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt", emoji: "💪" },
  { quote: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson", emoji: "❤️" },
  { quote: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll", emoji: "🧠" },
  { quote: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu", emoji: "👣" },
  { quote: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe", emoji: "🏃" },
  { quote: "Small daily improvements are the key to staggering long-term results.", author: "Unknown", emoji: "📈" },
  { quote: "Your phone should be a tool, not a leash.", author: "Cal Newport", emoji: "📱" },
  { quote: "Disconnect to reconnect with yourself.", author: "Unknown", emoji: "🔌" },
  { quote: "Every moment spent scrolling is a moment not spent living.", author: "Unknown", emoji: "📵" },
] as const;
