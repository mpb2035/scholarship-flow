import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowStep } from '@/types/workflowTask';

export function useWorkflowTemplates() {
  const [templates, setTemplates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('workflow_steps')
          .select('workflow_name')
          .order('workflow_name');

        if (error) throw error;

        // Get unique workflow names
        const uniqueNames = [...new Set(data?.map(d => d.workflow_name) || [])];
        setTemplates(uniqueNames);
      } catch (error) {
        console.error('Error fetching workflow templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const fetchWorkflowSteps = async (workflowName: string): Promise<WorkflowStep[]> => {
    const { data, error } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('workflow_name', workflowName)
      .order('step_order');

    if (error) throw error;
    return data || [];
  };

  return { templates, loading, fetchWorkflowSteps };
}
