import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Matter } from '@/types/matter';
import { differenceInDays, parseISO, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarClock, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

interface DeadlineDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: 'overdue' | 'thisWeek' | 'upcoming' | 'noDeadline' | null;
  matters: Matter[];
  onMatterClick: (matter: Matter) => void;
}

const categoryConfig = {
  overdue: {
    title: 'Overdue Deadlines',
    icon: AlertTriangle,
    color: 'text-destructive',
    description: 'Matters that have passed their deadline',
  },
  thisWeek: {
    title: 'Deadlines This Week',
    icon: Clock,
    color: 'text-warning',
    description: 'Matters due within the next 7 days',
  },
  upcoming: {
    title: 'Upcoming Deadlines',
    icon: CalendarClock,
    color: 'text-primary',
    description: 'Matters due after this week',
  },
  noDeadline: {
    title: 'No Deadline Set',
    icon: CheckCircle2,
    color: 'text-muted-foreground',
    description: 'Active matters without a deadline',
  },
};

export function DeadlineDetailDialog({
  open,
  onOpenChange,
  category,
  matters,
  onMatterClick,
}: DeadlineDetailDialogProps) {
  if (!category) return null;

  const config = categoryConfig[category];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDeadlineInfo = (matter: Matter) => {
    if (!matter.deadline) return null;
    const deadline = parseISO(matter.deadline);
    const daysUntil = differenceInDays(deadline, today);
    return {
      date: format(deadline, 'MMM d, yyyy'),
      daysUntil,
      isOverdue: daysUntil < 0,
    };
  };

  const sortedMatters = [...matters].sort((a, b) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <config.icon className={cn('h-5 w-5', config.color)} />
            <span className="gold-text">{config.title}</span>
            <Badge variant="secondary" className="ml-2">
              {matters.length}
            </Badge>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {sortedMatters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No matters in this category
            </div>
          ) : (
            <div className="space-y-2">
              {sortedMatters.map((matter) => {
                const deadlineInfo = getDeadlineInfo(matter);
                return (
                  <div
                    key={matter.id}
                    className="p-3 rounded-lg border border-border/50 hover:border-primary/50 cursor-pointer transition-all bg-secondary/20 hover:bg-secondary/40"
                    onClick={() => onMatterClick(matter)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-primary">
                            {matter.caseId}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {matter.priority}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium truncate">
                          {matter.caseTitle}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {matter.caseType} • {matter.overallStatus}
                        </p>
                      </div>
                      {deadlineInfo ? (
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium">{deadlineInfo.date}</p>
                          <p
                            className={cn(
                              'text-xs font-medium',
                              deadlineInfo.isOverdue
                                ? 'text-destructive'
                                : deadlineInfo.daysUntil <= 7
                                ? 'text-warning'
                                : 'text-muted-foreground'
                            )}
                          >
                            {deadlineInfo.isOverdue
                              ? `${Math.abs(deadlineInfo.daysUntil)} days overdue`
                              : deadlineInfo.daysUntil === 0
                              ? 'Due today'
                              : deadlineInfo.daysUntil === 1
                              ? 'Due tomorrow'
                              : `${deadlineInfo.daysUntil} days left`}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No deadline</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
