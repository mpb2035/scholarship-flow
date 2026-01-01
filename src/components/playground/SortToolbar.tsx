import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ArrowUpDown } from 'lucide-react';

export type SortCriteria = 'default' | 'id' | 'change';

interface SortToolbarProps {
  activeCriteria: SortCriteria;
  onSort: (criteria: SortCriteria) => void;
}

export function SortToolbar({ activeCriteria, onSort }: SortToolbarProps) {
  const buttons: { value: SortCriteria; label: string }[] = [
    { value: 'default', label: 'Overview' },
    { value: 'id', label: 'By Code' },
    { value: 'change', label: 'By Priority' },
  ];

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium text-muted-foreground">Sort:</span>
      <ToggleGroup 
        type="single" 
        value={activeCriteria} 
        onValueChange={(value) => {
          if (value) onSort(value as SortCriteria);
        }}
        className="border border-border/50 rounded-lg p-1 bg-input"
      >
        {buttons.map((btn) => (
          <ToggleGroupItem 
            key={btn.value}
            value={btn.value}
            className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary px-3 py-1.5 text-sm"
          >
            {btn.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
