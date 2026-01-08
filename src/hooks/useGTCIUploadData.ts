import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BentoIndicator, NationalStats } from '@/data/playgroundData';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

interface GTCIUploadData {
  id?: string;
  title: string;
  indicators: BentoIndicator[];
  nationalStats: NationalStats;
}

const defaultNationalStats: NationalStats = {
  rank_2023: 0,
  rank_2025: 0,
  score_2023: 0,
  score_2025: 0,
  rank_change: 0,
  score_change: 0
};

const initialTitle = "GTCI Upload Workspace";

export function useGTCIUploadData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [localData, setLocalData] = useState<GTCIUploadData>({
    title: initialTitle,
    indicators: [],
    nationalStats: defaultNationalStats,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch saved data from database using the same playground_scorecards table
  // but with a different identifier in the title
  const { data: savedData, isLoading, refetch } = useQuery({
    queryKey: ['gtci-upload-scorecards', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('playground_scorecards')
        .select('*')
        .eq('user_id', user.id)
        .like('dashboard_title', 'GTCI Upload%')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching GTCI upload data:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user,
  });

  // Initialize local data from saved data
  useEffect(() => {
    if (savedData) {
      const rawIndicators = savedData.indicators as unknown;
      
      // Handle both formats: { indicators, nationalStats } or just array
      let indicators: BentoIndicator[] = [];
      let nationalStats: NationalStats = defaultNationalStats;
      
      if (rawIndicators && typeof rawIndicators === 'object') {
        if (Array.isArray(rawIndicators)) {
          indicators = rawIndicators as BentoIndicator[];
        } else if ('indicators' in rawIndicators) {
          const parsed = rawIndicators as { indicators: BentoIndicator[]; nationalStats?: NationalStats };
          indicators = parsed.indicators || [];
          nationalStats = parsed.nationalStats || defaultNationalStats;
        }
      }
      
      setLocalData({
        id: savedData.id,
        title: savedData.dashboard_title,
        indicators,
        nationalStats,
      });
      setHasUnsavedChanges(false);
    }
  }, [savedData]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: GTCIUploadData) => {
      if (!user) throw new Error('Not authenticated');

      // Store both indicators and nationalStats in the indicators JSON field
      const indicatorsJson = {
        indicators: data.indicators,
        nationalStats: data.nationalStats
      } as unknown as Json;

      if (data.id) {
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
        const { data: newData, error } = await supabase
          .from('playground_scorecards')
          .insert({
            user_id: user.id,
            dashboard_title: data.title.startsWith('GTCI Upload') ? data.title : `GTCI Upload - ${data.title}`,
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
      queryClient.invalidateQueries({ queryKey: ['gtci-upload-scorecards'] });
      toast({
        title: 'Saved!',
        description: 'Your GTCI data has been saved.',
      });
    },
    onError: (error) => {
      console.error('Error saving GTCI upload data:', error);
      toast({
        title: 'Error',
        description: 'Failed to save data. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateTitle = (title: string) => {
    const newData = { ...localData, title };
    setLocalData(newData);
    setHasUnsavedChanges(true);
  };

  const updateIndicators = (indicators: BentoIndicator[]) => {
    const newData = { ...localData, indicators };
    setLocalData(newData);
    setHasUnsavedChanges(true);
  };

  const updateNationalStats = (nationalStats: NationalStats) => {
    const newData = { ...localData, nationalStats };
    setLocalData(newData);
    setHasUnsavedChanges(true);
  };

  const save = () => {
    saveMutation.mutate(localData);
  };

  const reset = () => {
    setLocalData({
      id: localData.id,
      title: initialTitle,
      indicators: [],
      nationalStats: defaultNationalStats,
    });
    setHasUnsavedChanges(true);
  };

  return {
    title: localData.title,
    indicators: localData.indicators,
    nationalStats: localData.nationalStats,
    isLoading,
    isSaving: saveMutation.isPending,
    hasUnsavedChanges,
    isAuthenticated: !!user,
    updateTitle,
    updateIndicators,
    updateNationalStats,
    save,
    reset,
    refetch,
  };
}
