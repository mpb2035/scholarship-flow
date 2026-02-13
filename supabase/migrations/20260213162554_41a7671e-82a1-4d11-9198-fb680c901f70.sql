
-- Update handle_new_user to auto-approve admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, is_approved)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN NEW.email = 'azlin1711@gmail.com' THEN true ELSE false END
  );
  RETURN NEW;
END;
$$;
