import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TrainingDay, phaseInfo } from '@/data/trainingPlanData';
import { RunningLogInput } from '@/hooks/useRunningLogs';
import { format, parseISO } from 'date-fns';
import { Heart, Timer, Route, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const activityToRunType: Record<string, RunningLogInput['run_type']> = {
  'Easy Run': 'easy_run',
  'Tempo Run': 'tempo',
  'Tempo': 'tempo',
  'Fartlek': 'fartlek',
  'Interval Training': 'interval',
  'Intervals': 'interval',
  'Long Run': 'long_run',
  'Night Run': 'easy_run',
  'Half Marathon Test': 'race',
  'RACE DAY': 'race',
  '🏁 RACE DAY': 'race',
  'Taper Run': 'easy_run',
  'Shakeout': 'easy_run',
  'Recovery': 'easy_run',
  'Recovery Week': 'easy_run',
  'Steady Run': 'easy_run',
  'Hill Repeats': 'interval',
  'HM Pace': 'tempo',
  'Combo': 'tempo',
};

interface TrainingDayExpandedProps {
  day: TrainingDay;
  onSubmit: (data: RunningLogInput) => Promise<unknown>;
  onClose: () => void;
}

export function TrainingDayExpanded({ day, onSubmit, onClose }: TrainingDayExpandedProps) {
  const distanceMatch = day.details.match(/(\d+(?:\.\d+)?)\s*km/);
  const defaultDistance = distanceMatch ? parseFloat(distanceMatch[1]) : 0;

  const [distance, setDistance] = useState(defaultDistance);
  const [duration, setDuration] = useState(0);
  const [heartRate, setHeartRate] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pace = distance > 0 && duration > 0 ? (duration / distance).toFixed(2) : '—';
  const runType = activityToRunType[day.activity] || 'easy_run';

  const handleSave = async () => {
    if (distance <= 0 || duration <= 0) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        date: day.date,
        distance,
        duration_minutes: duration,
        environment: 'outdoor',
        run_type: runType,
        is_planned: true,
        linked_training_date: day.date,
        heart_rate: heartRate || null,
        notes: `Training Plan: ${day.activity} - ${day.details}`,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-4 animate-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">{day.activity}</p>
          <p className="text-xs text-muted-foreground">{day.details}</p>
        </div>
        <Badge variant="outline" className={cn("text-xs", phaseInfo[day.phase].color)}>
          {phaseInfo[day.phase].label}
        </Badge>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1">
            <Route className="h-3 w-3" /> Distance (km)
          </Label>
          <Input
            type="number"
            step="0.1"
            min="0"
            value={distance || ''}
            onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
            placeholder="0.0"
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1">
            <Timer className="h-3 w-3" /> Duration (min)
          </Label>
          <Input
            type="number"
            min="0"
            value={duration || ''}
            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            placeholder="0"
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1">
            <Heart className="h-3 w-3 text-red-500" /> Avg HR (bpm)
          </Label>
          <Input
            type="number"
            min="40"
            max="220"
            value={heartRate || ''}
            onChange={(e) => setHeartRate(parseInt(e.target.value) || undefined)}
            placeholder="—"
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Pace (min/km)</Label>
          <div className="h-9 flex items-center px-3 bg-muted rounded-md text-muted-foreground font-mono text-sm">
            {pace}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSubmitting || distance <= 0 || duration <= 0}
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
          Log & Complete
        </Button>
      </div>
    </div>
  );
}
