import { cn } from '@/lib/utils';

interface AnimatedProgressProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
}

export function AnimatedProgress({ value, max, className, showLabel = true }: AnimatedProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  // Determine text color based on percentage
  const getTextColor = (percent: number) => {
    if (percent < 50) return "text-red-500";
    if (percent >= 50 && percent < 80) return "text-orange-500";
    return "text-green-500";
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Progress
          </span>
          <span className={cn("text-sm font-medium", getTextColor(percentage))}>
            {value} / {max} ({Math.round(percentage)}%)
          </span>
        </div>
      )}
      
      <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden">
        {/* Progress bar with animated diagonal stripes */}
        <div
          className="h-full bg-primary relative transition-all duration-300 ease-out progress-bar-stripes"
          style={{ width: `${percentage}%` }}
        >
          {/* Animated diagonal stripes overlay */}
          <div 
            className="absolute inset-0 opacity-30 animate-stripes"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 8px,
                rgba(255, 255, 255, 0.8) 8px,
                rgba(255, 255, 255, 0.8) 16px
              )`,
              backgroundSize: '22.63px 22.63px'
            }}
          />
        </div>
        
        {/* Shimmer effect for active progress */}
        {percentage < 100 && percentage > 0 && (
          <div
            className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
            style={{
              left: `${Math.max(0, percentage - 4)}%`
            }}
          />
        )}
      </div>
    </div>
  );
}