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
  CreditCard, Plus, Trash2, Pencil, Check, X, ChevronDown, CalendarClock, TrendingDown,
} from 'lucide-react';
import { LoanWithProjection, LOAN_TYPES } from '@/hooks/useLoanTracker';
import { format } from 'date-fns';

interface Props {
  loansWithProjections: LoanWithProjection[];
  totalDebt: number;
  totalMonthlyRepayment: number;
  addLoan: (data: { loanType: string; label: string; currentBalance: number; biweeklyRepayment: number; startDate?: string; notes?: string }) => Promise<void>;
  updateLoan: (id: string, updates: { currentBalance?: number; biweeklyRepayment?: number; label?: string; startDate?: string }) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
}

const LoanTrackerScorecard = ({ loansWithProjections, totalDebt, totalMonthlyRepayment, addLoan, updateLoan, deleteLoan }: Props) => {
  const [isOpen, setIsOpen] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editField, setEditField] = useState<'balance' | 'repayment'>('balance');
  const [editValue, setEditValue] = useState('');
  const [newLoan, setNewLoan] = useState({
    loanType: 'personal_loan',
    label: '',
    currentBalance: '',
    biweeklyRepayment: '',
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleAdd = async () => {
    if (!newLoan.label.trim() || !newLoan.currentBalance) return;
    await addLoan({
      loanType: newLoan.loanType,
      label: newLoan.label,
      currentBalance: parseFloat(newLoan.currentBalance),
      biweeklyRepayment: parseFloat(newLoan.biweeklyRepayment) || 0,
      startDate: newLoan.startDate,
      notes: newLoan.notes || undefined,
    });
    setNewLoan({ loanType: 'personal_loan', label: '', currentBalance: '', biweeklyRepayment: '', startDate: new Date().toISOString().split('T')[0], notes: '' });
    setDialogOpen(false);
  };

  const handleSaveEdit = (id: string) => {
    if (!editValue) return;
    if (editField === 'balance') {
      updateLoan(id, { currentBalance: parseFloat(editValue) });
    } else {
      updateLoan(id, { biweeklyRepayment: parseFloat(editValue) });
    }
    setEditingId(null);
  };

  const startEdit = (id: string, field: 'balance' | 'repayment', value: number) => {
    setEditingId(id);
    setEditField(field);
    setEditValue(value.toString());
  };

  const getLoanTypeLabel = (type: string) => {
    const found = LOAN_TYPES.find(t => t.value === type);
    return found ? found.label : type;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-gradient-to-br from-red-500/15 to-red-600/5 border-red-500/30">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-red-500/20">
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Outstanding Debt</p>
                <p className="text-2xl sm:text-4xl font-bold text-red-600">${totalDebt.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{loansWithProjections.length} active loan{loansWithProjections.length !== 1 ? 's' : ''}</p>
                <p className="text-sm sm:text-base font-semibold text-foreground">${totalMonthlyRepayment.toFixed(2)}/mo</p>
                <p className="text-xs text-muted-foreground">total repayment</p>
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
                  <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
                  Loan Repayment Tracker
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Track loans with auto-reducing biweekly repayments
                </p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-1" /> Add Loan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add Loan</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Loan Type</Label>
                      <Select value={newLoan.loanType} onValueChange={v => setNewLoan({ ...newLoan, loanType: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LOAN_TYPES.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Label / Name</Label>
                      <Input
                        value={newLoan.label}
                        onChange={e => setNewLoan({ ...newLoan, label: e.target.value })}
                        placeholder="e.g., Honda Civic Loan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Standing Balance ($)</Label>
                      <Input
                        type="number"
                        value={newLoan.currentBalance}
                        onChange={e => setNewLoan({ ...newLoan, currentBalance: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Biweekly Repayment Amount ($)</Label>
                      <Input
                        type="number"
                        value={newLoan.biweeklyRepayment}
                        onChange={e => setNewLoan({ ...newLoan, biweeklyRepayment: e.target.value })}
                        placeholder="0.00"
                      />
                      <p className="text-xs text-muted-foreground">Fixed amount deducted every 2 weeks automatically</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Repayment Start Date</Label>
                      <Input
                        type="date"
                        value={newLoan.startDate}
                        onChange={e => setNewLoan({ ...newLoan, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Input
                        value={newLoan.notes}
                        onChange={e => setNewLoan({ ...newLoan, notes: e.target.value })}
                        placeholder="e.g., 5 year tenure"
                      />
                    </div>
                    <Button onClick={handleAdd} className="w-full">Add Loan</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              {loansWithProjections.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">No loans tracked yet. Add one to start monitoring your debt reduction!</p>
              ) : (
                <div className="space-y-4">
                  {loansWithProjections.map(loan => {
                    const paidPercent = loan.initialAmount > 0
                      ? Math.min(((loan.initialAmount - loan.projectedBalance) / loan.initialAmount) * 100, 100)
                      : 0;

                    return (
                      <div key={loan.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-sm sm:text-base">{loan.label}</h4>
                              <Badge variant="outline" className="text-xs">{getLoanTypeLabel(loan.loanType)}</Badge>
                            </div>
                            {loan.notes && <p className="text-xs text-muted-foreground mt-0.5">{loan.notes}</p>}
                          </div>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive shrink-0" onClick={() => deleteLoan(loan.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Balance & Repayment */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-muted/40 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Projected Balance</p>
                            <div className="flex items-center gap-1.5">
                              {editingId === loan.id && editField === 'balance' ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    value={editValue}
                                    onChange={e => setEditValue(e.target.value)}
                                    className="h-7 w-24 text-xs px-2"
                                    autoFocus
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') handleSaveEdit(loan.id);
                                      else if (e.key === 'Escape') setEditingId(null);
                                    }}
                                  />
                                  <Button size="icon" variant="ghost" className="h-5 w-5 text-emerald-600" onClick={() => handleSaveEdit(loan.id)}>
                                    <Check className="h-2.5 w-2.5" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setEditingId(null)}>
                                    <X className="h-2.5 w-2.5" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-lg font-bold text-red-600">${loan.projectedBalance.toFixed(2)}</span>
                                  <Button size="icon" variant="ghost" className="h-5 w-5 text-muted-foreground" onClick={() => startEdit(loan.id, 'balance', loan.currentBalance)}>
                                    <Pencil className="h-2.5 w-2.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="bg-muted/40 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Biweekly Payment</p>
                            <div className="flex items-center gap-1.5">
                              {editingId === loan.id && editField === 'repayment' ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    value={editValue}
                                    onChange={e => setEditValue(e.target.value)}
                                    className="h-7 w-24 text-xs px-2"
                                    autoFocus
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') handleSaveEdit(loan.id);
                                      else if (e.key === 'Escape') setEditingId(null);
                                    }}
                                  />
                                  <Button size="icon" variant="ghost" className="h-5 w-5 text-emerald-600" onClick={() => handleSaveEdit(loan.id)}>
                                    <Check className="h-2.5 w-2.5" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setEditingId(null)}>
                                    <X className="h-2.5 w-2.5" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-lg font-bold text-foreground">-${loan.biweeklyRepayment.toFixed(2)}</span>
                                  <Button size="icon" variant="ghost" className="h-5 w-5 text-muted-foreground" onClick={() => startEdit(loan.id, 'repayment', loan.biweeklyRepayment)}>
                                    <Pencil className="h-2.5 w-2.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Paid off</span>
                            <span>{paidPercent.toFixed(1)}% — ${loan.totalRepaid.toFixed(2)} repaid</span>
                          </div>
                          <Progress value={paidPercent} className="h-2" />
                        </div>

                        {/* Payoff info */}
                        <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CalendarClock className="h-3 w-3" />
                            <span>Started: {format(new Date(loan.startDate), 'MMM d, yyyy')}</span>
                          </div>
                          {loan.payoffDate ? (
                            <Badge variant={loan.projectedBalance <= 0 ? 'default' : 'secondary'} className="text-xs">
                              {loan.projectedBalance <= 0
                                ? '✅ Paid Off!'
                                : `Payoff: ${format(loan.payoffDate, 'MMM yyyy')} (${loan.periodsRemaining} periods)`
                              }
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">No repayment set</Badge>
                          )}
                        </div>
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

export default LoanTrackerScorecard;
