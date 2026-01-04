-- Create SLA configurations table for each case type
CREATE TABLE public.sla_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_type text NOT NULL UNIQUE,
  sla_days integer NOT NULL DEFAULT 14,
  at_risk_days integer NOT NULL DEFAULT 10,
  critical_days integer NOT NULL DEFAULT 12,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sla_configurations ENABLE ROW LEVEL SECURITY;

-- Policies - only admins can manage SLA configs
CREATE POLICY "Admins can view SLA configurations"
ON public.sla_configurations
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert SLA configurations"
ON public.sla_configurations
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update SLA configurations"
ON public.sla_configurations
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete SLA configurations"
ON public.sla_configurations
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_sla_configurations_updated_at
BEFORE UPDATE ON public.sla_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create workflow steps table
CREATE TABLE public.workflow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name text NOT NULL,
  step_order integer NOT NULL,
  step_title text NOT NULL,
  step_description text,
  responsible_party text,
  estimated_days integer DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;

-- Policies - only admins can manage workflow steps
CREATE POLICY "Admins can view workflow steps"
ON public.workflow_steps
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert workflow steps"
ON public.workflow_steps
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update workflow steps"
ON public.workflow_steps
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete workflow steps"
ON public.workflow_steps
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_workflow_steps_updated_at
BEFORE UPDATE ON public.workflow_steps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default SLA configurations for existing case types
INSERT INTO public.sla_configurations (case_type, sla_days, at_risk_days, critical_days) VALUES
  ('Ministerial Inquiry', 7, 5, 6),
  ('Event Coordination', 14, 10, 12),
  ('Policy Review', 21, 15, 18),
  ('Budget Proposal', 14, 10, 12),
  ('Cross-Agency Project', 21, 15, 18),
  ('Scholarship Award', 14, 10, 12),
  ('Extension Scholarship', 14, 10, 12),
  ('Manpower Blueprint', 21, 15, 18),
  ('Attachment Overseas', 14, 10, 12),
  ('BPTV', 14, 10, 12),
  ('TVET Scheme', 14, 10, 12),
  ('HECAS', 14, 10, 12),
  ('Greening Education Plan', 21, 15, 18),
  ('SUSLR', 14, 10, 12),
  ('MKPK', 14, 10, 12),
  ('Other', 14, 10, 12)
ON CONFLICT (case_type) DO NOTHING;