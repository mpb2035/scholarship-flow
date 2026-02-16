import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const DEFAULT_ORDER = [
  'pay_settings',
  'fixed_commitments',
  'monthly_scorecard',
  'savings_tracker',
  'net_worth_tracker',
  'biweekly_overview',
  'pay_period_tabs',
];

export const useSectionOrder = () => {
  const { user } = useAuth();
  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_ORDER);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('financial_section_order')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        // Ensure all sections are present (in case new ones were added)
        const saved = data.section_order as string[];
        const merged = [...saved, ...DEFAULT_ORDER.filter(s => !saved.includes(s))];
        setSectionOrder(merged);
      } else {
        setSectionOrder(DEFAULT_ORDER);
      }
    } catch {
      setSectionOrder(DEFAULT_ORDER);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const saveOrder = useCallback(async (newOrder: string[]) => {
    if (!user) return;
    setSectionOrder(newOrder);

    const { data } = await supabase
      .from('financial_section_order')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (data) {
      await supabase
        .from('financial_section_order')
        .update({ section_order: newOrder })
        .eq('id', data.id);
    } else {
      await supabase
        .from('financial_section_order')
        .insert({ user_id: user.id, section_order: newOrder });
    }
  }, [user]);

  const moveUp = (sectionId: string) => {
    const idx = sectionOrder.indexOf(sectionId);
    if (idx <= 0) return;
    const newOrder = [...sectionOrder];
    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    saveOrder(newOrder);
  };

  const moveDown = (sectionId: string) => {
    const idx = sectionOrder.indexOf(sectionId);
    if (idx < 0 || idx >= sectionOrder.length - 1) return;
    const newOrder = [...sectionOrder];
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    saveOrder(newOrder);
  };

  return { sectionOrder, loading, moveUp, moveDown };
};
