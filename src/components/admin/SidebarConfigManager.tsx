import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSidebarConfig, SidebarItem } from '@/hooks/useSidebarConfig';
import { useToast } from '@/hooks/use-toast';
import { Loader2, GripVertical, Eye, ArrowUp, ArrowDown, Plus, ArrowRightLeft, Trash2, Pencil, Check, X } from 'lucide-react';

export function SidebarConfigManager() {
  const {
    items, loading, groups, getAllGroupItems, getGroupLabel,
    updateVisibility, updateOrder, moveToGroup, createGroup, renameGroup, renameItem, deleteGroup, refetch
  } = useSidebarConfig();
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [movingItem, setMovingItem] = useState<string | null>(null);

  // Editing state for group names
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editGroupValue, setEditGroupValue] = useState('');

  // Editing state for item names
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editItemValue, setEditItemValue] = useState('');

  const handleToggle = async (item: SidebarItem) => {
    setUpdating(item.id);
    try {
      await updateVisibility(item.id, !item.visible);
      toast({ title: 'Updated', description: `${item.item_title} is now ${!item.visible ? 'visible' : 'hidden'}.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to update visibility.', variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  const handleMove = async (groupName: string, index: number, direction: 'up' | 'down') => {
    const groupItems = getAllGroupItems(groupName);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= groupItems.length) return;

    setUpdating(groupItems[index].id);
    try {
      await updateOrder([
        { id: groupItems[index].id, sort_order: groupItems[swapIndex].sort_order },
        { id: groupItems[swapIndex].id, sort_order: groupItems[index].sort_order },
      ]);
    } catch {
      toast({ title: 'Error', description: 'Failed to reorder.', variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  const handleMoveToGroup = async (itemId: string, targetGroup: string) => {
    setUpdating(itemId);
    try {
      await moveToGroup(itemId, targetGroup);
      toast({ title: 'Moved', description: 'Item moved to new group.' });
      setMovingItem(null);
    } catch {
      toast({ title: 'Error', description: 'Failed to move item.', variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    const slug = newGroupName.trim().toLowerCase().replace(/\s+/g, '_');
    if (groups.includes(slug)) {
      toast({ title: 'Exists', description: 'Group already exists.', variant: 'destructive' });
      return;
    }
    setUpdating('new-group');
    try {
      await createGroup(slug, newGroupName.trim());
      toast({ title: 'Group Created', description: `"${newGroupName.trim()}" group has been saved.` });
      setNewGroupName('');
      setShowNewGroup(false);
    } catch {
      toast({ title: 'Error', description: 'Failed to create group.', variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteGroup = async (groupName: string) => {
    if (groupName === 'main') {
      toast({ title: 'Cannot Delete', description: 'Main group cannot be deleted.', variant: 'destructive' });
      return;
    }
    setUpdating(groupName);
    try {
      await deleteGroup(groupName);
      toast({ title: 'Group Deleted', description: 'Items moved to Main Navigation.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete group.', variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  // Group rename handlers
  const startEditGroup = (groupName: string) => {
    setEditingGroup(groupName);
    setEditGroupValue(getGroupLabel(groupName));
  };

  const saveGroupName = async (groupName: string) => {
    if (!editGroupValue.trim()) {
      setEditingGroup(null);
      return;
    }
    setUpdating(`group-rename-${groupName}`);
    try {
      await renameGroup(groupName, editGroupValue.trim());
      toast({ title: 'Renamed', description: 'Group name updated.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to rename group.', variant: 'destructive' });
    } finally {
      setEditingGroup(null);
      setUpdating(null);
    }
  };

  // Item rename handlers
  const startEditItem = (item: SidebarItem) => {
    setEditingItem(item.id);
    setEditItemValue(item.item_title);
  };

  const saveItemName = async (itemId: string) => {
    if (!editItemValue.trim()) {
      setEditingItem(null);
      return;
    }
    setUpdating(`item-rename-${itemId}`);
    try {
      await renameItem(itemId, editItemValue.trim());
      toast({ title: 'Renamed', description: 'Item name updated.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to rename item.', variant: 'destructive' });
    } finally {
      setEditingItem(null);
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Sidebar Configuration
        </CardTitle>
        <CardDescription>
          Toggle visibility, reorder, rename items and groups, or move between groups. Changes apply to all users.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create new group */}
        <div className="flex items-center gap-2">
          {showNewGroup ? (
            <>
              <Input
                placeholder="New group name (e.g. reports)"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="max-w-xs"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
              />
              <Button size="sm" onClick={handleCreateGroup} disabled={!newGroupName.trim()}>
                Create
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowNewGroup(false); setNewGroupName(''); }}>
                Cancel
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setShowNewGroup(true)} className="gap-1">
              <Plus className="h-4 w-4" />
              New Group
            </Button>
          )}
        </div>

        {groups.map((groupName) => {
          const groupItems = getAllGroupItems(groupName);
          const label = getGroupLabel(groupName);

          return (
            <div key={groupName} className="space-y-2">
              <div className="flex items-center justify-between">
                {editingGroup === groupName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editGroupValue}
                      onChange={(e) => setEditGroupValue(e.target.value)}
                      className="h-7 text-sm max-w-[200px]"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveGroupName(groupName);
                        if (e.key === 'Escape') setEditingGroup(null);
                      }}
                    />
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => saveGroupName(groupName)}>
                      <Check className="h-3 w-3 text-primary" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingGroup(null)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      {label}
                    </h3>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => startEditGroup(groupName)}
                      title="Rename group"
                    >
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                )}
                {groupName !== 'main' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-destructive hover:text-destructive gap-1 text-xs"
                    onClick={() => handleDeleteGroup(groupName)}
                    disabled={updating === groupName}
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete Group
                  </Button>
                )}
              </div>
              <div className="border rounded-lg divide-y divide-border">
                {groupItems.length === 0 && (
                  <div className="px-4 py-3 text-sm text-muted-foreground italic">No items in this group</div>
                )}
                {groupItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Checkbox
                      checked={item.visible}
                      onCheckedChange={() => handleToggle(item)}
                      disabled={updating === item.id}
                    />

                    {/* Item name - inline editable */}
                    {editingItem === item.id ? (
                      <div className="flex items-center gap-1 flex-1">
                        <Input
                          value={editItemValue}
                          onChange={(e) => setEditItemValue(e.target.value)}
                          className="h-7 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveItemName(item.id);
                            if (e.key === 'Escape') setEditingItem(null);
                          }}
                        />
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => saveItemName(item.id)}>
                          <Check className="h-3 w-3 text-primary" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => setEditingItem(null)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <span className={`text-sm truncate ${!item.visible ? 'text-muted-foreground line-through' : ''}`}>
                          {item.item_title}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 shrink-0"
                          onClick={() => startEditItem(item)}
                          title="Rename item"
                        >
                          <Pencil className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    )}

                    <span className="text-xs text-muted-foreground font-mono hidden sm:inline shrink-0">{item.item_path}</span>

                    {/* Move to group */}
                    {movingItem === item.id ? (
                      <Select onValueChange={(val) => handleMoveToGroup(item.id, val)}>
                        <SelectTrigger className="w-[140px] h-7 text-xs shrink-0">
                          <SelectValue placeholder="Move to..." />
                        </SelectTrigger>
                        <SelectContent>
                          {groups
                            .filter((g) => g !== groupName)
                            .map((g) => (
                              <SelectItem key={g} value={g}>
                                {getGroupLabel(g)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 shrink-0"
                        title="Move to another group"
                        onClick={() => setMovingItem(item.id)}
                        disabled={updating !== null || groups.length < 2}
                      >
                        <ArrowRightLeft className="h-3 w-3" />
                      </Button>
                    )}

                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        disabled={idx === 0 || updating !== null}
                        onClick={() => handleMove(groupName, idx, 'up')}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        disabled={idx === groupItems.length - 1 || updating !== null}
                        onClick={() => handleMove(groupName, idx, 'down')}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
