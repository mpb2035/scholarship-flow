import { useState } from 'react';
import { Trash2, GripVertical, TrendingUp, TrendingDown, Minus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BentoIndicator } from '@/data/playgroundData';
import { cn } from '@/lib/utils';

interface BentoCardProps {
  indicator: BentoIndicator;
  onUpdate: (updated: BentoIndicator) => void;
  onDelete: () => void;
}

const statusStyles: Record<string, { bg: string; border: string }> = {
  critical: { bg: 'bg-red-100 dark:bg-red-950/30', border: 'border-l-red-500' },
  warning: { bg: 'bg-orange-100 dark:bg-orange-950/30', border: 'border-l-orange-500' },
  alert: { bg: 'bg-yellow-100 dark:bg-yellow-950/30', border: 'border-l-yellow-500' },
  good: { bg: 'bg-green-100 dark:bg-green-950/30', border: 'border-l-green-500' },
  star: { bg: 'bg-blue-100 dark:bg-blue-950/30', border: 'border-l-blue-500' },
  neutral: { bg: 'bg-muted/50', border: 'border-l-muted-foreground' },
};

export function BentoCard({ indicator, onUpdate, onDelete }: BentoCardProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');

  const styles = statusStyles[indicator.status] || statusStyles.neutral;

  const startEdit = (field: string, value: string) => {
    setIsEditing(field);
    setTempValue(value);
  };

  const saveEdit = (field: keyof BentoIndicator) => {
    onUpdate({ ...indicator, [field]: tempValue });
    setIsEditing(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: keyof BentoIndicator) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit(field);
    }
    if (e.key === 'Escape') {
      setIsEditing(null);
    }
  };

  const TrendIcon = indicator.trend_direction === 'up' 
    ? TrendingUp 
    : indicator.trend_direction === 'down' 
      ? TrendingDown 
      : Minus;

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
          'h-3 w-3',
          i < indicator.quality_rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
        )}
      />
    ));
  };

  const EditableField = ({ 
    field, 
    value, 
    isTextarea = false,
    className = ''
  }: { 
    field: keyof BentoIndicator; 
    value: string; 
    isTextarea?: boolean;
    className?: string;
  }) => {
    if (isEditing === field) {
      return isTextarea ? (
        <Textarea
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => saveEdit(field)}
          onKeyDown={(e) => handleKeyDown(e, field)}
          autoFocus
          className="min-h-[60px] text-sm"
        />
      ) : (
        <Input
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => saveEdit(field)}
          onKeyDown={(e) => handleKeyDown(e, field)}
          autoFocus
          className={cn("h-auto py-1", className)}
        />
      );
    }
    return (
      <span
        onClick={() => startEdit(field, value)}
        className="cursor-pointer hover:bg-background/50 rounded px-1 -mx-1 transition-colors"
      >
        {value}
      </span>
    );
  };

  return (
    <div
      className={cn(
        'relative group rounded-xl p-5 border-l-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1',
        styles.bg,
        styles.border
      )}
    >
      {/* Drag Handle & Delete */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-mono text-muted-foreground font-semibold">
          <EditableField field="id" value={indicator.id} className="font-mono text-xs" />
        </span>
        <div className="flex items-center gap-1.5 text-foreground font-bold">
          <EditableField 
            field="score_2025" 
            value={String(indicator.score_2025)} 
            className="w-16 text-right font-bold"
          />
          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
            <TrendIcon className="h-3 w-3" />
            <EditableField field="trend_value" value={indicator.trend_value} className="w-14 text-xs" />
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-foreground mb-2">
        <EditableField field="title" value={indicator.title} />
      </h3>

      {/* Insight */}
      <div className="text-sm text-muted-foreground mb-3">
        <span className="font-medium text-foreground">Insight: </span>
        <EditableField field="insight" value={indicator.insight} isTextarea />
      </div>

      {/* Action Box */}
      <div className="bg-background/60 border border-dashed border-border rounded-md p-3 text-sm mb-3">
        <span className="font-medium text-foreground">Action: </span>
        <EditableField field="action" value={indicator.action} isTextarea />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wide">
        <span className="bg-background/50 px-2 py-0.5 rounded">
          <EditableField field="category" value={indicator.category} className="text-xs uppercase" />
        </span>
        <div className="flex items-center gap-0.5" title="Data Quality">
          {renderStars()}
        </div>
      </div>
    </div>
  );
}
