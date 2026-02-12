
-- Table to store sidebar item visibility and order (global, admin-managed)
CREATE TABLE public.sidebar_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_name TEXT NOT NULL,
  item_path TEXT NOT NULL,
  item_title TEXT NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_name, item_path)
);

-- Enable RLS
ALTER TABLE public.sidebar_config ENABLE ROW LEVEL SECURITY;

-- Everyone can read (needed for sidebar rendering)
CREATE POLICY "Anyone can read sidebar config"
ON public.sidebar_config FOR SELECT
TO authenticated
USING (true);

-- Only admins can modify
CREATE POLICY "Admins can insert sidebar config"
ON public.sidebar_config FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sidebar config"
ON public.sidebar_config FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sidebar config"
ON public.sidebar_config FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Seed default items
INSERT INTO public.sidebar_config (group_name, item_path, item_title, sort_order) VALUES
  ('main', '/', 'Dashboard', 0),
  ('main', '/in-process', 'In Process', 1),
  ('main', '/attachment-overseas', 'Attachment Overseas', 2),
  ('main', '/pending-response', 'Pending Response', 3),
  ('main', '/analytics', 'Analytics', 4),
  ('main', '/directory', 'My Directory', 5),
  ('main', '/project-workflow', 'Project Workflow', 6),
  ('main', '/todo', 'To Do', 7),
  ('main', '/leave-planner', 'Leave Planner', 8),
  ('main', '/financial-plan', 'Financial Plan', 9),
  ('main', '/previous-meetings', 'Previous Meetings', 10),
  ('manpower_blueprint', '/gtci', 'GTCI Analysis', 0),
  ('manpower_blueprint', '/gtci-strategic', 'GTCI Strategic', 1),
  ('manpower_blueprint', '/gtci-upload', 'GTCI Upload', 2),
  ('manpower_blueprint', '/playground', 'Playground', 3),
  ('running', '/triathlete-goal', 'Triathlete Goal', 0);

-- Timestamp trigger
CREATE TRIGGER update_sidebar_config_updated_at
BEFORE UPDATE ON public.sidebar_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
