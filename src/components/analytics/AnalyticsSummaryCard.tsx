import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AnalyticsSummaryCardProps {
  caseType: string;
  statusBreakdown: Record<string, number>;
  latestMonth: string;
  count: number;
  onClick: () => void;
}

const getStatusVariant = (status: string) => {
  if (status.includes('Approved')) return 'default';
  if (status.includes('Overdue') || status === 'Not Approved') return 'destructive';
  if (status.includes('Query') || status.includes('Pending')) return 'secondary';
  return 'outline';
};

export function AnalyticsSummaryCard({ 
  caseType, 
  statusBreakdown, 
  latestMonth, 
  count, 
  onClick 
}: AnalyticsSummaryCardProps) {
  // Get top 3 statuses by count
  const topStatuses = Object.entries(statusBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card p-4 cursor-pointer transition-all duration-300',
        'hover:scale-[1.02] hover:border-primary/50',
        'flex flex-col gap-3'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-sm text-foreground line-clamp-2">
          {caseType}
        </h3>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {latestMonth}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-1">
        {topStatuses.map(([status, statusCount]) => (
          <Badge key={status} variant={getStatusVariant(status)} className="text-xs">
            {status.length > 15 ? status.substring(0, 15) + '...' : status} ({statusCount})
          </Badge>
        ))}
        {Object.keys(statusBreakdown).length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{Object.keys(statusBreakdown).length - 3} more
          </Badge>
        )}
      </div>
      
      <div className="mt-auto pt-2 border-t border-border/30">
        <span className="text-2xl font-display font-bold gold-text">
          {count}
        </span>
        <span className="text-sm text-muted-foreground ml-2">
          {count === 1 ? 'Case' : 'Cases'}
        </span>
      </div>
    </div>
  );
}
