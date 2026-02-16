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
import { PiggyBank, Plus, Trash2, TrendingUp, Target, Wallet, ChevronDown, Pencil, Check, X } from 'lucide-react';
import { SavingsGoal, SavingsContribution } from '@/hooks/useSavingsTracker';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface Props {
  month: number;
  year: number;
  goals: SavingsGoal[];
  grandTotal: number;
  monthTotal: number;
  getGoalTotal: (goalId: string) => number;
  getGoalMonthTotal: (goalId: string) => number;
  getGoalMonthContributions: (goalId: string) => SavingsContribution[];
  addGoal: (name: string, targetAmount?: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addContribution: (data: { goalId: string; amount: number; payPeriod: number; notes?: string }) => Promise<void>;
  deleteContribution: (id: string) => Promise<void>;
  updateContribution: (id: string, amount: number) => Promise<void>;
}

const SavingsTracker = ({
  month, year, goals, grandTotal, monthTotal,
  getGoalTotal, getGoalMonthTotal, getGoalMonthContributions,
  addGoal, deleteGoal, addContribution, deleteContribution, updateContribution,
}: Props) => {
  const [isOpen, setIsOpen] = useState(true);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [contribDialogOpen, setContribDialogOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '' });
  const [newContrib, setNewContrib] = useState({ goalId: '', amount: '', payPeriod: '1', notes: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  const handleAddGoal = async () => {
    if (!newGoal.name.trim()) return;
    await addGoal(newGoal.name, newGoal.targetAmount ? parseFloat(newGoal.targetAmount) : undefined);
    setNewGoal({ name: '', targetAmount: '' });
    setGoalDialogOpen(false);
  };

  const handleAddContribution = async () => {
    if (!newContrib.goalId || !newContrib.amount) return;
    await addContribution({
      goalId: newContrib.goalId,
      amount: parseFloat(newContrib.amount),
      payPeriod: parseInt(newContrib.payPeriod),
      notes: newContrib.notes || undefined,
    });
    setNewContrib({ goalId: '', amount: '', payPeriod: '1', notes: '' });
    setContribDialogOpen(false);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border-emerald-500/30">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-emerald-500/20">
                <PiggyBank className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Savings (All Time)</p>
                <p className="text-2xl sm:text-4xl font-bold text-emerald-600">${grandTotal.toFixed(2)}</p>
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
      {/* Savings Goals */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 sm:p-6">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Target className="h-4 w-4 sm:h-5 sm:w-5" />
              Savings Goals
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {goals.length} active goal{goals.length !== 1 ? 's' : ''} • Contributions auto-accumulate monthly
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
                  <Plus className="h-4 w-4 mr-1" /> New Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Savings Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Purpose / Name</Label>
                    <Input
                      value={newGoal.name}
                      onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                      placeholder="e.g., Emergency Fund, Vacation, New Car"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Amount (optional)</Label>
                    <Input
                      type="number"
                      value={newGoal.targetAmount}
                      onChange={e => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-muted-foreground">Leave empty for open-ended savings</p>
                  </div>
                  <Button onClick={handleAddGoal} className="w-full">Create Goal</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={contribDialogOpen} onOpenChange={setContribDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex-1 sm:flex-none" disabled={goals.length === 0}>
                  <Wallet className="h-4 w-4 mr-1" /> Add Savings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Savings Contribution</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Savings Goal</Label>
                    <Select value={newContrib.goalId} onValueChange={v => setNewContrib({ ...newContrib, goalId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {goals.map(g => (
                          <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount ($)</Label>
                    <Input
                      type="number"
                      value={newContrib.amount}
                      onChange={e => setNewContrib({ ...newContrib, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>From Pay Period</Label>
                    <Select value={newContrib.payPeriod} onValueChange={v => setNewContrib({ ...newContrib, payPeriod: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Pay Period 1</SelectItem>
                        <SelectItem value="2">Pay Period 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Input
                      value={newContrib.notes}
                      onChange={e => setNewContrib({ ...newContrib, notes: e.target.value })}
                      placeholder="e.g., Bonus savings"
                    />
                  </div>
                  <Button onClick={handleAddContribution} className="w-full">Save Contribution</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          {goals.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No savings goals yet. Create one to start tracking your savings!
            </p>
          ) : (
            <div className="space-y-3">
              {goals.map(goal => {
                const allTimeTotal = getGoalTotal(goal.id);
                const thisMonthTotal = getGoalMonthTotal(goal.id);
                const monthContribs = getGoalMonthContributions(goal.id);
                const progressPercent = goal.targetAmount
                  ? Math.min((allTimeTotal / goal.targetAmount) * 100, 100)
                  : null;

                return (
                  <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-sm sm:text-base">{goal.name}</h4>
                          {goal.targetAmount && (
                            <Badge variant="outline" className="text-xs">
                              Target: ${goal.targetAmount.toFixed(2)}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-lg font-bold text-emerald-600">${allTimeTotal.toFixed(2)}</span>
                          {thisMonthTotal > 0 && (
                            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                              <TrendingUp className="h-3 w-3 text-emerald-500" />
                              +${thisMonthTotal.toFixed(2)} this month
                            </span>
                          )}
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive shrink-0" onClick={() => deleteGoal(goal.id)}>
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

                    {/* This month's contributions */}
                    {monthContribs.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">{MONTHS[month - 1]} Contributions</p>
                        {monthContribs.map(c => (
                          <div key={c.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/40 text-xs">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                Pay {c.payPeriod}
                              </Badge>
                              {c.notes && <span className="text-muted-foreground truncate max-w-[120px]">{c.notes}</span>}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {editingId === c.id ? (
                                <>
                                  <Input
                                    type="number"
                                    value={editAmount}
                                    onChange={e => setEditAmount(e.target.value)}
                                    className="h-6 w-20 text-xs px-1.5"
                                    autoFocus
                                    onKeyDown={e => {
                                      if (e.key === 'Enter' && editAmount) {
                                        updateContribution(c.id, parseFloat(editAmount));
                                        setEditingId(null);
                                      } else if (e.key === 'Escape') {
                                        setEditingId(null);
                                      }
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
                                  <span className="font-medium text-emerald-600">+${c.amount.toFixed(2)}</span>
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

export default SavingsTracker;
