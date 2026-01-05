import { useState, useMemo } from 'react';
import { Goal, GoalAnalyticsPeriod, GOAL_VALUE_OPTIONS } from '@/types/goal';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
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
import { Lightbulb, TrendingUp, Target, Calendar, GripVertical } from 'lucide-react';

interface GoalsAnalyticsProps {
  goals: Goal[];
  suggestions: string[];
}

type ChartType = 'status' | 'value' | 'days' | 'progress';

interface ChartConfig {
  id: ChartType;
  title: string;
  icon: React.ReactNode;
}

const PERIOD_OPTIONS: { value: GoalAnalyticsPeriod; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half-yearly', label: 'Half-Yearly' },
  { value: 'yearly', label: 'Yearly' },
];

const COLORS = {
  done: '#00d4aa',
  'on-going': '#00d4ff',
  'not-yet': '#6b7280',
  VVIMP: '#f87171',
  VIMP: '#fb923c',
  IMP: '#facc15',
  NIMP: '#6b7280',
};

function SortableChart({ 
  id, 
  title, 
  icon, 
  children 
}: { 
  id: string; 
  title: string; 
  icon: React.ReactNode;
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
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="chart-container"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold text-primary">{title}</h3>
        </div>
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="w-5 h-5" />
        </button>
      </div>
      {children}
    </div>
  );
}

export function GoalsAnalytics({ goals, suggestions }: GoalsAnalyticsProps) {
  const [period, setPeriod] = useState<GoalAnalyticsPeriod>('monthly');
  const [chartOrder, setChartOrder] = useState<ChartType[]>(['status', 'value', 'days', 'progress']);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setChartOrder(items => {
        const oldIndex = items.indexOf(active.id as ChartType);
        const newIndex = items.indexOf(over.id as ChartType);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const filterGoalsByPeriod = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarterly':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'half-yearly':
        startDate = new Date(now.getFullYear(), now.getMonth() >= 6 ? 6 : 0, 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    return goals.filter(g => new Date(g.createdAt) >= startDate);
  }, [goals, period]);

  const statusData = useMemo(() => [
    { name: 'Done', value: filterGoalsByPeriod.filter(g => g.status === 'done').length, fill: COLORS.done },
    { name: 'On-Going', value: filterGoalsByPeriod.filter(g => g.status === 'on-going').length, fill: COLORS['on-going'] },
    { name: 'Not Yet', value: filterGoalsByPeriod.filter(g => g.status === 'not-yet').length, fill: COLORS['not-yet'] },
  ], [filterGoalsByPeriod]);

  const valueData = useMemo(() => [
    { name: 'VVIMP', value: filterGoalsByPeriod.filter(g => g.value === 'VVIMP').length, fill: COLORS.VVIMP },
    { name: 'VIMP', value: filterGoalsByPeriod.filter(g => g.value === 'VIMP').length, fill: COLORS.VIMP },
    { name: 'IMP', value: filterGoalsByPeriod.filter(g => g.value === 'IMP').length, fill: COLORS.IMP },
    { name: 'NIMP', value: filterGoalsByPeriod.filter(g => g.value === 'NIMP').length, fill: COLORS.NIMP },
  ], [filterGoalsByPeriod]);

  const daysData = useMemo(() => {
    const ranges = [
      { range: '1-7', min: 1, max: 7 },
      { range: '15-30', min: 15, max: 30 },
      { range: '45-90', min: 45, max: 90 },
      { range: '150-180', min: 150, max: 180 },
      { range: '270-365', min: 270, max: 365 },
    ];
    return ranges.map(r => ({
      name: r.range,
      count: filterGoalsByPeriod.filter(g => g.days >= r.min && g.days <= r.max).length,
    }));
  }, [filterGoalsByPeriod]);

  const progressData = useMemo(() => {
    const total = filterGoalsByPeriod.length;
    if (total === 0) return [];
    
    return [
      { name: 'Completion Rate', done: Math.round((statusData[0].value / total) * 100), ongoing: Math.round((statusData[1].value / total) * 100), pending: Math.round((statusData[2].value / total) * 100) },
    ];
  }, [filterGoalsByPeriod, statusData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="card-neon p-3 text-sm">
          <p className="text-foreground font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color || entry.fill }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const charts: Record<ChartType, ChartConfig> = {
    status: { id: 'status', title: 'Goals by Status', icon: <Target className="w-4 h-4 text-primary" /> },
    value: { id: 'value', title: 'Goals by Priority', icon: <TrendingUp className="w-4 h-4 text-primary" /> },
    days: { id: 'days', title: 'Goals by Duration', icon: <Calendar className="w-4 h-4 text-primary" /> },
    progress: { id: 'progress', title: 'Completion Progress', icon: <TrendingUp className="w-4 h-4 text-primary" /> },
  };

  const renderChart = (type: ChartType) => {
    switch (type) {
      case 'status':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                labelLine={false}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'value':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={valueData}>
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {valueData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'days':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={daysData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'progress':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={progressData} layout="vertical">
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
              <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="done" stackId="a" fill={COLORS.done} name="Done %" />
              <Bar dataKey="ongoing" stackId="a" fill={COLORS['on-going']} name="Ongoing %" />
              <Bar dataKey="pending" stackId="a" fill={COLORS['not-yet']} name="Pending %" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Period Selector */}
      <div className="card-neon p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
          <span className="text-xs sm:text-sm text-muted-foreground w-full sm:w-auto mb-1 sm:mb-0">Period:</span>
          {PERIOD_OPTIONS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[10px] sm:text-sm font-medium transition-all duration-300 ${
                period === p.value 
                  ? 'bg-primary text-primary-foreground glow-primary' 
                  : 'bg-secondary/50 text-foreground hover:bg-secondary'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="card-neon p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <h3 className="text-sm font-semibold text-primary">Smart Suggestions</h3>
          </div>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="p-3 rounded-lg bg-secondary/30 border border-border/30 text-sm text-foreground"
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={chartOrder} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {chartOrder.map(chartType => (
              <SortableChart
                key={chartType}
                id={chartType}
                title={charts[chartType].title}
                icon={charts[chartType].icon}
              >
                {renderChart(chartType)}
              </SortableChart>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <div className="card-neon p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold neon-text-primary">{filterGoalsByPeriod.length}</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">Total Goals</div>
        </div>
        <div className="card-neon p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-neon-green">{statusData[0].value}</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">Completed</div>
        </div>
        <div className="card-neon p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-neon-cyan">{statusData[1].value}</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">In Progress</div>
        </div>
        <div className="card-neon p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-muted-foreground">{statusData[2].value}</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">Pending</div>
        </div>
      </div>
    </div>
  );
}
