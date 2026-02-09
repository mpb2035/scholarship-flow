import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Palmtree, Thermometer, Calendar, Pencil, Check, X } from 'lucide-react';
import { LeaveBalance } from '@/types/leave';

interface LeaveBalanceCardProps {
  balance: LeaveBalance | null;
  getUsedDays: (type: 'annual' | 'sick' | 'other') => number;
  getRemainingDays: (type: 'annual' | 'sick' | 'other') => number;
  onUpdateBalance?: (updates: { annual_entitlement?: number; sick_entitlement?: number; other_entitlement?: number }) => Promise<void>;
}

export function LeaveBalanceCard({ balance, getUsedDays, getRemainingDays, onUpdateBalance }: LeaveBalanceCardProps) {
  const [editingType, setEditingType] = useState<'annual' | 'sick' | 'other' | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  if (!balance) return null;

  const leaveTypes = [
    {
      type: 'annual' as const,
      label: 'Annual Leave',
      entitlement: balance.annual_entitlement,
      entitlementKey: 'annual_entitlement' as const,
      icon: Palmtree,
      color: 'bg-emerald-500',
    },
    {
      type: 'sick' as const,
      label: 'Sick Leave',
      entitlement: balance.sick_entitlement,
      entitlementKey: 'sick_entitlement' as const,
      icon: Thermometer,
      color: 'bg-amber-500',
    },
    {
      type: 'other' as const,
      label: 'Other Leave',
      entitlement: balance.other_entitlement,
      entitlementKey: 'other_entitlement' as const,
      icon: Calendar,
      color: 'bg-blue-500',
    },
  ];

  const handleEditStart = (type: 'annual' | 'sick' | 'other', currentValue: number) => {
    setEditingType(type);
    setEditValue(currentValue.toString());
  };

  const handleEditCancel = () => {
    setEditingType(null);
    setEditValue('');
  };

  const handleEditSave = async (entitlementKey: 'annual_entitlement' | 'sick_entitlement' | 'other_entitlement') => {
    const numValue = parseFloat(editValue);
    if (isNaN(numValue) || numValue < 0 || numValue > 365) {
      return;
    }

    if (onUpdateBalance) {
      await onUpdateBalance({ [entitlementKey]: numValue });
    }
    setEditingType(null);
    setEditValue('');
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {leaveTypes.map(({ type, label, entitlement, entitlementKey, icon: Icon, color }) => {
        const used = getUsedDays(type);
        const remaining = getRemainingDays(type);
        const percentage = entitlement > 0 ? ((entitlement - remaining) / entitlement) * 100 : 0;
        const isEditing = editingType === type;

        return (
          <Card key={type} className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${color}`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{remaining}</div>
              <div className="flex items-center gap-2 mb-3">
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">days remaining of</span>
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="h-6 w-16 text-xs px-1"
                      min={0}
                      max={365}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditSave(entitlementKey);
                        if (e.key === 'Escape') handleEditCancel();
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleEditSave(entitlementKey)}
                    >
                      <Check className="h-3 w-3 text-success" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={handleEditCancel}
                    >
                      <X className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-muted-foreground">
                      days remaining of {entitlement}
                    </p>
                    {onUpdateBalance && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 opacity-60 hover:opacity-100"
                        onClick={() => handleEditStart(type, entitlement)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
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