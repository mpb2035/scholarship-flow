import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CalendarCheck, ArrowRight } from 'lucide-react';
import { Leave } from '@/types/leave';
import { format, differenceInDays } from 'date-fns';

interface LeaveCountdownCardProps {
  nextLeave: Leave | undefined;
  daysUntilNextLeave: number | null;
  leaves: Leave[];
}

export function LeaveCountdownCard({ nextLeave, daysUntilNextLeave, leaves }: LeaveCountdownCardProps) {
  // Calculate gap between leaves
  const getGapBetweenLeaves = () => {
    const approvedLeaves = leaves
      .filter(l => l.status === 'approved')
      .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());

    if (approvedLeaves.length < 2) return null;

    const today = new Date();
    
    // Find the most recent past leave
    const pastLeaves = approvedLeaves.filter(l => new Date(l.end_date) < today);
    const futureLeaves = approvedLeaves.filter(l => new Date(l.start_date) > today);

    if (pastLeaves.length === 0 || futureLeaves.length === 0) return null;

    const lastLeave = pastLeaves[pastLeaves.length - 1];
    const nextUpcoming = futureLeaves[0];

    return {
      from: lastLeave,
      to: nextUpcoming,
      days: differenceInDays(new Date(nextUpcoming.start_date), new Date(lastLeave.end_date)),
    };
  };

  const leaveGap = getGapBetweenLeaves();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Next Leave Countdown</CardTitle>
          <Clock className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          {nextLeave && daysUntilNextLeave !== null ? (
            <>
              <div className="text-5xl font-bold text-primary mb-2">
                {daysUntilNextLeave}
              </div>
              <p className="text-sm text-muted-foreground">
                days until your {nextLeave.leave_type} leave
              </p>
              <div className="mt-4 p-3 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  {format(new Date(nextLeave.start_date), 'MMM dd')} - {format(new Date(nextLeave.end_date), 'MMM dd, yyyy')}
                </p>
                <p className="text-sm font-medium mt-1">
                  {nextLeave.days_used} day{nextLeave.days_used !== 1 ? 's' : ''} off
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No upcoming leaves scheduled</p>
              <p className="text-sm text-muted-foreground mt-1">Plan your next break!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Gap Between Leaves</CardTitle>
          <CalendarCheck className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {leaveGap ? (
            <>
              <div className="text-4xl font-bold mb-2">{leaveGap.days}</div>
              <p className="text-sm text-muted-foreground">working days between leaves</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="p-2 bg-muted rounded">
                  {format(new Date(leaveGap.from.end_date), 'MMM dd')}
                </span>
                <ArrowRight className="h-4 w-4" />
                <span className="p-2 bg-muted rounded">
                  {format(new Date(leaveGap.to.start_date), 'MMM dd')}
                </span>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Not enough data</p>
              <p className="text-sm text-muted-foreground mt-1">Log more leaves to see gap</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
