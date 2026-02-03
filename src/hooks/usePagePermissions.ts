import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';

export interface PagePermission {
  id: string;
  user_id: string;
  page_path: string;
  can_access: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWithPermissions {
  user_id: string;
  email: string;
  role: 'admin' | 'user' | null;
  permissions: Record<string, boolean>;
}

const ALL_PAGES = [
  { path: '/', label: 'Dashboard' },
  { path: '/in-process', label: 'In Process' },
  { path: '/attachment-overseas', label: 'Attachment Overseas' },
  { path: '/pending-response', label: 'Pending Response' },
  { path: '/analytics', label: 'Analytics' },
  { path: '/directory', label: 'My Directory' },
  { path: '/project-workflow', label: 'Project Workflow' },
  { path: '/todo', label: 'To Do' },
  { path: '/leave-planner', label: 'Leave Planner' },
  { path: '/financial-plan', label: 'Financial Plan' },
  { path: '/previous-meetings', label: 'Previous Meetings' },
  { path: '/gtci', label: 'GTCI Analysis' },
  { path: '/gtci-strategic', label: 'GTCI Strategic' },
  { path: '/gtci-upload', label: 'GTCI Upload' },
  { path: '/playground', label: 'Playground' },
  { path: '/triathlete-goal', label: 'Triathlete Goal' },
];

export function usePagePermissions() {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [permissions, setPermissions] = useState<PagePermission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!user) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('page_permissions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setPermissions((data || []) as PagePermission[]);
    } catch (err) {
      console.error('Error fetching permissions:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const canAccessPage = useCallback((pagePath: string): boolean => {
    // Admins can access everything
    if (isAdmin) return true;
    
    // Auth page is always accessible
    if (pagePath === '/auth') return true;
    
    // Check if user has explicit permission
    const permission = permissions.find(p => p.page_path === pagePath);
    return permission?.can_access ?? false;
  }, [permissions, isAdmin]);

  return {
    permissions,
    loading: loading || roleLoading,
    canAccessPage,
    allPages: ALL_PAGES,
    refetch: fetchPermissions,
  };
}

export function useAdminUserManagement() {
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Get all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Get all permissions
      const { data: permissionsData, error: permError } = await supabase
        .from('page_permissions')
        .select('*');

      if (permError) throw permError;

      // Get all profiles for email display
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, display_name');

      if (profilesError) throw profilesError;

      // Create email lookup map
      const emailMap = new Map<string, string>();
      for (const profile of (profilesData || [])) {
        emailMap.set(profile.user_id, profile.email || '');
      }

      // Group permissions by user
      const userMap = new Map<string, UserWithPermissions>();
      
      for (const roleRow of (rolesData || [])) {
        const userId = roleRow.user_id;
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            user_id: userId,
            email: emailMap.get(userId) || '',
            role: roleRow.role as 'admin' | 'user',
            permissions: {},
          });
        }
      }

      // Add permissions to users
      for (const perm of (permissionsData || []) as PagePermission[]) {
        if (userMap.has(perm.user_id)) {
          const user = userMap.get(perm.user_id)!;
          user.permissions[perm.page_path] = perm.can_access;
        } else {
          userMap.set(perm.user_id, {
            user_id: perm.user_id,
            email: emailMap.get(perm.user_id) || '',
            role: null,
            permissions: { [perm.page_path]: perm.can_access },
          });
        }
      }

      // Also add users from profiles that may not have roles/permissions yet
      for (const profile of (profilesData || [])) {
        if (!userMap.has(profile.user_id)) {
          userMap.set(profile.user_id, {
            user_id: profile.user_id,
            email: profile.email || '',
            role: null,
            permissions: {},
          });
        }
      }

      setUsers(Array.from(userMap.values()));
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const updateUserRole = async (userId: string, role: 'admin' | 'user') => {
    try {
      // First try to update existing role
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        if (error) throw error;
      }

      await fetchAllUsers();
    } catch (err) {
      console.error('Error updating role:', err);
      throw err;
    }
  };

  const updatePagePermission = async (userId: string, pagePath: string, canAccess: boolean) => {
    try {
      // Check if permission exists
      const { data: existing } = await supabase
        .from('page_permissions')
        .select('id')
        .eq('user_id', userId)
        .eq('page_path', pagePath)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('page_permissions')
          .update({ can_access: canAccess })
          .eq('user_id', userId)
          .eq('page_path', pagePath);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('page_permissions')
          .insert({ user_id: userId, page_path: pagePath, can_access: canAccess });
        if (error) throw error;
      }

      await fetchAllUsers();
    } catch (err) {
      console.error('Error updating permission:', err);
      throw err;
    }
  };

  const setAllPermissions = async (userId: string, canAccess: boolean) => {
    try {
      const pages = ALL_PAGES.map(p => p.path);
      
      for (const pagePath of pages) {
        await updatePagePermission(userId, pagePath, canAccess);
      }
    } catch (err) {
      console.error('Error setting all permissions:', err);
      throw err;
    }
  };

  return {
    users,
    loading,
    updateUserRole,
    updatePagePermission,
    setAllPermissions,
    refetch: fetchAllUsers,
    allPages: ALL_PAGES,
  };
}
