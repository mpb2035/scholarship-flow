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

const DEFAULT_GROUP_LABELS: Record<string, string> = {
  main: 'Main Navigation',
  manpower_blueprint: 'Manpower Blueprint',
  running: 'Running',
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

  // Get display label for a group from its placeholder row, or fallback to defaults
  const getGroupLabel = useCallback(
    (groupName: string): string => {
      const placeholder = items.find(
        (i) => i.group_name === groupName && isPlaceholder(i)
      );
      if (placeholder) return placeholder.item_title;
      return DEFAULT_GROUP_LABELS[groupName] || groupName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    },
    [items]
  );

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

  // Rename a group's display label (stored on placeholder row)
  const renameGroup = async (groupName: string, newLabel: string) => {
    const placeholder = items.find(
      (i) => i.group_name === groupName && isPlaceholder(i)
    );
    if (placeholder) {
      // Update existing placeholder's title
      const { error } = await supabase
        .from('sidebar_config')
        .update({ item_title: newLabel })
        .eq('id', placeholder.id);
      if (error) throw error;
    } else {
      // Create a placeholder for this group to store its label
      const { error } = await supabase
        .from('sidebar_config')
        .insert({
          group_name: groupName,
          item_path: `__placeholder_${groupName}__`,
          item_title: newLabel,
          visible: false,
          sort_order: -1,
        });
      if (error) throw error;
    }
    await fetchConfig();
  };

  // Rename an individual sidebar item
  const renameItem = async (itemId: string, newTitle: string) => {
    const { error } = await supabase
      .from('sidebar_config')
      .update({ item_title: newTitle })
      .eq('id', itemId);
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

    // Delete the placeholder row too
    const placeholder = items.find(
      (i) => i.group_name === groupName && isPlaceholder(i)
    );
    if (placeholder) {
      await supabase.from('sidebar_config').delete().eq('id', placeholder.id);
    }

    await fetchConfig();
  };

  return {
    items,
    loading,
    groups,
    getGroupItems,
    getAllGroupItems,
    getGroupLabel,
    updateVisibility,
    updateOrder,
    createGroup,
    renameGroup,
    renameItem,
    moveToGroup,
    deleteGroup,
    refetch: fetchConfig,
    iconMap: ICON_MAP,
  };
}
