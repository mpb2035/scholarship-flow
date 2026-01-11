import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodoTimerProps {
  elapsedSeconds: number;
  isRunning: boolean;
  onToggle: () => void;
  onTick: (seconds: number) => void;
  size?: 'sm' | 'lg';
  className?: string;
}

export function TodoTimer({ 
  elapsedSeconds, 
  isRunning, 
  onToggle, 
  onTick,
  size = 'sm',
  className 
}: TodoTimerProps) {
  const [localSeconds, setLocalSeconds] = useState(elapsedSeconds);

  useEffect(() => {
    setLocalSeconds(elapsedSeconds);
  }, [elapsedSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setLocalSeconds(prev => {
        const newSeconds = prev + 1;
        onTick(newSeconds);
        return newSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTick]);

  const formatTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const isLarge = size === 'lg';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn(
        'font-mono tabular-nums',
        isLarge ? 'text-2xl font-bold text-primary' : 'text-sm text-muted-foreground'
      )}>
        {formatTime(localSeconds)}
      </span>
      <Button
        variant={isRunning ? 'secondary' : 'outline'}
        size={isLarge ? 'sm' : 'icon'}
        className={cn(isLarge ? 'h-8 w-8' : 'h-6 w-6')}
        onClick={onToggle}
      >
        {isRunning ? (
          <Pause className={cn(isLarge ? 'h-4 w-4' : 'h-3 w-3')} />
        ) : (
          <Play className={cn(isLarge ? 'h-4 w-4' : 'h-3 w-3')} />
        )}
      </Button>
    </div>
  );
}
