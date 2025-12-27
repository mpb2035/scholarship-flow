import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'admin' | 'user' | null;

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRole() {
      // Important: wait for auth to resolve before deciding the user has no role.
      if (authLoading) {
        if (!cancelled) setLoading(true);
        return;
      }

      if (!user) {
        if (!cancelled) {
          setRole(null);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) setLoading(true);

      try {
        // Do not use .single(): schema allows multiple rows per user (unique is user_id+role).
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (cancelled) return;

        if (error) {
          console.error('Error fetching role:', error);
          setRole(null);
        } else {
          const roles = (data ?? []).map((r) => r.role as AppRole).filter(Boolean);
          const nextRole: AppRole = roles.includes('admin') ? 'admin' : roles[0] ?? null;
          setRole(nextRole);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Error:', err);
        setRole(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRole();

    return () => {
      cancelled = true;
    };
  }, [user?.id, authLoading]);

  const isAdmin = useMemo(() => role === 'admin', [role]);

  return { role, isAdmin, loading };
}

