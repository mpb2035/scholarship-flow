import { useState } from 'react';
import { Trash2, GripVertical, TrendingUp, TrendingDown, Minus, Star, MessageSquare, FileText, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BentoIndicator } from '@/data/playgroundData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BentoCardProps {
  indicator: BentoIndicator;
  onUpdate: (updated: BentoIndicator) => void;
  onDelete: () => void;
  onCommentClick: (label: string) => void;
  onDetailClick: () => void;
}

export function BentoCard({ indicator, onUpdate, onDelete, onCommentClick, onDetailClick }: BentoCardProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');

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

  const numericChange = typeof indicator.trend_value === 'string' 
    ? parseFloat(indicator.trend_value) || 0 
    : indicator.trend_value;

  const trendArrow = indicator.trend_direction === 'down' ? '📉' : indicator.trend_direction === 'up' ? '📈' : '';

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
          'h-3 w-3',
          i < indicator.quality_rating ? 'fill-amber-300 text-amber-300' : 'text-white/30'
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
          className="min-h-[60px] text-sm bg-white/20 border-white/30 text-white placeholder:text-white/50"
        />
      ) : (
        <Input
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => saveEdit(field)}
          onKeyDown={(e) => handleKeyDown(e, field)}
          autoFocus
          className={cn("h-auto py-1 bg-white/20 border-white/30 text-white", className)}
        />
      );
    }
    return (
      <span
        onClick={() => startEdit(field, value)}
        className="cursor-pointer hover:bg-white/20 rounded px-1 -mx-1 transition-colors"
      >
        {value}
      </span>
    );
  };

  const policyNotesCount = indicator.policyNotes?.length || 0;

  return (
    <div
      className="relative group bg-[hsl(210,80%,28%)] text-white rounded-3xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col cursor-pointer"
      onClick={(e) => {
        // Don't open detail if clicking on editable field or button
        if ((e.target as HTMLElement).closest('button, input, textarea, [role="button"]')) return;
        onDetailClick();
      }}
    >
      {/* Drag Handle & Delete */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-white/60 cursor-grab" />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-white/60 hover:text-red-300 hover:bg-white/10"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Pillar Pill */}
      {indicator.pillar && (
        <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full w-fit mb-3">
          {indicator.pillar}
        </span>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg pr-6">
          <EditableField field="title" value={indicator.title} />
        </h3>
        <span className="text-xl font-bold flex-shrink-0">
          {indicator.score_2025}
        </span>
      </div>

      {/* ID & Owner */}
      <p className="text-xs text-white/70 mb-3">
        {indicator.id}
        {indicator.owner && ` | Owner: ${indicator.owner}`}
      </p>

      {/* Definition snippet */}
      {indicator.definition && (
        <p className="text-xs text-white/60 mb-3 line-clamp-2">
          {indicator.definition}
        </p>
      )}

      {/* Change */}
      <div className="text-sm mb-4">
        Change: <span className={cn('font-bold', numericChange < 0 ? 'text-red-300' : 'text-green-300')}>
          {trendArrow} {indicator.trend_value}
        </span>
      </div>

      {/* Category Badge */}
      {!indicator.pillar && (
        <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full w-fit mb-3">
          {indicator.category}
        </span>
      )}

      {/* Actions */}
      <div className="mt-auto flex gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-white/40 bg-white/10 text-white hover:bg-white/20 rounded-xl text-xs"
          onClick={(e) => { e.stopPropagation(); onCommentClick(indicator.title); }}
        >
          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
          Comment
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-white/40 bg-white/10 text-white hover:bg-white/20 rounded-xl text-xs relative"
          onClick={(e) => { e.stopPropagation(); onDetailClick(); }}
        >
          <FileText className="h-3.5 w-3.5 mr-1.5" />
          Policy Note
          {policyNotesCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-[hsl(210,80%,28%)] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {policyNotesCount}
            </span>
          )}
        </Button>
      </div>

      {/* Quality Stars */}
      <div className="flex items-center gap-0.5 mt-3 justify-end" title="Data Quality">
        {renderStars()}
      </div>

      {/* Info hint */}
      <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Info className="h-4 w-4 text-white/40" />
      </div>
    </div>
  );
}
