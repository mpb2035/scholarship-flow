import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFinance } from '@/hooks/useFinance';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, Plus, Wallet, TrendingUp, TrendingDown, 
  DollarSign, Calendar, PiggyBank, Receipt, Trash2, Edit2, Settings,
  Car, Zap, Phone, Home, Baby, ShoppingCart, Heart, MoreHorizontal
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CATEGORY_COLORS: Record<string, string> = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
};

const COMMITMENT_CATEGORIES = [
  { value: 'car', label: 'Car Payment', icon: Car },
  { value: 'utilities', label: 'Utilities', icon: Zap },
  { value: 'phone', label: 'Phone Bill', icon: Phone },
  { value: 'home', label: 'Home/Lawn', icon: Home },
  { value: 'baby', label: 'Diapers/Baby', icon: Baby },
  { value: 'grocery', label: 'Grocery', icon: ShoppingCart },
  { value: 'wife', label: 'Wife Pocket Money', icon: Heart },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
] as const;

const getCommitmentIcon = (category: string) => {
  const found = COMMITMENT_CATEGORIES.find(c => c.value === category);
  return found ? found.icon : MoreHorizontal;
};

const getCommitmentLabel = (category: string) => {
  const found = COMMITMENT_CATEGORIES.find(c => c.value === category);
  return found ? found.label : 'Other';
};

