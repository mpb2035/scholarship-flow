import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'admin' | 'user' | null;

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching role:', error);
          setRole(null);
        } else {
          setRole(data?.role as AppRole);
        }
      } catch (err) {
        console.error('Error:', err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [user]);

  const isAdmin = role === 'admin';

  return { role, isAdmin, loading };
}
