import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { RunningLogInput } from '@/hooks/useRunningLogs';

interface RunLogFormProps {
  onSubmit: (data: RunningLogInput) => Promise<unknown>;
}

const runTypeOptions = [
  { value: 'easy_run', label: 'Easy Run' },
  { value: 'tempo', label: 'Tempo' },
  { value: 'fartlek', label: 'Fartlek' },
  { value: 'interval', label: 'Interval' },
  { value: 'long_run', label: 'Long Run' },
  { value: 'race', label: 'Race' },
];

export function RunLogForm({ onSubmit }: RunLogFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RunningLogInput>({
    date: new Date().toISOString().split('T')[0],
    distance: 0,
    duration_minutes: 0,
    environment: 'outdoor',
    run_type: 'easy_run',
    notes: '',
    is_planned: false,
  });

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
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedPace = formData.distance > 0 && formData.duration_minutes > 0
    ? (formData.duration_minutes / formData.distance).toFixed(2)
    : '0.00';

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