const FinancialPlan = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const {
    categories,
    monthlyExpenses,
    paySettings,
    fixedCommitments,
    loading,
    categorySummaries,
    totals,
    biweeklyBreakdown,
    totalFixedCommitments,
    getExpensesByPayPeriod,
    getPayPeriodTotals,
    getFixedCommitmentsByPayPeriod,
    getFixedCommitmentTotals,
    addCategory,
    deleteCategory,
    setBudget,
    addExpense,
    deleteExpense,
    updatePaySettings,
    addFixedCommitment,
    deleteFixedCommitment,
  } = useFinance(selectedMonth, selectedYear);

  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [biweeklyExpenseDialogOpen, setBiweeklyExpenseDialogOpen] = useState(false);
  const [activePayPeriod, setActivePayPeriod] = useState<1 | 2>(1);
  const [paySettingsDialogOpen, setPaySettingsDialogOpen] = useState(false);
  const [fixedCommitmentDialogOpen, setFixedCommitmentDialogOpen] = useState(false);
  const [budgetEditCategory, setBudgetEditCategory] = useState<string | null>(null);
  const [budgetAmount, setBudgetAmount] = useState('');

  // Form states
  const [newCategory, setNewCategory] = useState({ name: '', color: 'blue' });
  const [newExpense, setNewExpense] = useState({
    categoryId: '',
    description: '',
    amount: '',
    expenseDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [newBiweeklyExpense, setNewBiweeklyExpense] = useState({
    categoryId: '',
    description: '',
    amount: '',
    expenseDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [newPaySettings, setNewPaySettings] = useState({
    payAmount: '',
    firstPayDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [newFixedCommitment, setNewFixedCommitment] = useState({
    description: '',
    amount: '',
    payPeriod: '1',
    category: 'other',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (paySettings) {
      setNewPaySettings({
        payAmount: paySettings.payAmount.toString(),
        firstPayDate: paySettings.firstPayDate,
      });
    }
  }, [paySettings]);

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return;
    try {
      await addCategory(newCategory.name, 'receipt', newCategory.color);
      setNewCategory({ name: '', color: 'blue' });
      setCategoryDialogOpen(false);
      toast({ title: 'Category added', description: 'New expense category created.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to add category.', variant: 'destructive' });
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.description.trim() || !newExpense.amount) return;
    try {
      await addExpense({
        categoryId: newExpense.categoryId || null,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        expenseDate: newExpense.expenseDate,
      });
      setNewExpense({
        categoryId: '',
        description: '',
        amount: '',
        expenseDate: format(new Date(), 'yyyy-MM-dd'),
      });
      setExpenseDialogOpen(false);
      toast({ title: 'Expense added', description: 'New expense recorded.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to add expense.', variant: 'destructive' });
    }
  };

  const handleAddBiweeklyExpense = async () => {
    if (!newBiweeklyExpense.description.trim() || !newBiweeklyExpense.amount) return;
    try {
      await addExpense({
        categoryId: newBiweeklyExpense.categoryId || null,
        description: newBiweeklyExpense.description,
        amount: parseFloat(newBiweeklyExpense.amount),
        expenseDate: newBiweeklyExpense.expenseDate,
        payPeriod: activePayPeriod,
      });
      setNewBiweeklyExpense({
        categoryId: '',
        description: '',
        amount: '',
        expenseDate: format(new Date(), 'yyyy-MM-dd'),
      });
      setBiweeklyExpenseDialogOpen(false);
      toast({ title: 'Commitment added', description: `Added to Pay Period ${activePayPeriod}.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to add commitment.', variant: 'destructive' });
    }
  };

  const handleSaveBudget = async (categoryId: string) => {
    try {
      await setBudget(categoryId, parseFloat(budgetAmount) || 0);
      setBudgetEditCategory(null);
      setBudgetAmount('');
      toast({ title: 'Budget updated' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update budget.', variant: 'destructive' });
    }
  };

  const handleSavePaySettings = async () => {
    if (!newPaySettings.payAmount) return;
    try {
      await updatePaySettings(parseFloat(newPaySettings.payAmount), newPaySettings.firstPayDate);
      setPaySettingsDialogOpen(false);
      toast({ title: 'Pay settings updated' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update pay settings.', variant: 'destructive' });
    }
  };
  const handleAddFixedCommitment = async () => {
    if (!newFixedCommitment.description.trim() || !newFixedCommitment.amount) return;
    try {
      await addFixedCommitment({
        description: newFixedCommitment.description,
        amount: parseFloat(newFixedCommitment.amount),
        payPeriod: parseInt(newFixedCommitment.payPeriod),
        category: newFixedCommitment.category,
      });
      setNewFixedCommitment({ description: '', amount: '', payPeriod: '1', category: 'other' });
      setFixedCommitmentDialogOpen(false);
      toast({ title: 'Fixed commitment added' });
    } catch {
      toast({ title: 'Error', description: 'Failed to add fixed commitment.', variant: 'destructive' });
    }
  };

  // Mobile-friendly expense card for small screens
  const renderExpenseCard = (expense: typeof monthlyExpenses[0], showDelete = true) => {
    const category = categories.find(c => c.id === expense.categoryId);
    return (
      <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{expense.description}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground font-mono">
              {format(parseISO(expense.expenseDate), 'MMM d')}
            </span>
            {category && (
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[category.color] || 'bg-gray-500'}`} />
                <span className="text-xs text-muted-foreground">{category.name}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-semibold">${expense.amount.toFixed(2)}</span>
          {showDelete && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7 text-destructive"
              onClick={() => deleteExpense(expense.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Render pay period content
  const renderPayPeriodContent = (period: 1 | 2) => {
    const periodExpenses = getExpensesByPayPeriod(period);
    const periodTotals = getPayPeriodTotals(period);
    const fixedTotal = getFixedCommitmentTotals(period);
    const totalCommitted = periodTotals.spent + fixedTotal;
    const payAmount = paySettings?.payAmount || 0;
    const remaining = payAmount - totalCommitted;
    const spentPercent = payAmount > 0 ? Math.min((totalCommitted / payAmount) * 100, 100) : 0;

    return (
      <>
        {/* Period Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-3 sm:pt-6">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Salary</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">${payAmount.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardContent className="p-3 sm:pt-6">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Fixed Bills</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">${fixedTotal.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
            <CardContent className="p-3 sm:pt-6">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">+ Expenses</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">${periodTotals.spent.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${remaining >= 0 ? 'from-green-500/10 to-green-500/5 border-green-500/20' : 'from-red-500/10 to-red-500/5 border-red-500/20'}`}>
            <CardContent className="p-3 sm:pt-6">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Remaining</p>
                <p className={`text-lg sm:text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(remaining).toFixed(2)}
                  {remaining < 0 && ' over'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Progress */}
        <Card>
          <CardContent className="p-4 sm:pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Budget Usage</p>
              <span className="text-sm font-medium">{spentPercent.toFixed(0)}%</span>
            </div>
            <Progress value={spentPercent} className="h-2" />
          </CardContent>
        </Card>

        {/* Commitments List */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
              Commitments - Period {period}
            </CardTitle>
            <Button size="sm" className="w-full sm:w-auto" onClick={() => { setActivePayPeriod(period); setBiweeklyExpenseDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Commitment
            </Button>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            {periodExpenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No commitments for this pay period yet.</p>
            ) : (
              <>
                {/* Mobile card layout */}
                <div className="space-y-2 sm:hidden">
                  {periodExpenses.map(expense => renderExpenseCard(expense))}
                </div>
                {/* Desktop table layout */}
                <div className="hidden sm:block">
                  <ScrollArea className="w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {periodExpenses.map(expense => {
                          const category = categories.find(c => c.id === expense.categoryId);
                          return (
                            <TableRow key={expense.id}>
                              <TableCell className="font-mono text-sm">
                                {format(parseISO(expense.expenseDate), 'MMM d')}
                              </TableCell>
                              <TableCell>{expense.description}</TableCell>
                              <TableCell>
                                {category ? (
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[category.color] || 'bg-gray-500'}`} />
                                    <span className="text-sm">{category.name}</span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-medium">${expense.amount.toFixed(2)}</TableCell>
                              <TableCell>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => deleteExpense(expense.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </>
    );
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const spentPercentage = totals.budget > 0 ? Math.min((totals.spent / totals.budget) * 100, 100) : 0;

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Financial Plan</h1>
            <p className="text-sm text-muted-foreground">Track your biweekly pay and expenses</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedMonth.toString()} onValueChange={v => setSelectedMonth(parseInt(v))}>
              <SelectTrigger className="w-[120px] sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-[90px] sm:w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026, 2027].map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
            {/* Biweekly Pay Settings - Persistent Scorecard */}
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 sm:p-6">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
                    Biweekly Pay Settings
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Your salary is paid every two weeks — first half and second half of the month
                  </p>
                </div>
                <Dialog open={paySettingsDialogOpen} onOpenChange={setPaySettingsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="w-full sm:w-auto"><Edit2 className="h-4 w-4 mr-1" /> Configure</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Configure Biweekly Salary</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Salary per paycheck ($)</Label>
                        <Input 
                          type="number"
                          value={newPaySettings.payAmount} 
                          onChange={e => setNewPaySettings({ ...newPaySettings, payAmount: e.target.value })}
                          placeholder="0.00"
                        />
                        <p className="text-xs text-muted-foreground">Enter the fixed amount you receive every two weeks.</p>
                      </div>
                      <Button onClick={handleSavePaySettings} className="w-full">Save Settings</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                {paySettings ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Per Paycheck</p>
                      <p className="text-lg sm:text-xl font-bold">${paySettings.payAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Monthly (×2)</p>
                      <p className="text-lg sm:text-xl font-bold">${(paySettings.payAmount * 2).toFixed(2)}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">Fixed Commitments</p>
                      <p className="text-lg sm:text-xl font-bold text-orange-600">${totalFixedCommitments.toFixed(2)}/mo</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">Configure your biweekly salary to get started.</p>
                )}
              </CardContent>
            </Card>

            {/* Fixed Commitments */}
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 sm:p-6">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
                    Fixed Commitments
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Recurring bills split between pay periods • Total: ${totalFixedCommitments.toFixed(2)}/month
                  </p>
                </div>
                <Dialog open={fixedCommitmentDialogOpen} onOpenChange={setFixedCommitmentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="w-full sm:w-auto"><Plus className="h-4 w-4 mr-1" /> Add</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Add Fixed Commitment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={newFixedCommitment.category} onValueChange={v => setNewFixedCommitment({ ...newFixedCommitment, category: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COMMITMENT_CATEGORIES.map(c => (
                              <SelectItem key={c.value} value={c.value}>
                                <span className="flex items-center gap-2">
                                  <c.icon className="h-4 w-4" />
                                  {c.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input 
                          value={newFixedCommitment.description}
                          onChange={e => setNewFixedCommitment({ ...newFixedCommitment, description: e.target.value })}
                          placeholder="e.g., Car loan payment"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Amount ($)</Label>
                        <Input 
                          type="number"
                          value={newFixedCommitment.amount}
                          onChange={e => setNewFixedCommitment({ ...newFixedCommitment, amount: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Pay Period</Label>
                        <Select value={newFixedCommitment.payPeriod} onValueChange={v => setNewFixedCommitment({ ...newFixedCommitment, payPeriod: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Both Pay Periods</SelectItem>
                            <SelectItem value="1">Pay Period 1 Only</SelectItem>
                            <SelectItem value="2">Pay Period 2 Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAddFixedCommitment} className="w-full">Add Commitment</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                {fixedCommitments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">No fixed commitments yet. Add your recurring bills like car payment, utilities, phone bills, etc.</p>
                ) : (
                  <div className="space-y-4">
                    {/* Both Pay Periods */}
                    {getFixedCommitmentsByPayPeriod(1).filter(c => c.payPeriod === 0).length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-muted-foreground">Both Pay Periods</h4>
                          <Badge variant="outline" className="text-xs">
                            ${fixedCommitments.filter(c => c.payPeriod === 0).reduce((sum, c) => sum + c.amount, 0).toFixed(2)} each
                          </Badge>
                        </div>
                        {fixedCommitments.filter(c => c.payPeriod === 0).map(c => {
                          const Icon = getCommitmentIcon(c.category);
                          return (
                            <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-2 min-w-0">
                                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{c.description}</p>
                                  <p className="text-xs text-muted-foreground">{getCommitmentLabel(c.category)} • Both periods</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-semibold text-sm">${c.amount.toFixed(2)}</span>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteFixedCommitment(c.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Pay Period 1 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-muted-foreground">Pay Period 1</h4>
                          <Badge variant="outline" className="text-xs">${getFixedCommitmentTotals(1).toFixed(2)}</Badge>
                        </div>
                        {fixedCommitments.filter(c => c.payPeriod === 1).length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-3 border rounded-lg border-dashed">No exclusive commitments</p>
                        ) : (
                          fixedCommitments.filter(c => c.payPeriod === 1).map(c => {
                            const Icon = getCommitmentIcon(c.category);
                            return (
                              <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{c.description}</p>
                                    <p className="text-xs text-muted-foreground">{getCommitmentLabel(c.category)}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-semibold text-sm">${c.amount.toFixed(2)}</span>
                                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteFixedCommitment(c.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                      {/* Pay Period 2 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-muted-foreground">Pay Period 2</h4>
                          <Badge variant="outline" className="text-xs">${getFixedCommitmentTotals(2).toFixed(2)}</Badge>
                        </div>
                        {fixedCommitments.filter(c => c.payPeriod === 2).length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-3 border rounded-lg border-dashed">No exclusive commitments</p>
                        ) : (
                          fixedCommitments.filter(c => c.payPeriod === 2).map(c => {
                            const Icon = getCommitmentIcon(c.category);
                            return (
                              <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{c.description}</p>
                                    <p className="text-xs text-muted-foreground">{getCommitmentLabel(c.category)}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-semibold text-sm">${c.amount.toFixed(2)}</span>
                                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteFixedCommitment(c.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Biweekly Overview Breakdown */}
            {biweeklyBreakdown && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                  <CardContent className="p-3 sm:pt-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground">Paychecks</p>
                        <p className="text-lg sm:text-2xl font-bold text-foreground">{biweeklyBreakdown.paychecksThisMonth}</p>
                      </div>
                      <Calendar className="h-5 w-5 sm:h-8 sm:w-8 text-blue-500 shrink-0" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                  <CardContent className="p-3 sm:pt-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground">Total Income</p>
                        <p className="text-lg sm:text-2xl font-bold text-green-600">${biweeklyBreakdown.totalIncome.toFixed(2)}</p>
                      </div>
                      <DollarSign className="h-5 w-5 sm:h-8 sm:w-8 text-green-500 shrink-0" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                  <CardContent className="p-3 sm:pt-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground">Budget (80%)</p>
                        <p className="text-lg sm:text-2xl font-bold text-purple-600">${biweeklyBreakdown.recommendedBudget.toFixed(2)}</p>
                      </div>
                      <Wallet className="h-5 w-5 sm:h-8 sm:w-8 text-purple-500 shrink-0" />
                    </div>
                  </CardContent>
                </Card>

                <Card className={`bg-gradient-to-br col-span-2 lg:col-span-1 ${biweeklyBreakdown.savings >= 0 ? 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20' : 'from-red-500/10 to-red-500/5 border-red-500/20'}`}>
                  <CardContent className="p-3 sm:pt-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground">Net Savings</p>
                        <p className={`text-lg sm:text-2xl font-bold ${biweeklyBreakdown.savings >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          ${Math.abs(biweeklyBreakdown.savings).toFixed(2)}
                          {biweeklyBreakdown.savings < 0 && ' deficit'}
                        </p>
                      </div>
                      <PiggyBank className="h-5 w-5 sm:h-8 sm:w-8 text-emerald-500 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Pay Period Tabs */}
            {paySettings && (
              <Tabs defaultValue="period1" className="space-y-4">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                  <TabsTrigger value="period1" className="text-xs sm:text-sm" onClick={() => setActivePayPeriod(1)}>
                    Pay Period 1
                  </TabsTrigger>
                  <TabsTrigger value="period2" className="text-xs sm:text-sm" onClick={() => setActivePayPeriod(2)}>
                    Pay Period 2
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="period1" className="space-y-4">
                  {renderPayPeriodContent(1)}
                </TabsContent>

                <TabsContent value="period2" className="space-y-4">
                  {renderPayPeriodContent(2)}
                </TabsContent>
              </Tabs>
            )}

            {/* Budget Allocation per Paycheck */}
            {biweeklyBreakdown && biweeklyBreakdown.paychecksThisMonth > 0 && categorySummaries.length > 0 && (
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Budget Allocation per Paycheck</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">How much to set aside from each paycheck for your budget categories</p>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  {/* Mobile card layout */}
                  <div className="space-y-2 sm:hidden">
                    {categorySummaries.filter(c => c.budget > 0).map(cat => (
                      <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-3 h-3 rounded-full shrink-0 ${CATEGORY_COLORS[cat.color] || 'bg-gray-500'}`} />
                          <span className="truncate text-sm">{cat.name}</span>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <p className="font-semibold text-sm">${(cat.budget / biweeklyBreakdown.paychecksThisMonth).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">${cat.budget.toFixed(2)}/mo</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50 font-bold">
                      <span className="text-sm">Total</span>
                      <div className="text-right">
                        <p className="text-sm">${(totals.budget / biweeklyBreakdown.paychecksThisMonth).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground font-normal">${totals.budget.toFixed(2)}/mo</p>
                      </div>
                    </div>
                  </div>
                  {/* Desktop table layout */}
                  <div className="hidden sm:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Monthly Budget</TableHead>
                          <TableHead className="text-right">Per Paycheck</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categorySummaries.filter(c => c.budget > 0).map(cat => (
                          <TableRow key={cat.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[cat.color] || 'bg-gray-500'}`} />
                                {cat.name}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">${cat.budget.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-medium">
                              ${(cat.budget / biweeklyBreakdown.paychecksThisMonth).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-bold bg-muted/50">
                          <TableCell>Total</TableCell>
                          <TableCell className="text-right">${totals.budget.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            ${(totals.budget / biweeklyBreakdown.paychecksThisMonth).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Biweekly Expense Dialog */}
            <Dialog open={biweeklyExpenseDialogOpen} onOpenChange={setBiweeklyExpenseDialogOpen}>
              <DialogContent className="max-w-[95vw] sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Commitment - Pay Period {activePayPeriod}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newBiweeklyExpense.categoryId} onValueChange={v => setNewBiweeklyExpense({ ...newBiweeklyExpense, categoryId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input 
                      value={newBiweeklyExpense.description} 
                      onChange={e => setNewBiweeklyExpense({ ...newBiweeklyExpense, description: e.target.value })}
                      placeholder="What is this commitment for?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input 
                      type="number"
                      value={newBiweeklyExpense.amount} 
                      onChange={e => setNewBiweeklyExpense({ ...newBiweeklyExpense, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input 
                      type="date"
                      value={newBiweeklyExpense.expenseDate} 
                      onChange={e => setNewBiweeklyExpense({ ...newBiweeklyExpense, expenseDate: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddBiweeklyExpense} className="w-full">Add Commitment</Button>
                </div>
              </DialogContent>
            </Dialog>
        </div>
      </div>
    </div>
  );
};

export default FinancialPlan;
