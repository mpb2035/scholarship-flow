import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Leave, LeaveBalance, LeaveInput, LeaveBalanceInput } from '@/types/leave';
import { toast } from 'sonner';

export function useLeaves() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (user) {
      fetchLeaves();
      fetchBalance();
    }
  }, [user]);

  const fetchLeaves = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('leaves')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setLeaves((data || []) as Leave[]);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('user_id', user.id)
        .eq('year', currentYear)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setBalance(data as LeaveBalance);
      } else {
        // Create default balance for current year
        const { data: newBalance, error: insertError } = await supabase
          .from('leave_balances')
          .insert({
            user_id: user.id,
            year: currentYear,
            annual_entitlement: 20,
            sick_entitlement: 14,
            other_entitlement: 5,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setBalance(newBalance as LeaveBalance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const addLeave = async (input: LeaveInput) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('leaves')
        .insert({
          user_id: user.id,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      setLeaves(prev => [data as Leave, ...prev]);
      toast.success('Leave logged successfully');
      return data;
    } catch (error) {
      console.error('Error adding leave:', error);
      toast.error('Failed to add leave');
    }
  };

  const updateLeave = async (id: string, input: Partial<LeaveInput>) => {
    try {
      const { data, error } = await supabase
        .from('leaves')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setLeaves(prev => prev.map(l => l.id === id ? data as Leave : l));
      toast.success('Leave updated');
      return data;
    } catch (error) {
      console.error('Error updating leave:', error);
      toast.error('Failed to update leave');
    }
  };

  const deleteLeave = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leaves')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setLeaves(prev => prev.filter(l => l.id !== id));
      toast.success('Leave deleted');
    } catch (error) {
      console.error('Error deleting leave:', error);
      toast.error('Failed to delete leave');
    }
  };

  const updateBalance = async (input: Partial<LeaveBalanceInput>) => {
    if (!user || !balance) return;

    try {
      const { data, error } = await supabase
        .from('leave_balances')
        .update(input)
        .eq('id', balance.id)
        .select()
        .single();

      if (error) throw error;
      setBalance(data as LeaveBalance);
      toast.success('Balance updated');
    } catch (error) {
      console.error('Error updating balance:', error);
      toast.error('Failed to update balance');
    }
  };

  // Calculate used days by type for current year
  const getUsedDays = (type: 'annual' | 'sick' | 'other') => {
    return leaves
      .filter(l => 
        l.leave_type === type && 
        l.status === 'approved' &&
        new Date(l.start_date).getFullYear() === currentYear
      )
      .reduce((sum, l) => sum + l.days_used, 0);
  };

  const getRemainingDays = (type: 'annual' | 'sick' | 'other') => {
    if (!balance) return 0;
    const entitlement = type === 'annual' 
      ? balance.annual_entitlement 
      : type === 'sick' 
        ? balance.sick_entitlement 
        : balance.other_entitlement;
    return entitlement - getUsedDays(type);
  };

  // Get next upcoming leave
  const getNextLeave = () => {
    const today = new Date();
    return leaves
      .filter(l => new Date(l.start_date) > today && l.status === 'approved')
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0];
  };

  // Get days until next leave
  const getDaysUntilNextLeave = () => {
    const nextLeave = getNextLeave();
    if (!nextLeave) return null;
    const today = new Date();
    const nextDate = new Date(nextLeave.start_date);
    return Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return {
    leaves,
    balance,
    loading,
    addLeave,
    updateLeave,
    deleteLeave,
    updateBalance,
    getUsedDays,
    getRemainingDays,
    getNextLeave,
    getDaysUntilNextLeave,
    refetch: fetchLeaves,
  };
}
