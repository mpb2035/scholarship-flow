import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface NetWorthEntry {
  id: string;
  userId: string;
  entryType: 'asset' | 'loan' | 'saving';
  label: string;
  amount: number;
  loggedAt: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const useNetWorthTracker = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<NetWorthEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('net_worth_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false });

      if (data && !error) {
        setEntries(data.map((e: any) => ({
          id: e.id,
          userId: e.user_id,
          entryType: e.entry_type,
          label: e.label,
          amount: Number(e.amount),
          loggedAt: e.logged_at,
          notes: e.notes,
          createdAt: e.created_at,
          updatedAt: e.updated_at,
        })));
      }
    } catch (error) {
      console.error('Error fetching net worth data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totals = useMemo(() => {
    // Get latest entry per label+type combo
    const latestByKey = new Map<string, NetWorthEntry>();
    for (const e of entries) {
      const key = `${e.entryType}:${e.label}`;
      const existing = latestByKey.get(key);
      if (!existing || e.loggedAt > existing.loggedAt || (e.loggedAt === existing.loggedAt && e.createdAt > existing.createdAt)) {
        latestByKey.set(key, e);
      }
    }
    
    let assets = 0, loans = 0, savings = 0;
    latestByKey.forEach(e => {
      if (e.entryType === 'asset') assets += e.amount;
      else if (e.entryType === 'loan') loans += e.amount;
      else if (e.entryType === 'saving') savings += e.amount;
    });
    return { assets, loans, savings, netWorth: assets + savings - loans };
  }, [entries]);

  const getEntriesByType = (type: 'asset' | 'loan' | 'saving') =>
    entries.filter(e => e.entryType === type);

  const addEntry = async (data: { entryType: 'asset' | 'loan' | 'saving'; label: string; amount: number; notes?: string }) => {
    if (!user) return;
    const { error } = await supabase.from('net_worth_entries').insert({
      user_id: user.id,
      entry_type: data.entryType,
      label: data.label,
      amount: data.amount,
      notes: data.notes || null,
    });
    if (error) throw error;
    await fetchData();
  };

  const updateEntry = async (id: string, amount: number) => {
    const { error } = await supabase.from('net_worth_entries').update({ amount }).eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from('net_worth_entries').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  return {
    entries, loading, totals,
    getEntriesByType,
    addEntry, updateEntry, deleteEntry,
    refresh: fetchData,
  };
};
