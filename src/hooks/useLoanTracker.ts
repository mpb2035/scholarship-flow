import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { differenceInDays, parseISO } from 'date-fns';

export interface Loan {
  id: string;
  userId: string;
  loanType: string;
  label: string;
  initialAmount: number;
  currentBalance: number;
  biweeklyRepayment: number;
  startDate: string;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoanWithProjection extends Loan {
  projectedBalance: number;
  periodsElapsed: number;
  totalRepaid: number;
  payoffDate: Date | null;
  periodsRemaining: number;
}

const LOAN_TYPES = [
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'car_loan_1', label: 'Car Loan 1' },
  { value: 'car_loan_2', label: 'Car Loan 2' },
  { value: 'home_loan', label: 'Home Loan' },
  { value: 'education_loan', label: 'Education Loan' },
  { value: 'custom', label: 'Custom' },
] as const;

export { LOAN_TYPES };

export const useLoanTracker = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('loan_tracker')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (data && !error) {
        setLoans(data.map((l: any) => ({
          id: l.id,
          userId: l.user_id,
          loanType: l.loan_type,
          label: l.label,
          initialAmount: Number(l.initial_amount),
          currentBalance: Number(l.current_balance),
          biweeklyRepayment: Number(l.biweekly_repayment),
          startDate: l.start_date,
          isActive: l.is_active,
          notes: l.notes,
          createdAt: l.created_at,
          updatedAt: l.updated_at,
        })));
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getProjection = (loan: Loan): LoanWithProjection => {
    const now = new Date();
    const start = parseISO(loan.startDate);
    const daysSinceStart = Math.max(0, differenceInDays(now, start));
    const periodsElapsed = Math.floor(daysSinceStart / 14);
    const totalRepaid = periodsElapsed * loan.biweeklyRepayment;
    const projectedBalance = Math.max(0, loan.currentBalance - totalRepaid);

    let payoffDate: Date | null = null;
    let periodsRemaining = 0;
    if (loan.biweeklyRepayment > 0) {
      periodsRemaining = Math.ceil(projectedBalance / loan.biweeklyRepayment);
      payoffDate = new Date(now.getTime() + periodsRemaining * 14 * 24 * 60 * 60 * 1000);
    }

    return {
      ...loan,
      projectedBalance,
      periodsElapsed,
      totalRepaid: Math.min(totalRepaid, loan.currentBalance),
      payoffDate,
      periodsRemaining,
    };
  };

  const loansWithProjections = loans.filter(l => l.isActive).map(getProjection);
  const totalDebt = loansWithProjections.reduce((sum, l) => sum + l.projectedBalance, 0);
  const totalMonthlyRepayment = loansWithProjections.reduce((sum, l) => sum + l.biweeklyRepayment * 2, 0);

  const addLoan = async (data: {
    loanType: string;
    label: string;
    currentBalance: number;
    biweeklyRepayment: number;
    startDate?: string;
    notes?: string;
  }) => {
    if (!user) return;
    const { error } = await supabase.from('loan_tracker').insert({
      user_id: user.id,
      loan_type: data.loanType,
      label: data.label,
      initial_amount: data.currentBalance,
      current_balance: data.currentBalance,
      biweekly_repayment: data.biweeklyRepayment,
      start_date: data.startDate || new Date().toISOString().split('T')[0],
      notes: data.notes || null,
    });
    if (error) throw error;
    await fetchData();
  };

  const updateLoan = async (id: string, updates: {
    currentBalance?: number;
    biweeklyRepayment?: number;
    label?: string;
    startDate?: string;
  }) => {
    const updateData: any = {};
    if (updates.currentBalance !== undefined) updateData.current_balance = updates.currentBalance;
    if (updates.biweeklyRepayment !== undefined) updateData.biweekly_repayment = updates.biweeklyRepayment;
    if (updates.label !== undefined) updateData.label = updates.label;
    if (updates.startDate !== undefined) updateData.start_date = updates.startDate;

    const { error } = await supabase.from('loan_tracker').update(updateData).eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const deleteLoan = async (id: string) => {
    const { error } = await supabase.from('loan_tracker').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  return {
    loans, loansWithProjections, loading,
    totalDebt, totalMonthlyRepayment,
    addLoan, updateLoan, deleteLoan,
    refresh: fetchData,
  };
};
