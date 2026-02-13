import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useApprovalStatus() {
  const { user } = useAuth();
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsApproved(null);
      setLoading(false);
      return;
    }

    async function checkApproval() {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_approved')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking approval:', error);
        // If no profile yet (race condition), treat as unapproved
        setIsApproved(false);
      } else if (!data) {
        setIsApproved(false);
      } else {
        setIsApproved((data as any).is_approved ?? false);
      }
      setLoading(false);
    }

    checkApproval();
  }, [user]);

  return { isApproved, loading };
}
