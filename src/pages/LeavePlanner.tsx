import { useLeaves } from '@/hooks/useLeaves';
import { useAuth } from '@/hooks/useAuth';
import { LeaveBalanceCard } from '@/components/leave/LeaveBalanceCard';
import { LeaveCountdownCard } from '@/components/leave/LeaveCountdownCard';
import { LeaveLogForm } from '@/components/leave/LeaveLogForm';
import { LeaveHistoryTable } from '@/components/leave/LeaveHistoryTable';
import { LeaveOverviewChart } from '@/components/leave/LeaveOverviewChart';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LogIn, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LeavePlanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    leaves,
    balance,
    loading,
    addLeave,
    deleteLeave,
    updateBalance,
    getUsedDays,
    getRemainingDays,
    getNextLeave,
    getDaysUntilNextLeave,
  } = useLeaves();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <CalendarDays className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Sign in to access Leave Planner</h2>
        <p className="text-muted-foreground">Track your leave balance and plan your time off</p>
        <Button onClick={() => navigate('/auth')}>
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[140px]" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }

  const nextLeave = getNextLeave();
  const daysUntilNextLeave = getDaysUntilNextLeave();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Planner</h1>
          <p className="text-muted-foreground">Track and manage your time off</p>
        </div>
      </div>

      {/* Leave Balance Scorecards */}
      <LeaveBalanceCard
        balance={balance}
        getUsedDays={getUsedDays}
        getRemainingDays={getRemainingDays}
        onUpdateBalance={updateBalance}
      />

      {/* Countdown & Gap Cards */}
      <LeaveCountdownCard
        nextLeave={nextLeave}
        daysUntilNextLeave={daysUntilNextLeave}
        leaves={leaves}
      />

      {/* Log New Leave */}
      <LeaveLogForm onSubmit={addLeave} />

      {/* Overview Chart */}
      <LeaveOverviewChart leaves={leaves} />

      {/* Leave History */}
      <LeaveHistoryTable leaves={leaves} onDelete={deleteLeave} />
    </div>
  );
}
