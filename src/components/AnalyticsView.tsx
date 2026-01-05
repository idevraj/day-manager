import { useState, useMemo } from 'react';
import { Habit } from '@/types/habit';
import { DateRangePicker } from './DateRangePicker';
import { GripVertical, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { subMonths, format, eachDayOfInterval, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';

interface AnalyticsViewProps {
  habits: Habit[];
  selectedMonth: Date;
  daysInMonth: number;
}

type ChartType = 'bar' | 'line' | 'pie' | 'trend';

interface ChartConfig {
  id: ChartType;
  title: string;
  icon: string;
}

function SortableChart({ 
  id, 
  title, 
  icon, 
  children 
}: { 
  id: string; 
  title: string; 
  icon: string; 
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="chart-container group">
      <div className="flex items-center gap-2 mb-4">
        <button
          className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <h3 className="text-foreground font-semibold flex items-center gap-2">
          <span>{icon}</span> {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

export function AnalyticsView({ habits, selectedMonth, daysInMonth }: AnalyticsViewProps) {
  const today = new Date();
  const [dateRange, setDateRange] = useState({
    start: subMonths(today, 5),
    end: today,
  });

  const [chartOrder, setChartOrder] = useState<ChartConfig[]>([
    { id: 'trend', title: 'Monthly Trend', icon: '📈' },
    { id: 'bar', title: 'Habit Completion Rate', icon: '📊' },
    { id: 'line', title: 'Daily Completion Trend', icon: '📉' },
    { id: 'pie', title: 'Habit Distribution', icon: '🥧' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setChartOrder((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Get data for date range
  const rangeData = useMemo(() => {
    const data = [];
    let currentMonth = startOfMonth(dateRange.start);
    const endMonth = startOfMonth(dateRange.end);

    while (currentMonth <= endMonth) {
      const storageKey = `habit-tracker-data-${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;
      const stored = localStorage.getItem(storageKey);
      const monthHabits: Habit[] = stored ? JSON.parse(stored) : [];
      const daysInThisMonth = getDaysInMonth(currentMonth);

      const totalPossible = monthHabits.length * daysInThisMonth;
      const totalCompleted = monthHabits.reduce((sum, h) => sum + h.completedDays.length, 0);
      const percentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

      // Previous month for comparison
      const prevMonth = subMonths(currentMonth, 1);
      const prevStorageKey = `habit-tracker-data-${prevMonth.getFullYear()}-${prevMonth.getMonth()}`;
      const prevStored = localStorage.getItem(prevStorageKey);
      const prevMonthHabits: Habit[] = prevStored ? JSON.parse(prevStored) : [];
      const prevDays = getDaysInMonth(prevMonth);
      const prevPossible = prevMonthHabits.length * prevDays;
      const prevCompleted = prevMonthHabits.reduce((sum, h) => sum + h.completedDays.length, 0);
      const prevPercentage = prevPossible > 0 ? Math.round((prevCompleted / prevPossible) * 100) : 0;

      data.push({
        month: format(currentMonth, 'MMM'),
        year: currentMonth.getFullYear(),
        fullMonth: format(currentMonth, 'MMMM yyyy'),
        completed: totalCompleted,
        total: totalPossible,
        percentage,
        habits: monthHabits.length,
        trend: percentage - prevPercentage,
      });

      currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    }

    return data;
  }, [dateRange]);

  // Bar chart data
  const barChartData = useMemo(() => {
    return habits.map(habit => ({
      name: habit.name.length > 12 ? habit.name.slice(0, 12) + '...' : habit.name,
      fullName: habit.name,
      completed: habit.completedDays.length,
      total: daysInMonth,
      percentage: Math.round((habit.completedDays.length / daysInMonth) * 100),
      color: habit.color,
    }));
  }, [habits, daysInMonth]);

  // Line chart data
  const lineChartData = useMemo(() => {
    const data = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const completedCount = habits.filter(h => h.completedDays.includes(day)).length;
      data.push({
        day,
        completed: completedCount,
        percentage: habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0,
      });
    }
    return data;
  }, [habits, daysInMonth]);

  // Pie chart data
  const pieChartData = useMemo(() => {
    return habits.map(habit => ({
      name: habit.name,
      value: habit.completedDays.length,
      color: `hsl(${habit.color})`,
    }));
  }, [habits]);

  const monthName = selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Custom tooltip styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="card-neon p-3 text-sm">
          <p className="text-foreground font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color || 'hsl(var(--primary))' }}>
              {entry.name}: {entry.value}{typeof entry.value === 'number' && entry.name?.includes('percentage') ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = (chartId: ChartType) => {
    switch (chartId) {
      case 'trend':
        return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rangeData}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--neon-cyan))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--neon-cyan))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  fontWeight={500}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  unit="%"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="hsl(var(--neon-cyan))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--neon-cyan))', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8, fill: 'hsl(var(--neon-cyan))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                  style={{ filter: 'drop-shadow(0 0 8px hsl(var(--neon-cyan)))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'bar':
        return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  fontWeight={500}
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  fontWeight={500}
                  width={100}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="card-neon p-3 text-sm">
                          <p className="text-foreground font-semibold">{data.fullName}</p>
                          <p className="text-primary">{data.completed}/{data.total} days ({data.percentage}%)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="percentage" radius={[0, 6, 6, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`hsl(${entry.color})`}
                      style={{ filter: `drop-shadow(0 0 6px hsl(${entry.color} / 0.5))` }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'line':
        return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <defs>
                  <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--neon-green))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--neon-green))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  fontWeight={500}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[0, habits.length]}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="card-neon p-3 text-sm">
                          <p className="text-foreground font-semibold">Day {label}</p>
                          <p className="text-neon-green">{payload[0].value} habits completed</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="hsl(var(--neon-green))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--neon-green))', strokeWidth: 1, r: 3 }}
                  style={{ filter: 'drop-shadow(0 0 6px hsl(var(--neon-green)))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'pie':
        return (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name.slice(0, 10)}${name.length > 10 ? '..' : ''} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      style={{ filter: `drop-shadow(0 0 8px ${entry.color})` }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="card-neon p-3 text-sm">
                          <p className="text-foreground font-semibold">{data.name}</p>
                          <p style={{ color: data.color }}>{data.value} days completed</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return null;
    }
  };

  if (habits.length === 0) {
    return (
      <div className="card-neon p-8 text-center animate-fade-in">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-muted-foreground">No habit data to analyze. Add some habits first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Date Range Picker */}
      <div className="card-neon p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-base sm:text-lg font-semibold text-foreground neon-text-primary">Analytics Dashboard</h2>
        <DateRangePicker
          startDate={dateRange.start}
          endDate={dateRange.end}
          onRangeChange={(start, end) => setDateRange({ start, end })}
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {rangeData.slice(-4).map((month, i) => (
          <div key={i} className="card-neon p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold neon-text-primary">{month.percentage}%</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">{month.fullMonth}</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              {month.trend > 0 ? (
                <TrendingUp className="w-3 h-3 text-neon-green" />
              ) : month.trend < 0 ? (
                <TrendingDown className="w-3 h-3 text-destructive" />
              ) : (
                <Minus className="w-3 h-3 text-muted-foreground" />
              )}
              <span className={`text-[10px] sm:text-xs ${month.trend > 0 ? 'text-neon-green' : month.trend < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {month.trend > 0 ? '+' : ''}{month.trend}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Draggable Charts */}
      <div className="text-[10px] sm:text-xs text-muted-foreground text-center mb-2">
        ✨ Drag charts to reorder
      </div>
      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={chartOrder.map(c => c.id)} strategy={rectSortingStrategy}>
          <div className="space-y-3 sm:space-y-4">
            {chartOrder.map((chart) => (
              <SortableChart key={chart.id} id={chart.id} title={chart.title} icon={chart.icon}>
                {renderChart(chart.id)}
              </SortableChart>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Current Month Stats */}
      <h2 className="text-base sm:text-lg font-semibold text-foreground px-1 neon-text-primary">{monthName} Details</h2>
    </div>
  );
}
