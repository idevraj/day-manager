interface ProgressCardProps {
  completed: number;
  total: number;
  percentage: number;
}

export function ProgressCard({ completed, total, percentage }: ProgressCardProps) {
  return (
    <div className="card-neon p-3 sm:p-5 animate-fade-in">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-lg sm:text-xl font-bold neon-text-primary">{completed}/{total}</span>
        <span className="text-muted-foreground text-sm sm:text-base">({percentage}%)</span>
      </div>
      <div className="mt-2 sm:mt-3 h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ 
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, hsl(var(--neon-cyan)), hsl(var(--neon-green)))',
            boxShadow: '0 0 15px hsl(var(--neon-cyan) / 0.5), 0 0 30px hsl(var(--neon-cyan) / 0.3)'
          }}
        />
      </div>
    </div>
  );
}
