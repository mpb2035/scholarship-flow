import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useSidebarConfig, SidebarItem } from '@/hooks/useSidebarConfig';
import { useToast } from '@/hooks/use-toast';
import { Loader2, GripVertical, Eye, ArrowUp, ArrowDown } from 'lucide-react';

const GROUP_LABELS: Record<string, string> = {
  main: 'Main Navigation',
  manpower_blueprint: 'Manpower Blueprint',
  running: 'Running',
};

export function SidebarConfigManager() {
  const { items, loading, getAllGroupItems, updateVisibility, updateOrder, refetch } = useSidebarConfig();
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);

  const groups = ['main', 'manpower_blueprint', 'running'];

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
          Toggle visibility and reorder sidebar items. Changes apply to all users.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {groups.map((groupName) => {
          const groupItems = getAllGroupItems(groupName);
          return (
            <div key={groupName} className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {GROUP_LABELS[groupName] || groupName}
              </h3>
              <div className="border rounded-lg divide-y divide-border">
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
                    <span className="text-xs text-muted-foreground font-mono">{item.item_path}</span>
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
