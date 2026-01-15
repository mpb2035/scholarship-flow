import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { defaultGTCIStrategicAnalysis } from '@/data/gtciStrategicAnalysisData';
import type { GTCIStrategicAnalysis } from '@/types/gtciAnalysis';
import type { Json } from '@/integrations/supabase/types';

export function useGTCIStrategicAnalysis() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [localData, setLocalData] = useState<GTCIStrategicAnalysis>(defaultGTCIStrategicAnalysis);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch existing data
  const { data: savedData, isLoading, refetch } = useQuery({
    queryKey: ['gtci-strategic-analysis', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('gtci_strategic_analysis')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Load saved data into local state
  useEffect(() => {
    if (savedData) {
      setLocalData({
        id: savedData.id,
        user_id: savedData.user_id,
        document_title: savedData.document_title,
        executive_summary: savedData.executive_summary as unknown as GTCIStrategicAnalysis['executive_summary'],
        pillar_performance: savedData.pillar_performance as unknown as GTCIStrategicAnalysis['pillar_performance'],
        data_gap_indicators: savedData.data_gap_indicators as unknown as GTCIStrategicAnalysis['data_gap_indicators'],
        wef_participation_steps: savedData.wef_participation_steps as unknown as GTCIStrategicAnalysis['wef_participation_steps'],
        ministry_governance: savedData.ministry_governance as unknown as GTCIStrategicAnalysis['ministry_governance'],
        funding_model: savedData.funding_model as unknown as GTCIStrategicAnalysis['funding_model'],
        indicator_analysis: savedData.indicator_analysis as unknown as GTCIStrategicAnalysis['indicator_analysis'],
        implementation_roadmap: savedData.implementation_roadmap as unknown as GTCIStrategicAnalysis['implementation_roadmap'],
        expected_outcomes: savedData.expected_outcomes as unknown as GTCIStrategicAnalysis['expected_outcomes'],
        metadata: savedData.metadata as unknown as GTCIStrategicAnalysis['metadata'],
        created_at: savedData.created_at,
        updated_at: savedData.updated_at
      });
      setHasUnsavedChanges(false);
    }
  }, [savedData]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: GTCIStrategicAnalysis) => {
      if (!user?.id) throw new Error('User not authenticated');

      const dbData = {
        user_id: user.id,
        document_title: data.document_title,
        executive_summary: data.executive_summary as unknown as Json,
        pillar_performance: data.pillar_performance as unknown as Json,
        data_gap_indicators: data.data_gap_indicators as unknown as Json,
        wef_participation_steps: data.wef_participation_steps as unknown as Json,
        ministry_governance: data.ministry_governance as unknown as Json,
        funding_model: data.funding_model as unknown as Json,
        indicator_analysis: data.indicator_analysis as unknown as Json,
        implementation_roadmap: data.implementation_roadmap as unknown as Json,
        expected_outcomes: data.expected_outcomes as unknown as Json,
        metadata: data.metadata as unknown as Json
      };

      if (data.id) {
        const { data: updated, error } = await supabase
          .from('gtci_strategic_analysis')
          .update(dbData)
          .eq('id', data.id)
          .select()
          .single();
        
        if (error) throw error;
        return updated;
      } else {
        const { data: inserted, error } = await supabase
          .from('gtci_strategic_analysis')
          .insert(dbData)
          .select()
          .single();
        
        if (error) throw error;
        return inserted;
      }
    },
    onSuccess: () => {
      toast.success('Analysis saved successfully');
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ['gtci-strategic-analysis', user?.id] });
    },
    onError: (error) => {
      toast.error('Failed to save analysis: ' + error.message);
    }
  });

  const updateData = <K extends keyof GTCIStrategicAnalysis>(
    key: K,
    value: GTCIStrategicAnalysis[K]
  ) => {
    setLocalData(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const save = () => {
    saveMutation.mutate(localData);
  };

  const reset = () => {
    setLocalData(defaultGTCIStrategicAnalysis);
    setHasUnsavedChanges(true);
  };

  return {
    data: localData,
    isLoading,
    isSaving: saveMutation.isPending,
    hasUnsavedChanges,
    isAuthenticated: !!user,
    updateData,
    save,
    reset,
    refetch
  };
}
