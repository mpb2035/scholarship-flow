import { useState, useEffect, useCallback, useMemo } from 'react';
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

  // Derive unique group names from data, preserving order of first appearance
  const groups = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of items) {
      if (!seen.has(item.group_name)) {
        seen.add(item.group_name);
        result.push(item.group_name);
      }
    }
    return result;
  }, [items]);

  const isPlaceholder = (item: SidebarItem) => item.item_path.startsWith('__placeholder_');

  const getGroupItems = useCallback(
    (groupName: string) =>
      items
        .filter((i) => i.group_name === groupName && i.visible && !isPlaceholder(i))
        .sort((a, b) => a.sort_order - b.sort_order),
    [items]
  );

  const getAllGroupItems = useCallback(
    (groupName: string) =>
      items
        .filter((i) => i.group_name === groupName && !isPlaceholder(i))
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

  const createGroup = async (groupSlug: string, displayLabel: string) => {
    // Insert a placeholder row so the group persists in the DB
    const { error } = await supabase
      .from('sidebar_config')
      .insert({
        group_name: groupSlug,
        item_path: `__placeholder_${groupSlug}__`,
        item_title: displayLabel,
        visible: false,
        sort_order: -1,
      });
    if (error) throw error;
    await fetchConfig();
  };

  const moveToGroup = async (itemId: string, targetGroup: string) => {
    const targetItems = getAllGroupItems(targetGroup);
    const maxOrder = targetItems.length > 0
      ? Math.max(...targetItems.map(i => i.sort_order))
      : -1;

    const { error } = await supabase
      .from('sidebar_config')
      .update({ group_name: targetGroup, sort_order: maxOrder + 1 })
      .eq('id', itemId);
    if (error) throw error;
    await fetchConfig();
  };

  const deleteGroup = async (groupName: string) => {
    // Move all items to 'main' group first
    const groupItems = getAllGroupItems(groupName);
    const mainItems = getAllGroupItems('main');
    const maxOrder = mainItems.length > 0 ? Math.max(...mainItems.map(i => i.sort_order)) : -1;

    for (let i = 0; i < groupItems.length; i++) {
      const { error } = await supabase
        .from('sidebar_config')
        .update({ group_name: 'main', sort_order: maxOrder + 1 + i })
        .eq('id', groupItems[i].id);
      if (error) throw error;
    }
    await fetchConfig();
  };

  return {
    items,
    loading,
    groups,
    getGroupItems,
    getAllGroupItems,
    updateVisibility,
    updateOrder,
    createGroup,
    moveToGroup,
    deleteGroup,
    refetch: fetchConfig,
    iconMap: ICON_MAP,
  };
}
