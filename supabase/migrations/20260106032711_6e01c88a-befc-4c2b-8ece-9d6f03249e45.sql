-- Add workflow-related fields to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS workflow_template_name text,
ADD COLUMN IF NOT EXISTS workflow_tasks jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Add comment to explain the workflow_tasks structure
COMMENT ON COLUMN public.projects.workflow_tasks IS 'Array of workflow task objects with: id, stepOrder, title, description, slaTarget, isDone, startDate, completionDate, frozenDaysElapsed';

-- Allow authenticated users to read workflow steps (needed for workflow template selection)
CREATE POLICY "Authenticated users can view workflow steps" 
ON public.workflow_steps 
FOR SELECT 
USING (auth.uid() IS NOT NULL);