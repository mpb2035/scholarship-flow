-- Drop overly permissive policies on matters table
DROP POLICY IF EXISTS "Authenticated users can view matters" ON matters;
DROP POLICY IF EXISTS "Authenticated users can insert matters" ON matters;
DROP POLICY IF EXISTS "Authenticated users can update matters" ON matters;
DROP POLICY IF EXISTS "Authenticated users can delete matters" ON matters;

-- Admins can do everything on matters
CREATE POLICY "Admins can view all matters"
  ON matters FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert matters"
  ON matters FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all matters"
  ON matters FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete matters"
  ON matters FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Regular authenticated users can view all matters (read-only access)
CREATE POLICY "Users can view all matters"
  ON matters FOR SELECT
  USING (auth.uid() IS NOT NULL);