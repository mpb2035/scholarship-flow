import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FixedCommitment } from '@/types/finance';
import { CommitmentTrackingItem } from '@/hooks/useCommitmentTracking';
import { 
  ClipboardCheck, Check, DollarSign,
  Car, Zap, Phone, Home, Baby, ShoppingCart, Heart, MoreHorizontal, Tag
} from 'lucide-react';

const COMMITMENT_CATEGORIES = [
  { value: 'car', icon: Car },
  { value: 'utilities', icon: Zap },
  { value: 'phone', icon: Phone },
  { value: 'home', icon: Home },
  { value: 'baby', icon: Baby },
  { value: 'grocery', icon: ShoppingCart },
  { value: 'wife', icon: Heart },
  { value: 'custom', icon: Tag },
  { value: 'other', icon: MoreHorizontal },
];

const getIcon = (category: string) => {
  return COMMITMENT_CATEGORIES.find(c => c.value === category)?.icon || MoreHorizontal;
};

const getLabel = (category: string, customLabel?: string | null) => {
  if (category === 'custom' && customLabel) return customLabel;
  const labels: Record<string, string> = {
    car: 'Car Payment', utilities: 'Utilities', phone: 'Phone Bill',
    home: 'Home/Lawn', baby: 'Diapers/Baby', grocery: 'Grocery',
    wife: 'Wife Pocket Money', other: 'Other',
  };
  return labels[category] || 'Other';
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface Props {
  month: number;
  year: number;
  fixedCommitments: FixedCommitment[];
  getTrackingForCommitment: (id: string) => CommitmentTrackingItem | null;
  togglePaid: (commitmentId: string, isPaid: boolean, actualAmount?: number) => Promise<void>;
  updateActualAmount: (commitmentId: string, amount: number) => Promise<void>;
  paidCount: number;
  totalCommitments: number;
  totalExpected: number;
  totalActual: number;
}

const MonthlyCommitmentScorecard = ({
  month, year, fixedCommitments,
  getTrackingForCommitment, togglePaid, updateActualAmount,
  paidCount, totalCommitments, totalExpected, totalActual,
}: Props) => {
  const [editingAmount, setEditingAmount] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState('');

  const progressPercent = totalCommitments > 0 ? (paidCount / totalCommitments) * 100 : 0;

  const handleAmountSave = async (commitmentId: string) => {
    if (tempAmount) {
      await updateActualAmount(commitmentId, parseFloat(tempAmount));
    }
    setEditingAmount(null);
    setTempAmount('');
  };

  const renderCommitmentRow = (commitment: FixedCommitment) => {
    const tracking = getTrackingForCommitment(commitment.id);
    const isPaid = tracking?.isPaid ?? false;
    const actualAmount = tracking?.actualAmount;
    const Icon = getIcon(commitment.category);
    const isEditing = editingAmount === commitment.id;

    return (
      <div
        key={commitment.id}
        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
          isPaid ? 'bg-green-500/5 border-green-500/20' : 'border-border'
        }`}
      >
        <Checkbox
          checked={isPaid}
          onCheckedChange={(checked) => togglePaid(commitment.id, !!checked)}
          className="shrink-0"
        />
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isPaid ? 'line-through text-muted-foreground' : ''}`}>
            {commitment.description}
          </p>
          <p className="text-xs text-muted-foreground">
            {getLabel(commitment.category, commitment.customLabel)}
            {commitment.payPeriod === 0 ? ' • Both' : ` • Period ${commitment.payPeriod}`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">${commitment.amount.toFixed(2)}</span>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={tempAmount}
                onChange={e => setTempAmount(e.target.value)}
                className="w-20 h-7 text-xs"
                placeholder="0.00"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleAmountSave(commitment.id)}
              />
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleAmountSave(commitment.id)}>
                <Check className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant={actualAmount ? 'outline' : 'ghost'}
              className="h-7 text-xs px-2"
              onClick={() => {
                setEditingAmount(commitment.id);
                setTempAmount(actualAmount?.toString() || commitment.amount.toString());
              }}
            >
              <DollarSign className="h-3 w-3 mr-0.5" />
              {actualAmount != null ? `$${actualAmount.toFixed(2)}` : 'Log'}
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (fixedCommitments.length === 0) return null;

  const period1Items = fixedCommitments.filter(c => c.payPeriod === 1 || c.payPeriod === 0);
  const period2Items = fixedCommitments.filter(c => c.payPeriod === 2 || c.payPeriod === 0);

  const getPeriodPaidCount = (items: FixedCommitment[]) =>
    items.filter(c => getTrackingForCommitment(c.id)?.isPaid).length;

  const renderPeriodSection = (title: string, items: FixedCommitment[]) => {
    const periodPaid = getPeriodPaidCount(items);
    const periodTotal = items.reduce((sum, c) => sum + c.amount, 0);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-muted-foreground">{title}</h4>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">${periodTotal.toFixed(2)}</Badge>
            <Badge variant={periodPaid === items.length ? 'default' : 'secondary'} className="text-[10px]">
              {periodPaid}/{items.length}
            </Badge>
          </div>
        </div>
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3 border rounded-lg border-dashed">No commitments</p>
        ) : (
          <div className="space-y-2">
            {items.map(renderCommitmentRow)}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            {MONTHS[month - 1]} {year} Scorecard
          </CardTitle>
          <Badge variant={paidCount === totalCommitments ? 'default' : 'secondary'} className="text-xs">
            {paidCount}/{totalCommitments} Paid
          </Badge>
        </div>
        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Completion</span>
            <span>{progressPercent.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground">Expected</p>
            <p className="text-sm font-bold">${totalExpected.toFixed(2)}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground">Actual Logged</p>
            <p className="text-sm font-bold">${totalActual.toFixed(2)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {renderPeriodSection('Pay Period 1', period1Items)}
          {renderPeriodSection('Pay Period 2', period2Items)}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyCommitmentScorecard;
