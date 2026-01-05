interface HeatmapProps {
  data: number[];
  maxValue: number;
  selectedMonth: Date;
}

export function Heatmap({ data, maxValue, selectedMonth }: HeatmapProps) {
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay();
  // Adjust to make Monday = 0 (ISO week)
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getHeatLevel = (value: number): { className: string; glow: string } => {
    if (value === 0) return { className: 'bg-heat-0', glow: '' };
    if (maxValue === 0) return { className: 'bg-heat-0', glow: '' };
    const ratio = value / maxValue;
    if (ratio <= 0.25) return { className: 'bg-heat-1', glow: '0 0 8px hsl(var(--heat-1))' };
    if (ratio <= 0.5) return { className: 'bg-heat-2', glow: '0 0 12px hsl(var(--heat-2))' };
    if (ratio <= 0.75) return { className: 'bg-heat-3', glow: '0 0 15px hsl(var(--heat-3))' };
    return { className: 'bg-heat-4', glow: '0 0 20px hsl(var(--heat-4))' };
  };

  return (
    <div className="card-neon p-5 animate-fade-in">
      <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2 neon-text-primary">
        <span>📅</span> Overall Completion Heatmap
      </h3>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1.5 mb-2 max-w-md">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs text-muted-foreground/70 font-medium uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid aligned to week */}
      <div className="grid grid-cols-7 gap-1.5 mb-4 max-w-md">
        {/* Empty cells for offset */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="w-9 h-9" />
        ))}

        {/* Day cells */}
        {data.map((value, index) => {
          const { className, glow } = getHeatLevel(value);
          return (
            <div
              key={index}
              className={`w-9 h-9 rounded-lg text-xs flex items-center justify-center font-medium 
                transition-all duration-300 hover:scale-115 cursor-default
                ${className}`}
              style={{ boxShadow: glow }}
              title={`Day ${index + 1}: ${value} of ${maxValue} habits completed`}
            >
              {index + 1}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1.5">
          <div className="w-6 h-6 rounded bg-heat-0 transition-all hover:scale-110" />
          <div className="w-6 h-6 rounded bg-heat-1 transition-all hover:scale-110" style={{ boxShadow: '0 0 8px hsl(var(--heat-1))' }} />
          <div className="w-6 h-6 rounded bg-heat-2 transition-all hover:scale-110" style={{ boxShadow: '0 0 10px hsl(var(--heat-2))' }} />
          <div className="w-6 h-6 rounded bg-heat-3 transition-all hover:scale-110" style={{ boxShadow: '0 0 12px hsl(var(--heat-3))' }} />
          <div className="w-6 h-6 rounded bg-heat-4 transition-all hover:scale-110" style={{ boxShadow: '0 0 15px hsl(var(--heat-4))' }} />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
