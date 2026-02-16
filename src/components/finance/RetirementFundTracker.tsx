import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Shield, Plus, Trash2, TrendingUp, Wallet, ChevronDown, Pencil, Check, X, Target,
} from 'lucide-react';
import { RetirementFund, RetirementContribution } from '@/hooks/useRetirementFund';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface Props {
  month: number;
  year: number;
  funds: RetirementFund[];
  grandTotal: number;
  monthTotal: number;
  getFundTotal: (fundId: string) => number;
  getFundMonthTotal: (fundId: string) => number;
  getFundMonthContributions: (fundId: string) => RetirementContribution[];
  addFund: (name: string, biweeklyAmount: number, targetAmount?: number) => Promise<void>;
  updateFund: (id: string, updates: { biweeklyContribution?: number; targetAmount?: number; fundName?: string }) => Promise<void>;
  deleteFund: (id: string) => Promise<void>;
  addContribution: (data: { fundId: string; amount: number; payPeriod: number; notes?: string }) => Promise<void>;
  updateContribution: (id: string, amount: number) => Promise<void>;
  deleteContribution: (id: string) => Promise<void>;
}

const RetirementFundTracker = ({
  month, year, funds, grandTotal, monthTotal,
  getFundTotal, getFundMonthTotal, getFundMonthContributions,
  addFund, updateFund, deleteFund,
  addContribution, updateContribution, deleteContribution,
}: Props) => {
  const [isOpen, setIsOpen] = useState(true);
  const [fundDialogOpen, setFundDialogOpen] = useState(false);
  const [contribDialogOpen, setContribDialogOpen] = useState(false);
  const [newFund, setNewFund] = useState({ name: '', biweeklyAmount: '', targetAmount: '' });
  const [newContrib, setNewContrib] = useState({ fundId: '', amount: '', payPeriod: '1', notes: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editingBiweekly, setEditingBiweekly] = useState<string | null>(null);
  const [editBiweeklyValue, setEditBiweeklyValue] = useState('');

  const handleAddFund = async () => {
    if (!newFund.name.trim() || !newFund.biweeklyAmount) return;
    await addFund(
      newFund.name,
      parseFloat(newFund.biweeklyAmount),
      newFund.targetAmount ? parseFloat(newFund.targetAmount) : undefined,
    );
    setNewFund({ name: '', biweeklyAmount: '', targetAmount: '' });
    setFundDialogOpen(false);
  };

  const handleAddContribution = async () => {
    if (!newContrib.fundId || !newContrib.amount) return;
    await addContribution({
      fundId: newContrib.fundId,
      amount: parseFloat(newContrib.amount),
      payPeriod: parseInt(newContrib.payPeriod),
      notes: newContrib.notes || undefined,
    });
    setNewContrib({ fundId: '', amount: '', payPeriod: '1', notes: '' });
    setContribDialogOpen(false);
  };

  const handlePrefill = (fundId: string) => {
    const fund = funds.find(f => f.id === fundId);
    if (fund) {
      setNewContrib(prev => ({ ...prev, fundId, amount: fund.biweeklyContribution.toString() }));
    } else {
      setNewContrib(prev => ({ ...prev, fundId }));
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-gradient-to-br from-amber-500/15 to-amber-600/5 border-amber-500/30">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-amber-500/20">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Retirement Fund (All Time)</p>
                <p className="text-2xl sm:text-4xl font-bold text-amber-600">${grandTotal.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{MONTHS[month - 1]} {year}</p>
                <p className="text-lg sm:text-xl font-semibold text-foreground">+${monthTotal.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">this month</p>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>
      </Card>

      <CollapsibleContent>
        <div className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 sm:p-6">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                  Retirement Funds
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {funds.length} fund{funds.length !== 1 ? 's' : ''} • Auto biweekly contribution tracking
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Dialog open={fundDialogOpen} onOpenChange={setFundDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
                      <Plus className="h-4 w-4 mr-1" /> New Fund
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Create Retirement Fund</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Fund Name</Label>
                        <Input value={newFund.name} onChange={e => setNewFund({ ...newFund, name: e.target.value })} placeholder="e.g., TAP, SCP, EPF" />
                      </div>
                      <div className="space-y-2">
                        <Label>Biweekly Contribution ($)</Label>
                        <Input type="number" value={newFund.biweeklyAmount} onChange={e => setNewFund({ ...newFund, biweeklyAmount: e.target.value })} placeholder="0.00" />
                        <p className="text-xs text-muted-foreground">Default amount auto-filled when logging contributions</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Target Amount (optional)</Label>
                        <Input type="number" value={newFund.targetAmount} onChange={e => setNewFund({ ...newFund, targetAmount: e.target.value })} placeholder="0.00" />
                      </div>
                      <Button onClick={handleAddFund} className="w-full">Create Fund</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={contribDialogOpen} onOpenChange={setContribDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex-1 sm:flex-none" disabled={funds.length === 0}>
                      <Wallet className="h-4 w-4 mr-1" /> Log Contribution
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Log Retirement Contribution</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Fund</Label>
                        <Select value={newContrib.fundId} onValueChange={v => handlePrefill(v)}>
                          <SelectTrigger><SelectValue placeholder="Select fund" /></SelectTrigger>
                          <SelectContent>
                            {funds.map(f => (
                              <SelectItem key={f.id} value={f.id}>{f.fundName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Amount ($)</Label>
                        <Input type="number" value={newContrib.amount} onChange={e => setNewContrib({ ...newContrib, amount: e.target.value })} placeholder="0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label>Pay Period</Label>
                        <Select value={newContrib.payPeriod} onValueChange={v => setNewContrib({ ...newContrib, payPeriod: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Pay Period 1</SelectItem>
                            <SelectItem value="2">Pay Period 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Notes (optional)</Label>
                        <Input value={newContrib.notes} onChange={e => setNewContrib({ ...newContrib, notes: e.target.value })} placeholder="e.g., Bonus top-up" />
                      </div>
                      <Button onClick={handleAddContribution} className="w-full">Log Contribution</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              {funds.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">No retirement funds yet. Create one to start tracking!</p>
              ) : (
                <div className="space-y-3">
                  {funds.map(fund => {
                    const allTimeTotal = getFundTotal(fund.id);
                    const thisMonthTotal = getFundMonthTotal(fund.id);
                    const monthContribs = getFundMonthContributions(fund.id);
                    const progressPercent = fund.targetAmount ? Math.min((allTimeTotal / fund.targetAmount) * 100, 100) : null;

                    return (
                      <div key={fund.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-sm sm:text-base">{fund.fundName}</h4>
                              <Badge variant="outline" className="text-xs">
                                ${fund.biweeklyContribution.toFixed(2)}/2wk
                                {editingBiweekly !== fund.id && (
                                  <Button size="icon" variant="ghost" className="h-4 w-4 ml-1 -mr-1 text-muted-foreground" onClick={() => { setEditingBiweekly(fund.id); setEditBiweeklyValue(fund.biweeklyContribution.toString()); }}>
                                    <Pencil className="h-2 w-2" />
                                  </Button>
                                )}
                              </Badge>
                              {fund.targetAmount && (
                                <Badge variant="secondary" className="text-xs">Target: ${fund.targetAmount.toFixed(2)}</Badge>
                              )}
                            </div>
                            {editingBiweekly === fund.id && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <Input type="number" value={editBiweeklyValue} onChange={e => setEditBiweeklyValue(e.target.value)} className="h-7 w-28 text-xs px-2" autoFocus
                                  onKeyDown={e => {
                                    if (e.key === 'Enter' && editBiweeklyValue) { updateFund(fund.id, { biweeklyContribution: parseFloat(editBiweeklyValue) }); setEditingBiweekly(null); }
                                    else if (e.key === 'Escape') setEditingBiweekly(null);
                                  }}
                                />
                                <Button size="icon" variant="ghost" className="h-5 w-5 text-emerald-600" onClick={() => { if (editBiweeklyValue) { updateFund(fund.id, { biweeklyContribution: parseFloat(editBiweeklyValue) }); setEditingBiweekly(null); } }}>
                                  <Check className="h-2.5 w-2.5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setEditingBiweekly(null)}>
                                  <X className="h-2.5 w-2.5" />
                                </Button>
                              </div>
                            )}
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-lg font-bold text-amber-600">${allTimeTotal.toFixed(2)}</span>
                              {thisMonthTotal > 0 && (
                                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                  <TrendingUp className="h-3 w-3 text-amber-500" />
                                  +${thisMonthTotal.toFixed(2)} this month
                                </span>
                              )}
                            </div>
                          </div>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive shrink-0" onClick={() => deleteFund(fund.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        {progressPercent !== null && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Progress</span>
                              <span>{progressPercent.toFixed(0)}%</span>
                            </div>
                            <Progress value={progressPercent} className="h-2" />
                          </div>
                        )}

                        {monthContribs.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">{MONTHS[month - 1]} Contributions</p>
                            {monthContribs.map(c => (
                              <div key={c.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/40 text-xs">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Pay {c.payPeriod}</Badge>
                                  {c.notes && <span className="text-muted-foreground truncate max-w-[120px]">{c.notes}</span>}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {editingId === c.id ? (
                                    <>
                                      <Input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} className="h-6 w-20 text-xs px-1.5" autoFocus
                                        onKeyDown={e => {
                                          if (e.key === 'Enter' && editAmount) { updateContribution(c.id, parseFloat(editAmount)); setEditingId(null); }
                                          else if (e.key === 'Escape') setEditingId(null);
                                        }}
                                      />
                                      <Button size="icon" variant="ghost" className="h-5 w-5 text-emerald-600" onClick={() => { if (editAmount) { updateContribution(c.id, parseFloat(editAmount)); setEditingId(null); } }}>
                                        <Check className="h-2.5 w-2.5" />
                                      </Button>
                                      <Button size="icon" variant="ghost" className="h-5 w-5 text-muted-foreground" onClick={() => setEditingId(null)}>
                                        <X className="h-2.5 w-2.5" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <span className="font-medium text-amber-600">+${c.amount.toFixed(2)}</span>
                                      <Button size="icon" variant="ghost" className="h-5 w-5 text-muted-foreground" onClick={() => { setEditingId(c.id); setEditAmount(c.amount.toString()); }}>
                                        <Pencil className="h-2.5 w-2.5" />
                                      </Button>
                                      <Button size="icon" variant="ghost" className="h-5 w-5 text-destructive" onClick={() => deleteContribution(c.id)}>
                                        <Trash2 className="h-2.5 w-2.5" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default RetirementFundTracker;
