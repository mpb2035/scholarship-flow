import { useMemo } from 'react';
import { Clock, AlertTriangle, CalendarClock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Matter } from '@/types/matter';
import { differenceInDays, parseISO, format } from 'date-fns';

interface DeadlineCounterCardProps {
  matters: Matter[];
  onClick: (category: 'overdue' | 'thisWeek' | 'upcoming' | 'noDeadline') => void;
}

export function DeadlineCounterCard({ matters, onClick }: DeadlineCounterCardProps) {
  const deadlineStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const mattersWithDeadline = matters.filter(m => 
      m.deadline && !['Approved & Signed', 'Not Approved'].includes(m.overallStatus)
    );
    
    const overdue = mattersWithDeadline.filter(m => {
      const deadline = parseISO(m.deadline!);
      return deadline < today;
    });

    const thisWeek = mattersWithDeadline.filter(m => {
      const deadline = parseISO(m.deadline!);
      return deadline >= today && deadline <= weekFromNow;
    });

    const upcoming = mattersWithDeadline.filter(m => {
      const deadline = parseISO(m.deadline!);
      return deadline > weekFromNow;
    });

    const activeMatters = matters.filter(m => 
      !['Approved & Signed', 'Not Approved'].includes(m.overallStatus)
    );
    const noDeadline = activeMatters.filter(m => !m.deadline);

    return {
      overdue,
      thisWeek,
      upcoming,
      noDeadline,
      total: mattersWithDeadline.length,
    };
  }, [matters]);

  const categories = [
    {
      key: 'overdue' as const,
      label: 'Overdue',
      count: deadlineStats.overdue.length,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/30 hover:border-destructive/60',
    },
    {
      key: 'thisWeek' as const,
      label: 'This Week',
      count: deadlineStats.thisWeek.length,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30 hover:border-warning/60',
    },
    {
      key: 'upcoming' as const,
      label: 'Upcoming',
      count: deadlineStats.upcoming.length,
      icon: CalendarClock,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30 hover:border-primary/60',
    },
    {
      key: 'noDeadline' as const,
      label: 'No Deadline',
      count: deadlineStats.noDeadline.length,
      icon: CheckCircle2,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/30',
      borderColor: 'border-border/50 hover:border-border',
    },
  ];

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <CalendarClock className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Deadline Tracker</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {deadlineStats.total} with deadlines
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.key}
            className={cn(
              'p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02]',
              cat.borderColor,
              cat.bgColor
            )}
            onClick={() => onClick(cat.key)}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {cat.label}
                </p>
                <p className={cn('text-2xl font-bold', cat.color)}>
                  {cat.count}
                </p>
              </div>
              <div className={cn('p-2 rounded-lg', cat.bgColor)}>
                <cat.icon className={cn('h-4 w-4', cat.color)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
