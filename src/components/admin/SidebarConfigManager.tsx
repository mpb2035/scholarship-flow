import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSidebarConfig, SidebarItem } from '@/hooks/useSidebarConfig';
import { useToast } from '@/hooks/use-toast';
import { Loader2, GripVertical, Eye, ArrowUp, ArrowDown, Plus, ArrowRightLeft, Trash2 } from 'lucide-react';

const DEFAULT_GROUP_LABELS: Record<string, string> = {
  main: 'Main Navigation',
  manpower_blueprint: 'Manpower Blueprint',
  running: 'Running',
};

export function SidebarConfigManager() {
  const { items, loading, groups, getAllGroupItems, updateVisibility, updateOrder, moveToGroup, createGroup, deleteGroup, refetch } = useSidebarConfig();
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [movingItem, setMovingItem] = useState<string | null>(null);

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

  const getGroupLabel = (name: string) => DEFAULT_GROUP_LABELS[name] || name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // All possible target groups for moving (including typed new groups)
  const allTargetGroups = [...groups];

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
          Toggle visibility, reorder items, move between groups, or create new groups. Changes apply to all users.
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
          return (
            <div key={groupName} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {getGroupLabel(groupName)}
                </h3>
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
                    <span className={`flex-1 text-sm ${!item.visible ? 'text-muted-foreground line-through' : ''}`}>
                      {item.item_title}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono hidden sm:inline">{item.item_path}</span>

                    {/* Move to group */}
                    {movingItem === item.id ? (
                      <Select onValueChange={(val) => handleMoveToGroup(item.id, val)}>
                        <SelectTrigger className="w-[140px] h-7 text-xs">
                          <SelectValue placeholder="Move to..." />
                        </SelectTrigger>
                        <SelectContent>
                          {allTargetGroups
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
                        className="h-7 w-7"
                        title="Move to another group"
                        onClick={() => setMovingItem(item.id)}
                        disabled={updating !== null || groups.length < 2}
                      >
                        <ArrowRightLeft className="h-3 w-3" />
                      </Button>
                    )}

                    <div className="flex gap-1">
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
