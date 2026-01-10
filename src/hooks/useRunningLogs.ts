import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface RunningLog {
  id: string;
  user_id: string;
  date: string;
  distance: number;
  duration_minutes: number;
  pace_per_km: number | null;
  environment: 'indoor' | 'outdoor';
  run_type: 'easy_run' | 'tempo' | 'fartlek' | 'interval' | 'long_run' | 'race';
  notes: string | null;
  is_planned: boolean;
  created_at: string;
  updated_at: string;
}

export interface RunningLogInput {
  date: string;
  distance: number;
  duration_minutes: number;
  pace_per_km?: number | null;
  environment: 'indoor' | 'outdoor';
  run_type: 'easy_run' | 'tempo' | 'fartlek' | 'interval' | 'long_run' | 'race';
  notes?: string;
  is_planned?: boolean;
}

export function useRunningLogs() {
  const [logs, setLogs] = useState<RunningLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchLogs();
    } else {
      setLogs([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchLogs = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('running_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Type assertion to handle the database response
      const typedData = (data || []).map(log => ({
        ...log,
        distance: Number(log.distance),
        pace_per_km: log.pace_per_km ? Number(log.pace_per_km) : null,
        environment: log.environment as 'indoor' | 'outdoor',
        run_type: log.run_type as 'easy_run' | 'tempo' | 'fartlek' | 'interval' | 'long_run' | 'race',
      }));
      
      setLogs(typedData);
    } catch (error) {
      console.error('Error fetching running logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load running logs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addLog = async (input: RunningLogInput) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to save your running logs',
        variant: 'destructive',
      });
      return null;
    }

    try {
      // Calculate pace if not provided
      const pace = input.pace_per_km || (input.duration_minutes / input.distance);

      const { data, error } = await supabase
        .from('running_logs')
        .insert({
          user_id: user.id,
          date: input.date,
          distance: input.distance,
          duration_minutes: input.duration_minutes,
          pace_per_km: pace,
          environment: input.environment,
          run_type: input.run_type,
          notes: input.notes || null,
          is_planned: input.is_planned || false,
        })
        .select()
        .single();

      if (error) throw error;

      const typedData = {
        ...data,
        distance: Number(data.distance),
        pace_per_km: data.pace_per_km ? Number(data.pace_per_km) : null,
        environment: data.environment as 'indoor' | 'outdoor',
        run_type: data.run_type as 'easy_run' | 'tempo' | 'fartlek' | 'interval' | 'long_run' | 'race',
      };

      setLogs(prev => [typedData, ...prev]);
      
      toast({
        title: 'Success',
        description: 'Running log saved successfully',
      });

      return typedData;
    } catch (error) {
      console.error('Error adding running log:', error);
      toast({
        title: 'Error',
        description: 'Failed to save running log',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateLog = async (id: string, input: Partial<RunningLogInput>) => {
    if (!user) return null;

    try {
      const updateData: Record<string, unknown> = { ...input };
      
      if (input.distance && input.duration_minutes) {
        updateData.pace_per_km = input.duration_minutes / input.distance;
      }

      const { data, error } = await supabase
        .from('running_logs')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const typedData = {
        ...data,
        distance: Number(data.distance),
        pace_per_km: data.pace_per_km ? Number(data.pace_per_km) : null,
        environment: data.environment as 'indoor' | 'outdoor',
        run_type: data.run_type as 'easy_run' | 'tempo' | 'fartlek' | 'interval' | 'long_run' | 'race',
      };

      setLogs(prev => prev.map(log => log.id === id ? typedData : log));
      
      toast({
        title: 'Success',
        description: 'Running log updated successfully',
      });

      return typedData;
    } catch (error) {
      console.error('Error updating running log:', error);
      toast({
        title: 'Error',
        description: 'Failed to update running log',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteLog = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('running_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setLogs(prev => prev.filter(log => log.id !== id));
      
      toast({
        title: 'Success',
        description: 'Running log deleted successfully',
      });

      return true;
    } catch (error) {
      console.error('Error deleting running log:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete running log',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Computed stats
  const totalDistance = logs.reduce((acc, log) => acc + log.distance, 0);
  const totalRuns = logs.length;
  const averagePace = logs.length > 0 
    ? logs.reduce((acc, log) => acc + (log.pace_per_km || 0), 0) / logs.length 
    : 0;
  const longestRun = logs.length > 0 
    ? Math.max(...logs.map(log => log.distance)) 
    : 0;

  return {
    logs,
    isLoading,
    addLog,
    updateLog,
    deleteLog,
    refetch: fetchLogs,
    stats: {
      totalDistance,
      totalRuns,
      averagePace,
      longestRun,
    },
  };
}
