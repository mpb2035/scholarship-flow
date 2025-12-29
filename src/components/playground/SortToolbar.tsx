import { cn } from '@/lib/utils';

export type SortCriteria = 'default' | 'id' | 'change';

interface SortToolbarProps {
  activeCriteria: SortCriteria;
  onSort: (criteria: SortCriteria) => void;
}

export function SortToolbar({ activeCriteria, onSort }: SortToolbarProps) {
  const buttons: { value: SortCriteria; label: string }[] = [
    { value: 'default', label: 'Overview' },
    { value: 'id', label: 'By Indicator Code' },
    { value: 'change', label: 'By Priority (Decline)' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
      <span className="text-sm font-semibold text-foreground mr-2">Rearrange View:</span>
      {buttons.map((btn) => (
        <button
          key={btn.value}
          onClick={() => onSort(btn.value)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200',
            activeCriteria === btn.value
              ? 'bg-[hsl(210,80%,28%)] text-white border-[hsl(210,80%,28%)]'
              : 'bg-background text-[hsl(210,80%,28%)] border-[hsl(210,80%,28%)] hover:bg-[hsl(210,80%,28%)]/10'
          )}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
