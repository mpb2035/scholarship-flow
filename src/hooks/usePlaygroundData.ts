import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BentoIndicator, initialIndicators, initialDashboardTitle } from '@/data/playgroundData';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

interface PlaygroundData {
  id?: string;
  title: string;
  indicators: BentoIndicator[];
}

export function usePlaygroundData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [localData, setLocalData] = useState<PlaygroundData>({
    title: initialDashboardTitle,
    indicators: initialIndicators,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch saved data from database
  const { data: savedData, isLoading, refetch } = useQuery({
    queryKey: ['playground-scorecards', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('playground_scorecards')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching playground data:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user,
  });

  // Initialize local data from saved data
  useEffect(() => {
    if (savedData) {
      const indicators = Array.isArray(savedData.indicators) 
        ? (savedData.indicators as unknown as BentoIndicator[])
        : initialIndicators;
      
      setLocalData({
        id: savedData.id,
        title: savedData.dashboard_title,
        indicators,
      });
      setHasUnsavedChanges(false);
    }
  }, [savedData]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: PlaygroundData) => {
      if (!user) throw new Error('Not authenticated');

      const indicatorsJson = data.indicators as unknown as Json;

      if (data.id) {
        // Update existing record
        const { error } = await supabase
          .from('playground_scorecards')
          .update({
            dashboard_title: data.title,
            indicators: indicatorsJson,
          })
          .eq('id', data.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Insert new record
        const { data: newData, error } = await supabase
          .from('playground_scorecards')
          .insert({
            user_id: user.id,
            dashboard_title: data.title,
            indicators: indicatorsJson,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        setLocalData(prev => ({ ...prev, id: newData.id }));
      }
    },
    onSuccess: () => {
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ['playground-scorecards'] });
      toast({
        title: 'Saved!',
        description: 'Your playground data has been saved.',
      });
    },
    onError: (error) => {
      console.error('Error saving playground data:', error);
      toast({
        title: 'Error',
        description: 'Failed to save data. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateTitle = (title: string) => {
    setLocalData(prev => ({ ...prev, title }));
    setHasUnsavedChanges(true);
  };

  const updateIndicators = (indicators: BentoIndicator[]) => {
    setLocalData(prev => ({ ...prev, indicators }));
    setHasUnsavedChanges(true);
  };

  const save = () => {
    saveMutation.mutate(localData);
  };

  const reset = () => {
    setLocalData({
      id: localData.id,
      title: initialDashboardTitle,
      indicators: initialIndicators,
    });
    setHasUnsavedChanges(true);
  };

  return {
    title: localData.title,
    indicators: localData.indicators,
    isLoading,
    isSaving: saveMutation.isPending,
    hasUnsavedChanges,
    isAuthenticated: !!user,
    updateTitle,
    updateIndicators,
    save,
    reset,
    refetch,
  };
}
