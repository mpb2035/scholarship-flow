import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useCustomDropdownOptions(fieldName: string) {
  const { user } = useAuth();
  const [options, setOptions] = useState<string[]>([]);

  const fetchOptions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('custom_dropdown_options')
      .select('option_value')
      .eq('user_id', user.id)
      .eq('field_name', fieldName)
      .order('created_at', { ascending: true });

    setOptions((data || []).map(d => d.option_value));
  }, [user, fieldName]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const addOption = useCallback(async (value: string) => {
    if (!user) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    const { error } = await supabase
      .from('custom_dropdown_options')
      .insert({ user_id: user.id, field_name: fieldName, option_value: trimmed });

    if (!error) {
      setOptions(prev => [...prev, trimmed]);
    }
    return error;
  }, [user, fieldName]);

  const removeOption = useCallback(async (value: string) => {
    if (!user) return;
    await supabase
      .from('custom_dropdown_options')
      .delete()
      .eq('user_id', user.id)
      .eq('field_name', fieldName)
      .eq('option_value', value);

    setOptions(prev => prev.filter(o => o !== value));
  }, [user, fieldName]);

  return { options, addOption, removeOption, refreshOptions: fetchOptions };
}
