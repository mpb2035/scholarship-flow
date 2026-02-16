import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { ExpenseCategory, MonthlyBudget, Expense, BiweeklyPaySettings, CategoryWithBudgetAndSpending, FixedCommitment } from '@/types/finance';

export const useFinance = (month: number, year: number) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [paySettings, setPaySettings] = useState<BiweeklyPaySettings | null>(null);
  const [fixedCommitments, setFixedCommitments] = useState<FixedCommitment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [categoriesRes, budgetsRes, expensesRes, payRes, commitmentsRes] = await Promise.all([
        supabase.from('expense_categories').select('*').eq('user_id', user.id),
        supabase.from('monthly_budgets').select('*').eq('user_id', user.id).eq('month', month).eq('year', year),
        supabase.from('expenses').select('*').eq('user_id', user.id),
        supabase.from('biweekly_pay_settings').select('*').eq('user_id', user.id).single(),
        supabase.from('fixed_commitments').select('*').eq('user_id', user.id).eq('is_active', true),
      ]);

      if (categoriesRes.data) {
        setCategories(categoriesRes.data.map(c => ({
          id: c.id,
          userId: c.user_id,
          name: c.name,
          icon: c.icon || 'receipt',
          color: c.color || 'blue',
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        })));
      }

      if (budgetsRes.data) {
        setBudgets(budgetsRes.data.map(b => ({
          id: b.id,
          userId: b.user_id,
          categoryId: b.category_id,
          month: b.month,
          year: b.year,
          budgetAmount: Number(b.budget_amount),
          createdAt: b.created_at,
          updatedAt: b.updated_at,
        })));
      }

      if (expensesRes.data) {
        setExpenses(expensesRes.data.map(e => ({
          id: e.id,
          userId: e.user_id,
          categoryId: e.category_id,
          description: e.description,
          amount: Number(e.amount),
          expenseDate: e.expense_date,
          isRecurring: e.is_recurring,
          payPeriod: (e as any).pay_period as number | null,
          createdAt: e.created_at,
          updatedAt: e.updated_at,
        })));
      }

      if (payRes.data) {
        setPaySettings({
          id: payRes.data.id,
          userId: payRes.data.user_id,
          payAmount: Number(payRes.data.pay_amount),
          firstPayDate: payRes.data.first_pay_date,
          createdAt: payRes.data.created_at,
          updatedAt: payRes.data.updated_at,
        });
      }

      if (commitmentsRes.data) {
        setFixedCommitments(commitmentsRes.data.map((c: any) => ({
          id: c.id,
          userId: c.user_id,
          description: c.description,
          amount: Number(c.amount),
          payPeriod: c.pay_period,
          category: c.category,
          customLabel: c.custom_label || null,
          isActive: c.is_active,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        })));
      }
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter expenses for current month
  const monthlyExpenses = useMemo(() => {
    return expenses.filter(e => {
      const date = new Date(e.expenseDate);
      return date.getMonth() + 1 === month && date.getFullYear() === year;
    });
  }, [expenses, month, year]);

  // Filter expenses by pay period (1 or 2)
  const getExpensesByPayPeriod = (payPeriod: 1 | 2) => {
    return monthlyExpenses.filter(e => e.payPeriod === payPeriod);
  };

  // Get totals for a specific pay period
  const getPayPeriodTotals = (payPeriod: 1 | 2) => {
    const periodExpenses = getExpensesByPayPeriod(payPeriod);
    const totalSpent = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
    const perPaycheckBudget = totals.budget / 2; // Split budget evenly between pay periods
    return {
      spent: totalSpent,
      budget: perPaycheckBudget,
      remaining: perPaycheckBudget - totalSpent,
    };
  };

  // Calculate category summaries with budget and spending
  const categorySummaries = useMemo((): CategoryWithBudgetAndSpending[] => {
    return categories.map(cat => {
      const budget = budgets.find(b => b.categoryId === cat.id);
      const spent = monthlyExpenses
        .filter(e => e.categoryId === cat.id)
        .reduce((sum, e) => sum + e.amount, 0);
      const budgetAmount = budget?.budgetAmount || 0;
      
      return {
        ...cat,
        budget: budgetAmount,
        spent,
        remaining: budgetAmount - spent,
      };
    });
  }, [categories, budgets, monthlyExpenses]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalBudget = budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
    const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      budget: totalBudget,
      spent: totalSpent,
      remaining: totalBudget - totalSpent,
    };
  }, [budgets, monthlyExpenses]);

  // Calculate biweekly budget breakdown
  const biweeklyBreakdown = useMemo(() => {
    if (!paySettings) return null;

    const firstPayDate = new Date(paySettings.firstPayDate);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    // Find pay dates in this month
    const payDates: Date[] = [];
    let currentPayDate = new Date(firstPayDate);
    
    // Go back far enough to find all pay dates
    while (currentPayDate > monthStart) {
      currentPayDate = new Date(currentPayDate.getTime() - 14 * 24 * 60 * 60 * 1000);
    }
    
    // Find pay dates in this month
    while (currentPayDate <= monthEnd) {
      if (currentPayDate >= monthStart && currentPayDate <= monthEnd) {
        payDates.push(new Date(currentPayDate));
      }
      currentPayDate = new Date(currentPayDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    }

    const paychecksThisMonth = payDates.length;
    const totalIncome = paychecksThisMonth * paySettings.payAmount;
    const recommendedBudget = totalIncome * 0.8; // 80% for expenses

    return {
      payDates,
      paychecksThisMonth,
      payAmount: paySettings.payAmount,
      totalIncome,
      recommendedBudget,
      savings: totalIncome - totals.spent,
    };
  }, [paySettings, month, year, totals.spent]);

  // CRUD Operations
  const addCategory = async (name: string, icon?: string, color?: string) => {
    if (!user) return;
    const { data, error } = await supabase.from('expense_categories').insert({
      user_id: user.id,
      name,
      icon: icon || 'receipt',
      color: color || 'blue',
    }).select().single();

    if (error) throw error;
    await fetchData();
    return data;
  };

  const updateCategory = async (id: string, updates: Partial<ExpenseCategory>) => {
    const { error } = await supabase.from('expense_categories').update({
      name: updates.name,
      icon: updates.icon,
      color: updates.color,
    }).eq('id', id);

    if (error) throw error;
    await fetchData();
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('expense_categories').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const setBudget = async (categoryId: string, amount: number) => {
    if (!user) return;
    const existing = budgets.find(b => b.categoryId === categoryId);

    if (existing) {
      const { error } = await supabase.from('monthly_budgets').update({
        budget_amount: amount,
      }).eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('monthly_budgets').insert({
        user_id: user.id,
        category_id: categoryId,
        month,
        year,
        budget_amount: amount,
      });
      if (error) throw error;
    }
    await fetchData();
  };

  const addExpense = async (data: { categoryId: string | null; description: string; amount: number; expenseDate: string; isRecurring?: boolean; payPeriod?: number | null }) => {
    if (!user) return;
    const { error } = await supabase.from('expenses').insert({
      user_id: user.id,
      category_id: data.categoryId,
      description: data.description,
      amount: data.amount,
      expense_date: data.expenseDate,
      is_recurring: data.isRecurring || false,
      pay_period: data.payPeriod ?? null,
    });
    if (error) throw error;
    await fetchData();
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    const { error } = await supabase.from('expenses').update({
      category_id: updates.categoryId,
      description: updates.description,
      amount: updates.amount,
      expense_date: updates.expenseDate,
      is_recurring: updates.isRecurring,
      pay_period: updates.payPeriod,
    }).eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const updatePaySettings = async (payAmount: number, firstPayDate: string) => {
    if (!user) return;
    
    if (paySettings) {
      const { error } = await supabase.from('biweekly_pay_settings').update({
        pay_amount: payAmount,
        first_pay_date: firstPayDate,
      }).eq('id', paySettings.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('biweekly_pay_settings').insert({
        user_id: user.id,
        pay_amount: payAmount,
        first_pay_date: firstPayDate,
      });
      if (error) throw error;
    }
    await fetchData();
  };

  // Fixed Commitments CRUD
  const addFixedCommitment = async (data: { description: string; amount: number; payPeriod: number; category?: string; customLabel?: string }) => {
    if (!user) return;
    const { error } = await supabase.from('fixed_commitments').insert({
      user_id: user.id,
      description: data.description,
      amount: data.amount,
      pay_period: data.payPeriod,
      category: data.category || 'other',
      custom_label: data.customLabel || null,
    });
    if (error) throw error;
    await fetchData();
  };

  const updateFixedCommitment = async (id: string, updates: Partial<{ description: string; amount: number; payPeriod: number; category: string; customLabel: string }>) => {
    const updateData: any = {};
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.payPeriod !== undefined) updateData.pay_period = updates.payPeriod;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.customLabel !== undefined) updateData.custom_label = updates.customLabel;
    const { error } = await supabase.from('fixed_commitments').update(updateData).eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const deleteFixedCommitment = async (id: string) => {
    const { error } = await supabase.from('fixed_commitments').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  // Get fixed commitments by pay period
  const getFixedCommitmentsByPayPeriod = (payPeriod: 1 | 2) => {
    return fixedCommitments.filter(c => c.payPeriod === payPeriod || c.payPeriod === 0);
  };

  // Fixed commitment totals per pay period
  const getFixedCommitmentTotals = (payPeriod: 1 | 2) => {
    return getFixedCommitmentsByPayPeriod(payPeriod).reduce((sum, c) => sum + c.amount, 0);
  };

  const totalFixedCommitments = fixedCommitments.reduce((sum, c) => sum + c.amount, 0);

  return {
    categories,
    budgets,
    expenses,
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
    updateCategory,
    deleteCategory,
    setBudget,
    addExpense,
    updateExpense,
    deleteExpense,
    updatePaySettings,
    addFixedCommitment,
    updateFixedCommitment,
    deleteFixedCommitment,
    refresh: fetchData,
  };
};
