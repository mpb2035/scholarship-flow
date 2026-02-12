import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SidebarItem {
  id: string;
  group_name: string;
  item_path: string;
  item_title: string;
  visible: boolean;
  sort_order: number;
}

const ICON_MAP: Record<string, string> = {
  '/': 'LayoutDashboard',
  '/in-process': 'Clock',
  '/attachment-overseas': 'Plane',
  '/pending-response': 'MessageSquareWarning',
  '/analytics': 'BarChart3',
  '/directory': 'Bookmark',
  '/project-workflow': 'FolderKanban',
  '/todo': 'ListTodo',
  '/leave-planner': 'CalendarDays',
  '/financial-plan': 'Wallet',
  '/previous-meetings': 'History',
  '/gtci': 'Globe',
  '/gtci-strategic': 'FileText',
  '/gtci-upload': 'FileUp',
  '/playground': 'LayoutGrid',
  '/triathlete-goal': 'Target',
};

export function useSidebarConfig() {
  const [items, setItems] = useState<SidebarItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sidebar_config')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setItems((data || []) as SidebarItem[]);
    } catch (err) {
      console.error('Error fetching sidebar config:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const getGroupItems = useCallback(
    (groupName: string) =>
      items
        .filter((i) => i.group_name === groupName && i.visible)
        .sort((a, b) => a.sort_order - b.sort_order),
    [items]
  );

  const getAllGroupItems = useCallback(
    (groupName: string) =>
      items
        .filter((i) => i.group_name === groupName)
        .sort((a, b) => a.sort_order - b.sort_order),
    [items]
  );

  const updateVisibility = async (id: string, visible: boolean) => {
    const { error } = await supabase
      .from('sidebar_config')
      .update({ visible })
      .eq('id', id);
    if (error) throw error;
    await fetchConfig();
  };

  const updateOrder = async (updates: { id: string; sort_order: number }[]) => {
    for (const u of updates) {
      const { error } = await supabase
        .from('sidebar_config')
        .update({ sort_order: u.sort_order })
        .eq('id', u.id);
      if (error) throw error;
    }
    await fetchConfig();
  };

  return {
    items,
    loading,
    getGroupItems,
    getAllGroupItems,
    updateVisibility,
    updateOrder,
    refetch: fetchConfig,
    iconMap: ICON_MAP,
  };
}
