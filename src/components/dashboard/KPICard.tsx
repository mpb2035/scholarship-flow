import { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary';
  delay?: number;
  onClick?: () => void;
  overdueCount?: number;
  isMain?: boolean;
}

export function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = 'default',
  delay = 0,
  onClick,
  overdueCount,
  isMain = false,
}: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;
    
    const duration = 1000;
    const steps = 30;
    const stepValue = value / steps;
    let current = 0;
    
    const interval = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [value, isVisible]);

  const variantStyles = {
    default: 'border-border/50 hover:border-primary/50',
    primary: 'border-primary/50 hover:border-primary/80 bg-primary/5',
    success: 'border-success/30 hover:border-success/60',
    warning: 'border-warning/30 hover:border-warning/60',
    danger: 'border-destructive/30 hover:border-destructive/60',
  };

  const iconStyles = {
    default: 'text-primary',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-destructive',
  };

  return (
    <div
      className={cn(
        'glass-card p-4 transition-all duration-500 hover:scale-[1.02]',
        variantStyles[variant],
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        onClick && 'cursor-pointer',
        isMain && 'p-6'
      )}
      style={{ transitionDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={cn(
            "font-medium text-muted-foreground uppercase tracking-wide",
            isMain ? "text-sm" : "text-xs"
          )}>
            {title}
          </p>
          <p className={cn(
            "font-display font-bold gold-text",
            isMain ? "text-4xl" : "text-3xl"
          )}>
            {displayValue}
          </p>
          {overdueCount !== undefined && overdueCount > 0 && (
            <p className="text-xs font-medium text-destructive">
              {overdueCount} Overdue
            </p>
          )}
          {trend && (
            <p className={cn(
              'text-sm font-medium',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={cn(
          'p-2 rounded-xl bg-secondary/50',
          iconStyles[variant],
          isMain && 'p-3'
        )}>
          <Icon className={cn("h-5 w-5", isMain && "h-6 w-6")} />
        </div>
      </div>
    </div>
  );
}
