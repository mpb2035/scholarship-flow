import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsContribution {
  id: string;
  userId: string;
  goalId: string;
  amount: number;
  payPeriod: number;
  month: number;
  year: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const useSavingsTracker = (month: number, year: number) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [contributions, setContributions] = useState<SavingsContribution[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [goalsRes, contribRes] = await Promise.all([
        supabase.from('savings_goals').select('*').eq('user_id', user.id).eq('is_active', true),
        supabase.from('savings_contributions').select('*').eq('user_id', user.id),
      ]);

      if (goalsRes.data) {
        setGoals(goalsRes.data.map((g: any) => ({
          id: g.id, userId: g.user_id, name: g.name,
          targetAmount: g.target_amount ? Number(g.target_amount) : null,
          isActive: g.is_active, createdAt: g.created_at, updatedAt: g.updated_at,
        })));
      }
      if (contribRes.data) {
        setContributions(contribRes.data.map((c: any) => ({
          id: c.id, userId: c.user_id, goalId: c.goal_id,
          amount: Number(c.amount), payPeriod: c.pay_period,
          month: c.month, year: c.year, notes: c.notes,
          createdAt: c.created_at, updatedAt: c.updated_at,
        })));
      }
    } catch (error) {
      console.error('Error fetching savings data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // All-time total per goal
  const getGoalTotal = (goalId: string) =>
    contributions.filter(c => c.goalId === goalId).reduce((sum, c) => sum + c.amount, 0);

  // Current month contributions per goal
  const getGoalMonthContributions = (goalId: string) =>
    contributions.filter(c => c.goalId === goalId && c.month === month && c.year === year);

  const getGoalMonthTotal = (goalId: string) =>
    getGoalMonthContributions(goalId).reduce((sum, c) => sum + c.amount, 0);

  // Grand totals
  const grandTotal = useMemo(() =>
    contributions.reduce((sum, c) => sum + c.amount, 0), [contributions]);

  const monthTotal = useMemo(() =>
    contributions.filter(c => c.month === month && c.year === year).reduce((sum, c) => sum + c.amount, 0),
    [contributions, month, year]);

  // CRUD
  const addGoal = async (name: string, targetAmount?: number) => {
    if (!user) return;
    const { error } = await supabase.from('savings_goals').insert({
      user_id: user.id, name, target_amount: targetAmount ?? null,
    });
    if (error) throw error;
    await fetchData();
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase.from('savings_goals').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const addContribution = async (data: { goalId: string; amount: number; payPeriod: number; notes?: string }) => {
    if (!user) return;
    const { error } = await supabase.from('savings_contributions').insert({
      user_id: user.id, goal_id: data.goalId, amount: data.amount,
      pay_period: data.payPeriod, month, year, notes: data.notes || null,
    });
    if (error) throw error;
    await fetchData();
  };

  const deleteContribution = async (id: string) => {
    const { error } = await supabase.from('savings_contributions').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const updateContribution = async (id: string, amount: number) => {
    const { error } = await supabase.from('savings_contributions').update({ amount }).eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  return {
    goals, contributions, loading,
    grandTotal, monthTotal,
    getGoalTotal, getGoalMonthTotal, getGoalMonthContributions,
    addGoal, deleteGoal, addContribution, deleteContribution, updateContribution,
    refresh: fetchData,
  };
};
