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
import { 
  Loader2, Plus, Wallet, TrendingUp, TrendingDown, 
  DollarSign, Calendar, PiggyBank, Receipt, Trash2, Edit2, Settings
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
    loading,
    categorySummaries,
    totals,
    biweeklyBreakdown,
    addCategory,
    deleteCategory,
    setBudget,
    addExpense,
    deleteExpense,
    updatePaySettings,
  } = useFinance(selectedMonth, selectedYear);

  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [paySettingsDialogOpen, setPaySettingsDialogOpen] = useState(false);
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
  const [newPaySettings, setNewPaySettings] = useState({
    payAmount: '',
    firstPayDate: format(new Date(), 'yyyy-MM-dd'),
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
    if (!newPaySettings.payAmount || !newPaySettings.firstPayDate) return;
    try {
      await updatePaySettings(parseFloat(newPaySettings.payAmount), newPaySettings.firstPayDate);
      setPaySettingsDialogOpen(false);
      toast({ title: 'Pay settings updated' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update pay settings.', variant: 'destructive' });
    }
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
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Financial Plan</h1>
            <p className="text-muted-foreground">Track your monthly expenses and budget</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedMonth.toString()} onValueChange={v => setSelectedMonth(parseInt(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-[100px]">
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

        <Tabs defaultValue="monthly" className="space-y-6">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="monthly">Monthly Budget</TabsTrigger>
            <TabsTrigger value="biweekly">Biweekly Pay</TabsTrigger>
          </TabsList>

          {/* Monthly Budget Tab */}
          <TabsContent value="monthly" className="space-y-6">
            {/* Scorecards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Budget</p>
                      <p className="text-2xl font-bold text-foreground">${totals.budget.toFixed(2)}</p>
                    </div>
                    <Wallet className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount Spent</p>
                      <p className="text-2xl font-bold text-foreground">${totals.spent.toFixed(2)}</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-destructive" />
                  </div>
                </CardContent>
              </Card>

              <Card className={`bg-gradient-to-br ${totals.remaining >= 0 ? 'from-green-500/10 to-green-500/5 border-green-500/20' : 'from-red-500/10 to-red-500/5 border-red-500/20'}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Remaining</p>
                      <p className={`text-2xl font-bold ${totals.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(totals.remaining).toFixed(2)}
                        {totals.remaining < 0 && ' over'}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Budget Usage</p>
                    <span className="text-sm font-medium">{spentPercentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={spentPercentage} className="h-2" />
                </CardContent>
              </Card>
            </div>

            {/* Category Budgets & Expenses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Categories with Budget */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Categories & Budgets
                  </CardTitle>
                  <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Category</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Expense Category</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Category Name</Label>
                          <Input 
                            value={newCategory.name} 
                            onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                            placeholder="e.g., Groceries, Utilities"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Color</Label>
                          <div className="flex gap-2">
                            {Object.keys(CATEGORY_COLORS).map(color => (
                              <button
                                key={color}
                                className={`w-8 h-8 rounded-full ${CATEGORY_COLORS[color]} ${newCategory.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                                onClick={() => setNewCategory({ ...newCategory, color })}
                              />
                            ))}
                          </div>
                        </div>
                        <Button onClick={handleAddCategory} className="w-full">Add Category</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {categorySummaries.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No categories yet. Add one to get started!</p>
                  ) : (
                    <div className="space-y-3">
                      {categorySummaries.map(cat => (
                        <div key={cat.id} className="p-3 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[cat.color] || 'bg-gray-500'}`} />
                              <span className="font-medium">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {budgetEditCategory === cat.id ? (
                                <>
                                  <Input
                                    type="number"
                                    value={budgetAmount}
                                    onChange={e => setBudgetAmount(e.target.value)}
                                    className="w-24 h-8"
                                    placeholder="Budget"
                                  />
                                  <Button size="sm" onClick={() => handleSaveBudget(cat.id)}>Save</Button>
                                </>
                              ) : (
                                <>
                                  <Badge variant="outline">${cat.budget.toFixed(2)}</Badge>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-7 w-7"
                                    onClick={() => { setBudgetEditCategory(cat.id); setBudgetAmount(cat.budget.toString()); }}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-7 w-7 text-destructive"
                                    onClick={() => deleteCategory(cat.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Spent: ${cat.spent.toFixed(2)}</span>
                            <span className={cat.remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {cat.remaining >= 0 ? 'Remaining' : 'Over'}: ${Math.abs(cat.remaining).toFixed(2)}
                            </span>
                          </div>
                          {cat.budget > 0 && (
                            <Progress value={Math.min((cat.spent / cat.budget) * 100, 100)} className="h-1.5" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expenses List */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Expenses ({MONTHS[selectedMonth - 1]})
                  </CardTitle>
                  <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Expense</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Expense</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={newExpense.categoryId} onValueChange={v => setNewExpense({ ...newExpense, categoryId: v })}>
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
                            value={newExpense.description} 
                            onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                            placeholder="What did you spend on?"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Amount ($)</Label>
                          <Input 
                            type="number"
                            value={newExpense.amount} 
                            onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Input 
                            type="date"
                            value={newExpense.expenseDate} 
                            onChange={e => setNewExpense({ ...newExpense, expenseDate: e.target.value })}
                          />
                        </div>
                        <Button onClick={handleAddExpense} className="w-full">Add Expense</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {monthlyExpenses.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No expenses recorded this month.</p>
                  ) : (
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
                        {monthlyExpenses.map(expense => {
                          const category = categories.find(c => c.id === expense.categoryId);
                          return (
                            <TableRow key={expense.id}>
                              <TableCell>{format(parseISO(expense.expenseDate), 'MMM d')}</TableCell>
                              <TableCell>{expense.description}</TableCell>
                              <TableCell>
                                {category ? (
                                  <div className="flex items-center gap-1.5">
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
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Biweekly Pay Tab */}
          <TabsContent value="biweekly" className="space-y-6">
            {/* Pay Settings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Biweekly Pay Settings
                </CardTitle>
                <Dialog open={paySettingsDialogOpen} onOpenChange={setPaySettingsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Edit2 className="h-4 w-4 mr-1" /> Configure</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Configure Biweekly Pay</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Pay Amount (per paycheck)</Label>
                        <Input 
                          type="number"
                          value={newPaySettings.payAmount} 
                          onChange={e => setNewPaySettings({ ...newPaySettings, payAmount: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>First Pay Date</Label>
                        <Input 
                          type="date"
                          value={newPaySettings.firstPayDate} 
                          onChange={e => setNewPaySettings({ ...newPaySettings, firstPayDate: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">Enter any past or upcoming pay date. We'll calculate all pay dates from this.</p>
                      </div>
                      <Button onClick={handleSavePaySettings} className="w-full">Save Settings</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {paySettings ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Pay Amount</p>
                      <p className="text-xl font-bold">${paySettings.payAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">First Pay Date</p>
                      <p className="text-xl font-bold">{format(parseISO(paySettings.firstPayDate), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">Configure your biweekly pay settings to get started.</p>
                )}
              </CardContent>
            </Card>

            {/* Biweekly Breakdown */}
            {biweeklyBreakdown && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Paychecks This Month</p>
                        <p className="text-2xl font-bold text-foreground">{biweeklyBreakdown.paychecksThisMonth}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Income</p>
                        <p className="text-2xl font-bold text-green-600">${biweeklyBreakdown.totalIncome.toFixed(2)}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Recommended Budget (80%)</p>
                        <p className="text-2xl font-bold text-purple-600">${biweeklyBreakdown.recommendedBudget.toFixed(2)}</p>
                      </div>
                      <Wallet className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className={`bg-gradient-to-br ${biweeklyBreakdown.savings >= 0 ? 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20' : 'from-red-500/10 to-red-500/5 border-red-500/20'}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Net Savings</p>
                        <p className={`text-2xl font-bold ${biweeklyBreakdown.savings >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          ${Math.abs(biweeklyBreakdown.savings).toFixed(2)}
                          {biweeklyBreakdown.savings < 0 && ' deficit'}
                        </p>
                      </div>
                      <PiggyBank className="h-8 w-8 text-emerald-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Pay Dates */}
            {biweeklyBreakdown && biweeklyBreakdown.payDates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Pay Dates in {MONTHS[selectedMonth - 1]} {selectedYear}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {biweeklyBreakdown.payDates.map((date, i) => (
                      <div key={i} className="px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
                        <p className="text-sm font-medium">{format(date, 'EEEE')}</p>
                        <p className="text-lg font-bold">{format(date, 'MMM d, yyyy')}</p>
                        <p className="text-sm text-muted-foreground">${biweeklyBreakdown.payAmount.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Budget Allocation per Paycheck */}
            {biweeklyBreakdown && biweeklyBreakdown.paychecksThisMonth > 0 && categorySummaries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Budget Allocation per Paycheck</CardTitle>
                  <p className="text-sm text-muted-foreground">How much to set aside from each paycheck for your budget categories</p>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FinancialPlan;
