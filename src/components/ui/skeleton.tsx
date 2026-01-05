import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "text-sm" | "title" | "avatar" | "card" | "button" | "custom";
}

function Skeleton({ className, variant = "custom", ...props }: SkeletonProps) {
  const variantClasses = {
    text: "skeleton-text",
    "text-sm": "skeleton-text-sm",
    title: "skeleton-title",
    avatar: "skeleton-avatar",
    card: "skeleton-card",
    button: "skeleton-button",
    custom: "skeleton",
  };

  return (
    <div
      className={cn(variantClasses[variant], className)}
      {...props}
    />
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("card-neon p-4 space-y-3", className)}>
      <div className="flex items-center gap-3">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" />
          <Skeleton variant="text-sm" />
        </div>
      </div>
      <Skeleton variant="text" />
      <Skeleton variant="text" className="w-4/5" />
    </div>
  );
}

function SkeletonTable({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "card-neon p-3 flex items-center gap-4 animate-fade-in animate-fill-both",
            i === 0 && "stagger-1",
            i === 1 && "stagger-2",
            i === 2 && "stagger-3",
            i === 3 && "stagger-4",
            i === 4 && "stagger-5"
          )}
        >
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton variant="text" className="flex-1" />
          <div className="flex gap-2">
            {Array.from({ length: 7 }).map((_, j) => (
              <Skeleton key={j} className="h-8 w-8 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonTable };
