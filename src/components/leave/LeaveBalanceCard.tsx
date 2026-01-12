import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Palmtree, Thermometer, Calendar } from 'lucide-react';
import { LeaveBalance } from '@/types/leave';

interface LeaveBalanceCardProps {
  balance: LeaveBalance | null;
  getUsedDays: (type: 'annual' | 'sick' | 'other') => number;
  getRemainingDays: (type: 'annual' | 'sick' | 'other') => number;
}

export function LeaveBalanceCard({ balance, getUsedDays, getRemainingDays }: LeaveBalanceCardProps) {
  if (!balance) return null;

  const leaveTypes = [
    {
      type: 'annual' as const,
      label: 'Annual Leave',
      entitlement: balance.annual_entitlement,
      icon: Palmtree,
      color: 'bg-emerald-500',
    },
    {
      type: 'sick' as const,
      label: 'Sick Leave',
      entitlement: balance.sick_entitlement,
      icon: Thermometer,
      color: 'bg-amber-500',
    },
    {
      type: 'other' as const,
      label: 'Other Leave',
      entitlement: balance.other_entitlement,
      icon: Calendar,
      color: 'bg-blue-500',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {leaveTypes.map(({ type, label, entitlement, icon: Icon, color }) => {
        const used = getUsedDays(type);
        const remaining = getRemainingDays(type);
        const percentage = entitlement > 0 ? ((entitlement - remaining) / entitlement) * 100 : 0;

        return (
          <Card key={type} className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${color}`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{remaining}</div>
              <p className="text-xs text-muted-foreground mb-3">
                days remaining of {entitlement}
              </p>
              <Progress value={percentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {used} days used this year
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
