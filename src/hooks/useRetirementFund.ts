import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface RetirementFund {
  id: string;
  userId: string;
  fundName: string;
  biweeklyContribution: number;
  startDate: string;
  targetAmount: number | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RetirementContribution {
  id: string;
  userId: string;
  fundId: string;
  amount: number;
  payPeriod: number;
  month: number;
  year: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const useRetirementFund = (month: number, year: number) => {
  const { user } = useAuth();
  const [funds, setFunds] = useState<RetirementFund[]>([]);
  const [contributions, setContributions] = useState<RetirementContribution[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [fundsRes, contribRes] = await Promise.all([
        supabase.from('retirement_fund').select('*').eq('user_id', user.id).eq('is_active', true),
        supabase.from('retirement_contributions').select('*').eq('user_id', user.id),
      ]);

      if (fundsRes.data) {
        setFunds(fundsRes.data.map((f: any) => ({
          id: f.id, userId: f.user_id, fundName: f.fund_name,
          biweeklyContribution: Number(f.biweekly_contribution),
          startDate: f.start_date,
          targetAmount: f.target_amount ? Number(f.target_amount) : null,
          isActive: f.is_active, notes: f.notes,
          createdAt: f.created_at, updatedAt: f.updated_at,
        })));
      }
      if (contribRes.data) {
        setContributions(contribRes.data.map((c: any) => ({
          id: c.id, userId: c.user_id, fundId: c.fund_id,
          amount: Number(c.amount), payPeriod: c.pay_period,
          month: c.month, year: c.year, notes: c.notes,
          createdAt: c.created_at, updatedAt: c.updated_at,
        })));
      }
    } catch (error) {
      console.error('Error fetching retirement data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getFundTotal = (fundId: string) =>
    contributions.filter(c => c.fundId === fundId).reduce((sum, c) => sum + c.amount, 0);

  const getFundMonthContributions = (fundId: string) =>
    contributions.filter(c => c.fundId === fundId && c.month === month && c.year === year);

  const getFundMonthTotal = (fundId: string) =>
    getFundMonthContributions(fundId).reduce((sum, c) => sum + c.amount, 0);

  const grandTotal = useMemo(() =>
    contributions.reduce((sum, c) => sum + c.amount, 0), [contributions]);

  const monthTotal = useMemo(() =>
    contributions.filter(c => c.month === month && c.year === year).reduce((sum, c) => sum + c.amount, 0),
    [contributions, month, year]);

  const addFund = async (name: string, biweeklyAmount: number, targetAmount?: number) => {
    if (!user) return;
    const { error } = await supabase.from('retirement_fund').insert({
      user_id: user.id, fund_name: name,
      biweekly_contribution: biweeklyAmount,
      target_amount: targetAmount ?? null,
    });
    if (error) throw error;
    await fetchData();
  };

  const updateFund = async (id: string, updates: { biweeklyContribution?: number; targetAmount?: number; fundName?: string }) => {
    const updateData: any = {};
    if (updates.biweeklyContribution !== undefined) updateData.biweekly_contribution = updates.biweeklyContribution;
    if (updates.targetAmount !== undefined) updateData.target_amount = updates.targetAmount;
    if (updates.fundName !== undefined) updateData.fund_name = updates.fundName;
    const { error } = await supabase.from('retirement_fund').update(updateData).eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const deleteFund = async (id: string) => {
    const { error } = await supabase.from('retirement_fund').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const addContribution = async (data: { fundId: string; amount: number; payPeriod: number; notes?: string }) => {
    if (!user) return;
    const { error } = await supabase.from('retirement_contributions').insert({
      user_id: user.id, fund_id: data.fundId, amount: data.amount,
      pay_period: data.payPeriod, month, year, notes: data.notes || null,
    });
    if (error) throw error;
    await fetchData();
  };

  const updateContribution = async (id: string, amount: number) => {
    const { error } = await supabase.from('retirement_contributions').update({ amount }).eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const deleteContribution = async (id: string) => {
    const { error } = await supabase.from('retirement_contributions').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  return {
    funds, contributions, loading,
    grandTotal, monthTotal,
    getFundTotal, getFundMonthTotal, getFundMonthContributions,
    addFund, updateFund, deleteFund,
    addContribution, updateContribution, deleteContribution,
    refresh: fetchData,
  };
};
