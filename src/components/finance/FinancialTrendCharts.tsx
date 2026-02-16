import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { SavingsContribution, SavingsGoal } from '@/hooks/useSavingsTracker';
import { LoanWithProjection } from '@/hooks/useLoanTracker';
import { RetirementContribution, RetirementFund } from '@/hooks/useRetirementFund';
import { NetWorthEntry } from '@/hooks/useNetWorthTracker';

interface Props {
  savingsGoals: SavingsGoal[];
  savingsContributions: SavingsContribution[];
  loansWithProjections: LoanWithProjection[];
  retirementFunds: RetirementFund[];
  retirementContributions: RetirementContribution[];
  netWorthEntries: NetWorthEntry[];
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const FinancialTrendCharts = ({
  savingsGoals, savingsContributions,
  loansWithProjections, retirementFunds, retirementContributions,
  netWorthEntries,
}: Props) => {
  const [isOpen, setIsOpen] = useState(true);

  // Net worth trend: aggregate monthly totals from savings + retirement - loans
  const netWorthTrendData = useMemo(() => {
    const monthMap = new Map<string, { savings: number; retirement: number; loans: number; assets: number }>();

    // Build cumulative savings by month
    const sortedSavings = [...savingsContributions].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    let cumSavings = 0;
    const savingsByMonth = new Map<string, number>();
    for (const c of sortedSavings) {
      const key = `${c.year}-${String(c.month).padStart(2, '0')}`;
      cumSavings += c.amount;
      savingsByMonth.set(key, cumSavings);
    }

    // Build cumulative retirement by month
    const sortedRetirement = [...retirementContributions].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    let cumRetirement = 0;
    const retirementByMonth = new Map<string, number>();
    for (const c of sortedRetirement) {
      const key = `${c.year}-${String(c.month).padStart(2, '0')}`;
      cumRetirement += c.amount;
      retirementByMonth.set(key, cumRetirement);
    }

    // Get all unique months
    const allKeys = new Set<string>();
    savingsByMonth.forEach((_, k) => allKeys.add(k));
    retirementByMonth.forEach((_, k) => allKeys.add(k));

    // Add current month if not present
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    allKeys.add(currentKey);

    const sortedKeys = Array.from(allKeys).sort();

    // Calculate total loan debt (current projected balance)
    const totalLoanDebt = loansWithProjections.reduce((sum, l) => sum + l.projectedBalance, 0);

    // Latest assets from net worth entries
    const latestAssets = new Map<string, number>();
    for (const e of netWorthEntries) {
      if (e.entryType === 'asset') {
        const existing = latestAssets.get(e.label);
        if (!existing || existing < e.amount) latestAssets.set(e.label, e.amount);
      }
    }
    const totalAssets = Array.from(latestAssets.values()).reduce((sum, v) => sum + v, 0);

    let lastSavings = 0;
    let lastRetirement = 0;

    return sortedKeys.map(key => {
      const [yr, mo] = key.split('-').map(Number);
      lastSavings = savingsByMonth.get(key) ?? lastSavings;
      lastRetirement = retirementByMonth.get(key) ?? lastRetirement;

      const netWorth = lastSavings + lastRetirement + totalAssets - totalLoanDebt;

      return {
        month: `${MONTHS_SHORT[mo - 1]} ${yr}`,
        savings: lastSavings,
        retirement: lastRetirement,
        loans: totalLoanDebt,
        netWorth: Math.round(netWorth * 100) / 100,
      };
    });
  }, [savingsContributions, retirementContributions, loansWithProjections, netWorthEntries]);

  // Individual savings goal trends
  const savingsGoalTrends = useMemo(() => {
    return savingsGoals.map(goal => {
      const goalContribs = savingsContributions
        .filter(c => c.goalId === goal.id)
        .sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        });

      let cumulative = 0;
      const data = goalContribs.reduce((acc, c) => {
        const key = `${MONTHS_SHORT[c.month - 1]} ${c.year}`;
        cumulative += c.amount;
        // Update existing month or add new
        const existing = acc.find(d => d.month === key);
        if (existing) {
          existing.total = cumulative;
        } else {
          acc.push({ month: key, total: cumulative });
        }
        return acc;
      }, [] as { month: string; total: number }[]);

      return { goal, data };
    });
  }, [savingsGoals, savingsContributions]);

  // Loan projection trends (future)
  const loanTrends = useMemo(() => {
    return loansWithProjections.map(loan => {
      const points: { month: string; balance: number }[] = [];
      const now = new Date();
      let balance = loan.projectedBalance;
      const maxPeriods = Math.min(loan.periodsRemaining + 1, 52); // Show up to ~2 years

      for (let i = 0; i < maxPeriods; i++) {
        const date = new Date(now.getTime() + i * 14 * 24 * 60 * 60 * 1000);
        const label = `${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;

        // Avoid duplicate month labels, keep latest
        const existing = points.find(p => p.month === label);
        if (existing) {
          existing.balance = Math.max(0, balance);
        } else {
          points.push({ month: label, balance: Math.max(0, balance) });
        }

        balance -= loan.biweeklyRepayment;
        if (balance <= 0) {
          if (!points.find(p => p.balance === 0)) {
            const endDate = new Date(now.getTime() + (i + 1) * 14 * 24 * 60 * 60 * 1000);
            const endLabel = `${MONTHS_SHORT[endDate.getMonth()]} ${endDate.getFullYear()}`;
            if (!points.find(p => p.month === endLabel)) {
              points.push({ month: endLabel, balance: 0 });
            }
          }
          break;
        }
      }

      return { loan, data: points };
    });
  }, [loansWithProjections]);

  // Retirement fund trends
  const retirementTrends = useMemo(() => {
    return retirementFunds.map(fund => {
      const fundContribs = retirementContributions
        .filter(c => c.fundId === fund.id)
        .sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        });

      let cumulative = 0;
      const data = fundContribs.reduce((acc, c) => {
        const key = `${MONTHS_SHORT[c.month - 1]} ${c.year}`;
        cumulative += c.amount;
        const existing = acc.find(d => d.month === key);
        if (existing) {
          existing.total = cumulative;
        } else {
          acc.push({ month: key, total: cumulative });
        }
        return acc;
      }, [] as { month: string; total: number }[]);

      return { fund, data };
    });
  }, [retirementFunds, retirementContributions]);

  const hasData = netWorthTrendData.length > 0 || savingsGoalTrends.some(s => s.data.length > 0) || loanTrends.some(l => l.data.length > 0);

  if (!hasData) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="flex items-center justify-between p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
            Financial Trends
          </CardTitle>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <Tabs defaultValue="networth" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 overflow-x-auto">
                <TabsTrigger value="networth" className="text-xs sm:text-sm">Net Worth</TabsTrigger>
                <TabsTrigger value="savings" className="text-xs sm:text-sm">Savings</TabsTrigger>
                <TabsTrigger value="loans" className="text-xs sm:text-sm">Loans</TabsTrigger>
                <TabsTrigger value="retirement" className="text-xs sm:text-sm">Retirement</TabsTrigger>
              </TabsList>

              {/* Net Worth Trend */}
              <TabsContent value="networth">
                {netWorthTrendData.length > 1 ? (
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={netWorthTrendData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                        <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, '']} />
                        <Legend />
                        <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                        <Area type="monotone" dataKey="savings" name="Savings" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={1.5} />
                        <Area type="monotone" dataKey="retirement" name="Retirement" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={1.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8 text-sm">Add savings or retirement contributions across multiple months to see trends.</p>
                )}
              </TabsContent>

              {/* Savings Trends */}
              <TabsContent value="savings">
                {savingsGoalTrends.filter(s => s.data.length > 0).length > 0 ? (
                  <div className="space-y-6">
                    {savingsGoalTrends.filter(s => s.data.length > 0).map(({ goal, data }) => (
                      <div key={goal.id}>
                        <p className="text-sm font-medium mb-2">{goal.name} {goal.targetAmount ? `(Target: $${goal.targetAmount.toFixed(2)})` : ''}</p>
                        <div className="h-48 sm:h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total']} />
                              <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8 text-sm">No savings data yet. Log contributions to see trends.</p>
                )}
              </TabsContent>

              {/* Loan Trends */}
              <TabsContent value="loans">
                {loanTrends.filter(l => l.data.length > 1).length > 0 ? (
                  <div className="space-y-6">
                    {loanTrends.filter(l => l.data.length > 1).map(({ loan, data }) => (
                      <div key={loan.id}>
                        <p className="text-sm font-medium mb-2">{loan.label} — Projected Payoff</p>
                        <div className="h-48 sm:h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Balance']} />
                              <Area type="monotone" dataKey="balance" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8 text-sm">Add loans with biweekly repayments to see projected payoff charts.</p>
                )}
              </TabsContent>

              {/* Retirement Trends */}
              <TabsContent value="retirement">
                {retirementTrends.filter(r => r.data.length > 0).length > 0 ? (
                  <div className="space-y-6">
                    {retirementTrends.filter(r => r.data.length > 0).map(({ fund, data }) => (
                      <div key={fund.id}>
                        <p className="text-sm font-medium mb-2">{fund.fundName} {fund.targetAmount ? `(Target: $${fund.targetAmount.toFixed(2)})` : ''}</p>
                        <div className="h-48 sm:h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total']} />
                              <Line type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8 text-sm">No retirement data yet. Log contributions to see trends.</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default FinancialTrendCharts;
