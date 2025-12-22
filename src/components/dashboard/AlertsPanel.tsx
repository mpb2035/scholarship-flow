import { AlertTriangle, Clock, AlertOctagon } from 'lucide-react';
import { Matter } from '@/types/matter';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AlertsPanelProps {
  matters: Matter[];
  onMatterClick: (matter: Matter) => void;
}

export function AlertsPanel({ matters, onMatterClick }: AlertsPanelProps) {
  const alerts = matters
    .filter(m => ['Overdue', 'Critical', 'At Risk'].includes(m.slaStatus))
    .sort((a, b) => {
      const order = { 'Overdue': 0, 'Critical': 1, 'At Risk': 2 };
      return order[a.slaStatus as keyof typeof order] - order[b.slaStatus as keyof typeof order];
    });

  if (alerts.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="font-display text-lg font-semibold gold-text mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          SLA Alerts
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No SLA alerts at this time</p>
        </div>
      </div>
    );
  }

  const getAlertIcon = (status: string) => {
    switch (status) {
      case 'Overdue':
        return <AlertOctagon className="h-4 w-4 text-destructive" />;
      case 'Critical':
        return <AlertTriangle className="h-4 w-4 text-orange-400" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getAlertStyle = (status: string) => {
    switch (status) {
      case 'Overdue':
        return 'border-l-destructive bg-destructive/5';
      case 'Critical':
        return 'border-l-orange-500 bg-orange-500/5';
      default:
        return 'border-l-warning bg-warning/5';
    }
  };

  return (
    <div className="glass-card p-6">
      <h3 className="font-display text-lg font-semibold gold-text mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        SLA Alerts
        <Badge variant="outline" className="ml-auto bg-destructive/20 text-destructive border-destructive/30">
          {alerts.length}
        </Badge>
      </h3>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-gold">
        {alerts.map((matter, index) => (
          <button
            key={matter.id}
            onClick={() => onMatterClick(matter)}
            className={cn(
              'w-full text-left p-4 rounded-lg border-l-4 transition-all',
              'hover:bg-secondary/30 cursor-pointer animate-fade-in',
              getAlertStyle(matter.slaStatus)
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              {getAlertIcon(matter.slaStatus)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-primary">
                    {matter.caseId}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-xs',
                      matter.slaStatus === 'Overdue' 
                        ? 'bg-destructive/20 text-destructive border-destructive/30'
                        : matter.slaStatus === 'Critical'
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        : 'bg-warning/20 text-warning border-warning/30'
                    )}
                  >
                    {matter.slaStatus}
                  </Badge>
                </div>
                <p className="text-sm truncate text-foreground/80">
                  {matter.caseTitle}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {matter.daysInProcess} days • {matter.overallStatus}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
