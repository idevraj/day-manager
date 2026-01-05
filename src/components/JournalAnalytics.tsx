import { useState, useMemo } from 'react';
import { format, subDays, subMonths, parseISO, eachDayOfInterval, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend } from 'recharts';
import { useJournal } from '@/hooks/useJournal';
import { JOURNAL_HEADINGS, JournalEntry } from '@/types/journal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, FileText, Star, Clock, TrendingUp, Smartphone, Calendar } from 'lucide-react';

const CHART_COLORS = [
  'hsl(258 90% 66%)',
  'hsl(187 100% 42%)',
  'hsl(350 89% 60%)',
  'hsl(38 92% 50%)',
  'hsl(160 84% 39%)',
];

interface JournalAnalyticsProps {
  entries: JournalEntry[];
}

// Helper to convert screen time to hours
function screenTimeToHours(value: string): number {
  if (!value) return 0;
  const num = parseInt(value.replace('H+', '').replace('H', ''));
  return isNaN(num) ? 0 : num;
}

// Helper to convert social media time to minutes
function socialMediaToMinutes(value: string): number {
  if (!value) return 0;
  if (value.includes('0-30')) return 15;
  if (value.includes('30min-1H')) return 45;
  if (value.includes('1-2')) return 90;
  if (value.includes('2-3')) return 150;
  if (value.includes('3-4')) return 210;
  if (value.includes('4-5')) return 270;
  if (value.includes('5H+')) return 330;
  return 0;
}

