import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export function useNotes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
    } else {
      setNotes((data as any[]) || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const addNote = useCallback(async () => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('notes')
      .insert({ user_id: user.id, title: '', content: '', color: 'default', pinned: false } as any)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to create note.', variant: 'destructive' });
      return null;
    }
    const note = data as any as Note;
    setNotes(prev => [note, ...prev]);
    return note;
  }, [user, toast]);

  const updateNote = useCallback(async (id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'color' | 'pinned'>>) => {
    const { error } = await supabase
      .from('notes')
      .update(updates as any)
      .eq('id', id);

    if (error) {
      console.error('Error updating note:', error);
      return;
    }
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n));
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete note.', variant: 'destructive' });
      return;
    }
    setNotes(prev => prev.filter(n => n.id !== id));
  }, [toast]);

  return { notes, loading, addNote, updateNote, deleteNote, refreshNotes: fetchNotes };
}
