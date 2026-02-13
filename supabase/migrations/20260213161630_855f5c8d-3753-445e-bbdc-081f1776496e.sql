-- Add is_approved column to profiles (default false so new users need approval)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false;

-- Auto-approve existing users (they're already in the system)
UPDATE public.profiles SET is_approved = true;

-- Admin users should always be approved - create a trigger
CREATE OR REPLACE FUNCTION public.auto_approve_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If user has admin role, auto-approve
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.user_id AND role = 'admin') THEN
    NEW.is_approved := true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_approve_admin_trigger
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.auto_approve_admin();