export function JournalAnalytics({ entries }: JournalAnalyticsProps) {
  const { getAnalytics } = useJournal();
  const [dateRange, setDateRange] = useState('30');

  const endDate = new Date();
  const startDate = useMemo(() => {
    const days = parseInt(dateRange);
    return days === 365 ? subMonths(endDate, 12) : subDays(endDate, days);
  }, [dateRange, endDate]);

  const analytics = useMemo(() => getAnalytics(startDate, endDate), [getAnalytics, startDate, endDate]);

  // Filter entries for the selected range
  const rangeEntries = useMemo(() => 
    entries.filter(e => {
      const date = parseISO(e.date);
      return isWithinInterval(date, { start: startDate, end: endDate });
    }).sort((a, b) => a.date.localeCompare(b.date)),
    [entries, startDate, endDate]
  );

  const headingChartData = useMemo(() => 
    JOURNAL_HEADINGS.map((h, i) => ({
      name: h.label.split(' ').slice(0, 3).join(' ') + '...',
      fullName: h.label,
      words: analytics.headingWordCounts[h.key as keyof typeof analytics.headingWordCounts],
      fill: CHART_COLORS[i],
    })),
    [analytics]
  );

  const screenTimeChartData = useMemo(() => 
    Object.entries(analytics.screenTimeData)
      .map(([time, count]) => ({ name: time, count }))
      .sort((a, b) => parseInt(a.name) - parseInt(b.name)),
    [analytics]
  );

  const ratingChartData = useMemo(() => 
    analytics.ratingDistribution.map((count, i) => ({
      rating: i === 0 ? 'Not Rated' : `${i} Star${i > 1 ? 's' : ''}`,
      count,
    })).filter(d => d.count > 0),
    [analytics]
  );

  const dailyWordsData = useMemo(() => 
    analytics.dailyWordCounts
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
      .map(d => ({
        date: format(new Date(d.date), 'MMM d'),
        words: d.words,
      })),
    [analytics]
  );

  // Weekly phone usage trend data
  const weeklyPhoneUsageData = useMemo(() => {
    if (rangeEntries.length === 0) return [];
    
    // Group entries by week
    const weeklyData: { week: string; screenTime: number; socialMedia: number; count: number }[] = [];
    const weeks = new Map<string, { screenTime: number; socialMedia: number; count: number }>();
    
    rangeEntries.forEach(entry => {
      const date = parseISO(entry.date);
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekKey = format(weekStart, 'MMM d');
      
      const existing = weeks.get(weekKey) || { screenTime: 0, socialMedia: 0, count: 0 };
      weeks.set(weekKey, {
        screenTime: existing.screenTime + screenTimeToHours(entry.screenTime),
        socialMedia: existing.socialMedia + socialMediaToMinutes(entry.socialMediaTime),
        count: existing.count + 1,
      });
    });
    
    weeks.forEach((data, week) => {
      weeklyData.push({
        week,
        screenTime: Math.round(data.screenTime / data.count * 10) / 10,
        socialMedia: Math.round(data.socialMedia / data.count),
        count: data.count,
      });
    });
    
    return weeklyData.slice(-8); // Last 8 weeks
  }, [rangeEntries]);

  // Daily screen time trend
  const dailyScreenTimeData = useMemo(() => {
    return rangeEntries
      .slice(-14)
      .map(entry => ({
        date: format(parseISO(entry.date), 'MMM d'),
        screenTime: screenTimeToHours(entry.screenTime),
        socialMedia: socialMediaToMinutes(entry.socialMediaTime) / 60, // Convert to hours for same scale
      }));
  }, [rangeEntries]);

  // First pickup time distribution
  const pickupTimeData = useMemo(() => {
    const distribution: Record<string, number> = {};
    rangeEntries.forEach(entry => {
      if (entry.firstPickupTime) {
        const hour = entry.firstPickupTime.split(':')[0] + ':00 ' + entry.firstPickupTime.split(' ')[1];
        distribution[hour] = (distribution[hour] || 0) + 1;
      }
    });
    return Object.entries(distribution)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => {
        const getHour = (t: string) => {
          const [h, period] = [parseInt(t.split(':')[0]), t.includes('PM')];
          return period && h !== 12 ? h + 12 : h === 12 && !period ? 0 : h;
        };
        return getHour(a.time) - getHour(b.time);
      });
  }, [rangeEntries]);

  // Calculate averages
  const avgScreenTime = useMemo(() => {
    const entriesWithData = rangeEntries.filter(e => e.screenTime);
    if (entriesWithData.length === 0) return 0;
    const total = entriesWithData.reduce((sum, e) => sum + screenTimeToHours(e.screenTime), 0);
    return Math.round(total / entriesWithData.length * 10) / 10;
  }, [rangeEntries]);

  const avgSocialMedia = useMemo(() => {
    const entriesWithData = rangeEntries.filter(e => e.socialMediaTime);
    if (entriesWithData.length === 0) return 0;
    const total = entriesWithData.reduce((sum, e) => sum + socialMediaToMinutes(e.socialMediaTime), 0);
    return Math.round(total / entriesWithData.length);
  }, [rangeEntries]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Date Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold neon-text-primary flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Journal Analytics
        </h2>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border z-50">
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="card-neon p-3 sm:p-4 text-center">
          <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="text-xl sm:text-2xl font-bold neon-text-primary">{analytics.totalEntries}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Journal Entries</div>
        </div>
        <div className="card-neon p-3 sm:p-4 text-center">
          <span className="text-2xl block mb-1">📝</span>
          <div className="text-xl sm:text-2xl font-bold neon-text-primary">{analytics.totalWords.toLocaleString()}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Total Words</div>
        </div>
        <div className="card-neon p-3 sm:p-4 text-center">
          <Star className="w-6 h-6 mx-auto mb-2 text-amber-400" />
          <div className="text-xl sm:text-2xl font-bold text-amber-400">{analytics.avgRating}/5</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Avg Rating</div>
        </div>
        <div className="card-neon p-3 sm:p-4 text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-neon-purple" />
          <div className="text-xl sm:text-2xl font-bold text-neon-purple">{analytics.completionRate}%</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Completion</div>
        </div>
      </div>

      {/* Phone Usage Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="card-neon p-3 sm:p-4 text-center">
          <Smartphone className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="text-xl sm:text-2xl font-bold neon-text-primary">{avgScreenTime}H</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Avg Screen Time</div>
        </div>
        <div className="card-neon p-3 sm:p-4 text-center">
          <span className="text-2xl block mb-1">📱</span>
          <div className="text-xl sm:text-2xl font-bold neon-text-primary">{avgSocialMedia}m</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Avg Social Media</div>
        </div>
      </div>

      {/* Heading Rankings */}
      <div className="card-neon p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Heading Word Count Rankings
        </h3>
        <div className="space-y-3">
          {analytics.headingRanks.map((rank, index) => {
            const heading = JOURNAL_HEADINGS.find(h => h.key === rank.key);
            return (
              <div key={rank.key} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-amber-500/20 text-amber-400' :
                  index === 1 ? 'bg-gray-400/20 text-gray-400' :
                  index === 2 ? 'bg-amber-700/20 text-amber-600' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium flex items-center gap-1.5">
                      <span>{heading?.icon}</span>
                      <span className="truncate max-w-[200px] sm:max-w-none">{heading?.label}</span>
                    </span>
                    <span className="text-sm text-primary font-semibold">{rank.count} words</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${rank.percentage}%`,
                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phone Usage Trends */}
      {dailyScreenTimeData.length > 0 && (
        <div className="card-neon p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Daily Screen Time Trend
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyScreenTimeData}>
                <defs>
                  <linearGradient id="screenTimeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(258 90% 66%)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(258 90% 66%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="socialGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(350 89% 60%)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(350 89% 60%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: 'Hours', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'screenTime' ? `${value}H` : `${Math.round(value * 60)}m`,
                    name === 'screenTime' ? 'Screen Time' : 'Social Media'
                  ]}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="screenTime" 
                  name="Screen Time"
                  stroke="hsl(258 90% 66%)" 
                  strokeWidth={2}
                  fill="url(#screenTimeGradient)"
                />
                <Area 
                  type="monotone" 
                  dataKey="socialMedia" 
                  name="Social Media"
                  stroke="hsl(350 89% 60%)" 
                  strokeWidth={2}
                  fill="url(#socialGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Weekly Averages */}
      {weeklyPhoneUsageData.length > 0 && (
        <div className="card-neon p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Weekly Averages
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyPhoneUsageData}>
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'screenTime' ? `${value}H avg` : `${value}m avg`,
                    name === 'screenTime' ? 'Screen Time' : 'Social Media'
                  ]}
                />
                <Legend />
                <Bar dataKey="screenTime" name="Screen Time (H)" fill="hsl(258 90% 66%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="socialMedia" name="Social Media (min)" fill="hsl(350 89% 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* First Pickup Distribution */}
      {pickupTimeData.length > 0 && (
        <div className="card-neon p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
            🌅 First Pickup Time Distribution
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pickupTimeData}>
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value} days`, 'Count']}
                />
                <Bar dataKey="count" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Words Per Heading Bar Chart */}
        <div className="card-neon p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Words by Category</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={headingChartData} layout="vertical">
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={80} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number, name: string, props: any) => [value, props.payload.fullName]}
                />
                <Bar dataKey="words" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Words Line Chart */}
        <div className="card-neon p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Daily Word Trend</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyWordsData}>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="words" 
                  stroke="hsl(258 90% 66%)" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(258 90% 66%)', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Screen Time Pie Chart */}
        {screenTimeChartData.length > 0 && (
          <div className="card-neon p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Screen Time Distribution</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={screenTimeChartData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {screenTimeChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Rating Distribution */}
        {ratingChartData.length > 0 && (
          <div className="card-neon p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Rating Distribution</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingChartData}>
                  <XAxis dataKey="rating" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
