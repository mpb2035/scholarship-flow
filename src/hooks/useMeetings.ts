import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Meeting, MeetingInput } from '@/types/meeting';
import { toast } from 'sonner';

export function useMeetings() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMeetings();
    }
  }, [user]);

  const fetchMeetings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('user_id', user.id)
        .order('meeting_date', { ascending: true });

      if (error) throw error;
      setMeetings((data || []) as Meeting[]);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error('Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  const addMeeting = async (input: MeetingInput) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          user_id: user.id,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      setMeetings(prev => [...prev, data as Meeting].sort((a, b) => 
        new Date(a.meeting_date).getTime() - new Date(b.meeting_date).getTime()
      ));
      toast.success('Event added successfully');
      return data;
    } catch (error) {
      console.error('Error adding meeting:', error);
      toast.error('Failed to add event');
    }
  };

  const updateMeeting = async (id: string, input: Partial<MeetingInput>) => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setMeetings(prev => prev.map(m => m.id === id ? data as Meeting : m));
      toast.success('Event updated');
      return data;
    } catch (error) {
      console.error('Error updating meeting:', error);
      toast.error('Failed to update event');
    }
  };

  const deleteMeeting = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMeetings(prev => prev.filter(m => m.id !== id));
      toast.success('Event deleted');
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast.error('Failed to delete event');
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingMeetings = meetings.filter(m => 
    new Date(m.meeting_date) >= today && m.status !== 'cancelled'
  );

  const pastMeetings = meetings.filter(m => 
    new Date(m.meeting_date) < today || m.status === 'completed'
  );

  return {
    meetings,
    upcomingMeetings,
    pastMeetings,
    loading,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    refetch: fetchMeetings,
  };
}
