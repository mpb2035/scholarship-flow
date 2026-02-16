import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { FixedCommitment } from '@/types/finance';

export interface CommitmentTrackingItem {
  id: string;
  userId: string;
  commitmentId: string;
  month: number;
  year: number;
  isPaid: boolean;
  actualAmount: number | null;
  notes: string | null;
  paidDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export const useCommitmentTracking = (month: number, year: number, fixedCommitments: FixedCommitment[]) => {
  const { user } = useAuth();
  const [tracking, setTracking] = useState<CommitmentTrackingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTracking = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('monthly_commitment_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year);

      if (error) throw error;
      setTracking((data || []).map((t: any) => ({
        id: t.id,
        userId: t.user_id,
        commitmentId: t.commitment_id,
        month: t.month,
        year: t.year,
        isPaid: t.is_paid,
        actualAmount: t.actual_amount ? Number(t.actual_amount) : null,
        notes: t.notes,
        paidDate: t.paid_date,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      })));
    } catch (error) {
      console.error('Error fetching commitment tracking:', error);
    } finally {
      setLoading(false);
    }
  }, [user, month, year]);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  const getTrackingForCommitment = (commitmentId: string) => {
    return tracking.find(t => t.commitmentId === commitmentId) || null;
  };

  const togglePaid = async (commitmentId: string, isPaid: boolean, actualAmount?: number) => {
    if (!user) return;
    const existing = getTrackingForCommitment(commitmentId);

    if (existing) {
      const { error } = await supabase
        .from('monthly_commitment_tracking')
        .update({
          is_paid: isPaid,
          actual_amount: actualAmount ?? existing.actualAmount,
          paid_date: isPaid ? new Date().toISOString().split('T')[0] : null,
        })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('monthly_commitment_tracking')
        .insert({
          user_id: user.id,
          commitment_id: commitmentId,
          month,
          year,
          is_paid: isPaid,
          actual_amount: actualAmount ?? null,
          paid_date: isPaid ? new Date().toISOString().split('T')[0] : null,
        });
      if (error) throw error;
    }
    await fetchTracking();
  };

  const updateActualAmount = async (commitmentId: string, amount: number) => {
    if (!user) return;
    const existing = getTrackingForCommitment(commitmentId);

    if (existing) {
      const { error } = await supabase
        .from('monthly_commitment_tracking')
        .update({ actual_amount: amount })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('monthly_commitment_tracking')
        .insert({
          user_id: user.id,
          commitment_id: commitmentId,
          month,
          year,
          is_paid: false,
          actual_amount: amount,
        });
      if (error) throw error;
    }
    await fetchTracking();
  };

  // Summary stats
  const totalCommitments = fixedCommitments.length;
  const paidCount = fixedCommitments.filter(c => getTrackingForCommitment(c.id)?.isPaid).length;
  const totalExpected = fixedCommitments.reduce((sum, c) => sum + c.amount, 0);
  const totalActual = fixedCommitments.reduce((sum, c) => {
    const t = getTrackingForCommitment(c.id);
    return sum + (t?.actualAmount ?? 0);
  }, 0);

  return {
    tracking,
    loading,
    getTrackingForCommitment,
    togglePaid,
    updateActualAmount,
    paidCount,
    totalCommitments,
    totalExpected,
    totalActual,
    refresh: fetchTracking,
  };
};
