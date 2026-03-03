import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  source: string;
  is_pinned: boolean;
  is_done: boolean;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReminderInput {
  title: string;
  description?: string;
  source?: string;
  is_pinned?: boolean;
  due_date?: string;
}

export function useReminders() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchReminders();
  }, [user]);

  const fetchReminders = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      setReminders((data || []) as Reminder[]);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReminder = async (input: ReminderInput) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert({ user_id: user.id, ...input })
        .select()
        .single();
      if (error) throw error;
      setReminders(prev => [data as Reminder, ...prev]);
      toast.success('Reminder added');
      return data;
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast.error('Failed to add reminder');
    }
  };

  const updateReminder = async (id: string, input: Partial<ReminderInput & { is_done: boolean; is_pinned: boolean }>) => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      setReminders(prev => prev.map(r => r.id === id ? data as Reminder : r));
      return data;
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast.error('Failed to update reminder');
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const { error } = await supabase.from('reminders').delete().eq('id', id);
      if (error) throw error;
      setReminders(prev => prev.filter(r => r.id !== id));
      toast.success('Reminder deleted');
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Failed to delete reminder');
    }
  };

  const activeReminders = reminders.filter(r => !r.is_done);
  const completedReminders = reminders.filter(r => r.is_done);

  return { reminders, activeReminders, completedReminders, loading, addReminder, updateReminder, deleteReminder, refetch: fetchReminders };
}
