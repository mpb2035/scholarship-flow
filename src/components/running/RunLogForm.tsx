import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Link2, Calendar } from 'lucide-react';
import { RunningLogInput } from '@/hooks/useRunningLogs';
import { trainingPlan } from '@/data/trainingPlanData';
import { format, parseISO, differenceInDays } from 'date-fns';

interface RunLogFormProps {
  onSubmit: (data: RunningLogInput) => Promise<unknown>;
  completedTrainingDates: Set<string>;
}

const runTypeOptions = [
  { value: 'easy_run', label: 'Easy Run' },
  { value: 'tempo', label: 'Tempo' },
  { value: 'fartlek', label: 'Fartlek' },
  { value: 'interval', label: 'Interval' },
  { value: 'long_run', label: 'Long Run' },
  { value: 'race', label: 'Race' },
];

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
  'REST': 'easy_run',
};

export function RunLogForm({ onSubmit, completedTrainingDates }: RunLogFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RunningLogInput>({
    date: new Date().toISOString().split('T')[0],
    distance: 0,
    duration_minutes: 0,
    environment: 'outdoor',
    run_type: 'easy_run',
    notes: '',
    is_planned: false,
    linked_training_date: null,
  });

  // Get available training plan days (upcoming and recent, not completed)
  const availableTrainingDays = useMemo(() => {
    const today = new Date();
    return trainingPlan
      .filter(day => {
        const date = parseISO(day.date);
        const daysAgo = differenceInDays(today, date);
        const daysAhead = differenceInDays(date, today);
        const isNotCompleted = !completedTrainingDates.has(day.date);
        const isWorkout = day.type !== 'rest';
        return (daysAgo <= 14 || daysAhead <= 30) && isNotCompleted && isWorkout;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [completedTrainingDates]);

  const handleTrainingDaySelect = (dateValue: string) => {
    if (dateValue === 'none') {
      setFormData(prev => ({ ...prev, linked_training_date: null }));
      return;
    }

    const selectedDay = trainingPlan.find(day => day.date === dateValue);
    if (selectedDay) {
      // Auto-fill form based on training plan
      const distanceMatch = selectedDay.details.match(/(\d+(?:\.\d+)?)\s*km/);
      const distance = distanceMatch ? parseFloat(distanceMatch[1]) : 0;
      const runType = activityToRunType[selectedDay.activity] || 'easy_run';

      setFormData(prev => ({
        ...prev,
        date: selectedDay.date,
        linked_training_date: selectedDay.date,
        run_type: runType,
        distance: distance || prev.distance,
        is_planned: true,
        notes: prev.notes || `Training Plan: ${selectedDay.activity} - ${selectedDay.details}`,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.distance <= 0 || formData.duration_minutes <= 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        distance: 0,
        duration_minutes: 0,
        environment: 'outdoor',
        run_type: 'easy_run',
        notes: '',
        is_planned: false,
        linked_training_date: null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedPace = formData.distance > 0 && formData.duration_minutes > 0
    ? (formData.duration_minutes / formData.distance).toFixed(2)
    : '0.00';

  const selectedTrainingDay = formData.linked_training_date
    ? trainingPlan.find(day => day.date === formData.linked_training_date)
    : null;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Log New Run
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Training Plan Link */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              Link to Training Plan
            </Label>
            <Select
              value={formData.linked_training_date || 'none'}
              onValueChange={handleTrainingDaySelect}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a training day to link..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground">No link (manual entry)</span>
                </SelectItem>
                {availableTrainingDays.map(day => (
                  <SelectItem key={day.date} value={day.date}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span className="font-medium">
                        {format(parseISO(day.date), 'EEE, MMM d')}
                      </span>
                      <span className="text-muted-foreground">-</span>
                      <span>{day.activity}</span>
                      <Badge variant="outline" className="text-xs ml-1">
                        {day.details.match(/(\d+(?:\.\d+)?)\s*km/)?.[0] || ''}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTrainingDay && (
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 text-sm">
                <p className="font-medium text-primary">{selectedTrainingDay.activity}</p>
                <p className="text-muted-foreground">{selectedTrainingDay.details}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                min="0"
                value={formData.distance || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, distance: parseFloat(e.target.value) || 0 }))}
                placeholder="0.0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                value={formData.duration_minutes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Pace (min/km)</Label>
              <div className="h-10 flex items-center px-3 bg-muted rounded-md text-muted-foreground font-medium">
                {calculatedPace}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="run_type">Run Type</Label>
              <Select
                value={formData.run_type}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  run_type: value as RunningLogInput['run_type'] 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {runTypeOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select
                value={formData.environment}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  environment: value as 'indoor' | 'outdoor' 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                  <SelectItem value="indoor">Indoor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-3 pb-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_planned"
                  checked={formData.is_planned}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_planned: checked }))}
                />
                <Label htmlFor="is_planned" className="text-sm">Planned Run</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="How did it feel? Any observations..."
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Run'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
