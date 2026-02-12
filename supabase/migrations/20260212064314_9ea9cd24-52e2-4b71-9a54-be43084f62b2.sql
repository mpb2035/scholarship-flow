
-- Add project_id column to todos table to link with projects
ALTER TABLE public.todos 
ADD COLUMN project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

-- Create an index for faster lookups
CREATE INDEX idx_todos_project_id ON public.todos(project_id);
