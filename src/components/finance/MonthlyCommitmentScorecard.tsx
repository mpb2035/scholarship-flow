import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FixedCommitment } from '@/types/finance';
import { CommitmentTrackingItem } from '@/hooks/useCommitmentTracking';
import { 
  ClipboardCheck, Check, DollarSign, ChevronDown,
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
  getTrackingForCommitment: (id: string, forPayPeriod?: number) => CommitmentTrackingItem | null;
  togglePaid: (commitmentId: string, isPaid: boolean, actualAmount?: number, forPayPeriod?: number) => Promise<void>;
  updateActualAmount: (commitmentId: string, amount: number, forPayPeriod?: number) => Promise<void>;
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
  const [isOpen, setIsOpen] = useState(true);
  const [editingAmount, setEditingAmount] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState('');

  const progressPercent = totalCommitments > 0 ? (paidCount / totalCommitments) * 100 : 0;

  const handleAmountSave = async (commitmentId: string, forPayPeriod: number) => {
    if (tempAmount) {
      await updateActualAmount(commitmentId, parseFloat(tempAmount), forPayPeriod);
    }
    setEditingAmount(null);
    setTempAmount('');
  };

  const renderCommitmentRow = (commitment: FixedCommitment, displayPayPeriod: number) => {
    const tracking = getTrackingForCommitment(commitment.id, displayPayPeriod);
    const isPaid = tracking?.isPaid ?? false;
    const actualAmount = tracking?.actualAmount;
    const Icon = getIcon(commitment.category);
    const rowKey = `${commitment.id}-p${displayPayPeriod}`;
    const isEditing = editingAmount === rowKey;

    return (
      <div
        key={rowKey}
        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
          isPaid ? 'bg-green-500/5 border-green-500/20' : 'border-border'
        }`}
      >
        <Checkbox
          checked={isPaid}
          onCheckedChange={(checked) => togglePaid(commitment.id, !!checked, undefined, displayPayPeriod)}
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
                onKeyDown={e => e.key === 'Enter' && handleAmountSave(commitment.id, displayPayPeriod)}
              />
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleAmountSave(commitment.id, displayPayPeriod)}>
                <Check className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant={actualAmount ? 'outline' : 'ghost'}
              className="h-7 text-xs px-2"
              onClick={() => {
                setEditingAmount(rowKey);
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

  const bothItems = fixedCommitments.filter(c => c.payPeriod === 0);
  const period1Only = fixedCommitments.filter(c => c.payPeriod === 1);
  const period2Only = fixedCommitments.filter(c => c.payPeriod === 2);

  const period1Items = fixedCommitments.filter(c => c.payPeriod === 1 || c.payPeriod === 0);
  const period2Items = fixedCommitments.filter(c => c.payPeriod === 2 || c.payPeriod === 0);

  const getPeriodPaidCount = (items: FixedCommitment[], period: number) =>
    items.filter(c => getTrackingForCommitment(c.id, period)?.isPaid).length;

  const p1Paid = getPeriodPaidCount(period1Items, 1);
  const p2Paid = getPeriodPaidCount(period2Items, 2);
  const p1Total = period1Items.reduce((sum, c) => sum + c.amount, 0);
  const p2Total = period2Items.reduce((sum, c) => sum + c.amount, 0);

  // Build aligned rows: shared items first, then exclusive items padded with nulls
  type Row = { left: FixedCommitment | null; right: FixedCommitment | null };
  const rows: Row[] = [];

  // Shared commitments on the same row
  bothItems.forEach(c => rows.push({ left: c, right: c }));

  // Exclusive items - interleave into rows
  const maxExclusive = Math.max(period1Only.length, period2Only.length);
  for (let i = 0; i < maxExclusive; i++) {
    rows.push({
      left: period1Only[i] || null,
      right: period2Only[i] || null,
    });
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5" />
              {MONTHS[month - 1]} {year} Scorecard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={paidCount === totalCommitments ? 'default' : 'secondary'} className="text-xs">
                {paidCount}/{totalCommitments} Paid
              </Badge>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                </Button>
              </CollapsibleTrigger>
            </div>
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
        <CollapsibleContent>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            {/* Column headers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
              <div className="hidden lg:flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-muted-foreground">Pay Period 1</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">${p1Total.toFixed(2)}</Badge>
                  <Badge variant={p1Paid === period1Items.length ? 'default' : 'secondary'} className="text-[10px]">
                    {p1Paid}/{period1Items.length}
                  </Badge>
                </div>
              </div>
              <div className="hidden lg:flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-muted-foreground">Pay Period 2</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">${p2Total.toFixed(2)}</Badge>
                  <Badge variant={p2Paid === period2Items.length ? 'default' : 'secondary'} className="text-[10px]">
                    {p2Paid}/{period2Items.length}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Aligned rows */}
            <div className="space-y-2">
              {rows.map((row, i) => (
                <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4">
                  <div>
                    {row.left ? renderCommitmentRow(row.left, 1) : (
                      <div className="hidden lg:block h-full" />
                    )}
                  </div>
                  <div>
                    {row.right ? renderCommitmentRow(row.right, 2) : (
                      <div className="hidden lg:block h-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile-only period headers */}
            <div className="lg:hidden mt-3 grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <p className="text-[10px] text-muted-foreground">Period 1</p>
                <p className="text-xs font-bold">{p1Paid}/{period1Items.length} • ${p1Total.toFixed(2)}</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <p className="text-[10px] text-muted-foreground">Period 2</p>
                <p className="text-xs font-bold">{p2Paid}/{period2Items.length} • ${p2Total.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default MonthlyCommitmentScorecard;
