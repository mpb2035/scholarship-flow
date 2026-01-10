import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { Trash2, Edit2, MapPin, Clock, List } from 'lucide-react';
import { RunningLog } from '@/hooks/useRunningLogs';
import { cn } from '@/lib/utils';

interface RunLogTableProps {
  logs: RunningLog[];
  onDelete: (id: string) => Promise<boolean>;
}

const runTypeLabels: Record<string, { label: string; color: string }> = {
  easy_run: { label: 'Easy Run', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  tempo: { label: 'Tempo', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  fartlek: { label: 'Fartlek', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  interval: { label: 'Interval', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
  long_run: { label: 'Long Run', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  race: { label: 'Race', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
};

const formatPace = (paceMinutes: number | null) => {
  if (!paceMinutes || paceMinutes <= 0) return '--:--';
  const mins = Math.floor(paceMinutes);
  const secs = Math.round((paceMinutes - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDuration = (minutes: number) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
};

export function RunLogTable({ logs, onDelete }: RunLogTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  if (logs.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <List className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No running logs yet. Start logging your runs!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <List className="h-5 w-5 text-primary" />
          Running History ({logs.length} runs)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Distance</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="text-right">Pace</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="group">
                  <TableCell className="font-medium">
                    {format(parseISO(log.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        runTypeLabels[log.run_type]?.color || 'bg-muted',
                      )}
                    >
                      {runTypeLabels[log.run_type]?.label || log.run_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {log.distance.toFixed(1)} km
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDuration(log.duration_minutes)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "font-mono",
                      log.pace_per_km && log.pace_per_km <= 5.68 ? "text-green-600" : "text-muted-foreground"
                    )}>
                      {formatPace(log.pace_per_km)}/km
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      <MapPin className="h-3 w-3 mr-1" />
                      {log.environment}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {log.notes || '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(log.id)}
                      disabled={deletingId === log.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
