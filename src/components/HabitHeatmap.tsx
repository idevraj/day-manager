import { Habit } from '@/types/habit';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface HabitHeatmapProps {
  habit: Habit;
  daysInMonth: number;
  selectedMonth: Date;
}

export function HabitHeatmap({ habit, daysInMonth, selectedMonth }: HabitHeatmapProps) {
  const [expanded, setExpanded] = useState(false);

  // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay();
  // Adjust to make Monday = 0
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getHeatStyle = (day: number): React.CSSProperties => {
    const isCompleted = habit.completedDays.includes(day);
    if (isCompleted) {
      return {
        backgroundColor: `hsl(${habit.color})`,
        boxShadow: `0 0 15px hsl(${habit.color} / 0.6), 0 0 30px hsl(${habit.color} / 0.3)`,
      };
    }
    return {};
  };

  // Calculate completion stats for this habit
  const completedCount = habit.completedDays.length;
  const completionRate = daysInMonth > 0 ? Math.round((completedCount / daysInMonth) * 100) : 0;

  return (
    <div className="card-neon overflow-hidden animate-fade-in">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-all"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ 
              backgroundColor: `hsl(${habit.color})`,
              boxShadow: `0 0 12px hsl(${habit.color} / 0.6)`
            }}
          />
          <span className="text-foreground font-medium">{habit.name}</span>
          <span 
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ 
              backgroundColor: `hsl(${habit.color} / 0.2)`,
              color: `hsl(${habit.color})`,
              boxShadow: `0 0 10px hsl(${habit.color} / 0.2)`
            }}
          >
            {completionRate}% complete
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-primary" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="p-4 pt-0 border-t border-border/30">
          <div className="mt-4">
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs text-muted-foreground font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty cells for offset */}
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="w-full aspect-square" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isCompleted = habit.completedDays.includes(day);
                return (
                  <div
                    key={day}
                    className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-medium
                      transition-all duration-300 hover:scale-115
                      ${isCompleted ? 'text-white' : 'bg-muted/30 text-muted-foreground'}`}
                    style={getHeatStyle(day)}
                    title={`Day ${day}: ${isCompleted ? 'Completed' : 'Not completed'}`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
              <span>{completedCount} of {daysInMonth} days completed</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-muted/30" />
                  <span>Missed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ 
                      backgroundColor: `hsl(${habit.color})`,
                      boxShadow: `0 0 8px hsl(${habit.color} / 0.5)`
                    }}
                  />
                  <span>Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
