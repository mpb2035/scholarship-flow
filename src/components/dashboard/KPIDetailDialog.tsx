import { Matter } from '@/types/matter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface KPIDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  matters: Matter[];
  onMatterClick?: (matter: Matter) => void;
}

export function KPIDetailDialog({
  open,
  onOpenChange,
  title,
  matters,
  onMatterClick,
}: KPIDetailDialogProps) {
  const getSLABadgeVariant = (status: string) => {
    switch (status) {
      case 'Overdue':
        return 'destructive';
      case 'Critical':
        return 'destructive';
      case 'At Risk':
        return 'warning';
      case 'Within SLA':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-destructive text-destructive-foreground';
      case 'High':
        return 'bg-warning text-warning-foreground';
      case 'Medium':
        return 'bg-primary text-primary-foreground';
      case 'Low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-display gold-text">
            {title}
            <Badge variant="outline" className="ml-3 text-muted-foreground">
              {matters.length} {matters.length === 1 ? 'matter' : 'matters'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {matters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No matters found in this category.
            </div>
          ) : (
            <div className="space-y-3 pr-4">
              {matters.map((matter) => (
                <div
                  key={matter.id}
                  className={cn(
                    'p-4 rounded-lg border border-border/50 bg-secondary/20',
                    'hover:border-primary/50 hover:bg-secondary/40 transition-colors',
                    onMatterClick && 'cursor-pointer'
                  )}
                  onClick={() => onMatterClick?.(matter)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-primary truncate">
                          {matter.caseId}
                        </span>
                        <Badge className={cn('text-xs', getPriorityColor(matter.priority))}>
                          {matter.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground truncate mb-2">
                        {matter.caseTitle}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{matter.caseType}</span>
                        <span>•</span>
                        <span>{matter.daysInProcess} days</span>
                        <span>•</span>
                        <span className="truncate">{matter.overallStatus}</span>
                      </div>
                    </div>
                    <Badge variant={getSLABadgeVariant(matter.slaStatus) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                      {matter.slaStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}