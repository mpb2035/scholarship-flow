-- Drop existing unrestricted policies
DROP POLICY IF EXISTS "Anyone can delete matters" ON public.matters;
DROP POLICY IF EXISTS "Anyone can insert matters" ON public.matters;
DROP POLICY IF EXISTS "Anyone can update matters" ON public.matters;
DROP POLICY IF EXISTS "Anyone can view matters" ON public.matters;

-- Create new policies restricted to authenticated users only
CREATE POLICY "Authenticated users can view matters" 
ON public.matters 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert matters" 
ON public.matters 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update matters" 
ON public.matters 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete matters" 
ON public.matters 
FOR DELETE 
TO authenticated
USING (true);