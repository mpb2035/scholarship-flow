-- Create table for page access permissions
CREATE TABLE public.page_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_path TEXT NOT NULL,
  can_access BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, page_path)
);

-- Enable RLS
ALTER TABLE public.page_permissions ENABLE ROW LEVEL SECURITY;

-- Policies for page_permissions
CREATE POLICY "Admins can view all page permissions"
ON public.page_permissions FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert page permissions"
ON public.page_permissions FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update page permissions"
ON public.page_permissions FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete page permissions"
ON public.page_permissions FOR DELETE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own permissions"
ON public.page_permissions FOR SELECT
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_page_permissions_updated_at
BEFORE UPDATE ON public.page_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();