import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { MeetingInput } from '@/types/meeting';

interface EventFormContentProps {
  isEdit: boolean;
  formData: MeetingInput;
  selectedDate: Date | undefined;
  onFormDataChange: (data: MeetingInput) => void;
  onDateChange: (date: Date | undefined) => void;
  onSubmit: () => void;
}

export function EventFormContent({ isEdit, formData, selectedDate, onFormDataChange, onDateChange, onSubmit }: EventFormContentProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input
          value={formData.title}
          onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
          placeholder="Event title"
        />
      </div>

      <div className="grid gap-4 grid-cols-2">
        <div className="space-y-2">
          <Label>Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={selectedDate} onSelect={onDateChange} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>Time</Label>
          <Input
            type="time"
            value={formData.meeting_time}
            onChange={(e) => onFormDataChange({ ...formData, meeting_time: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={formData.meeting_type}
            onValueChange={(v: 'meeting' | 'event' | 'reminder' | 'deadline') => onFormDataChange({ ...formData, meeting_type: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input
            value={formData.location}
            onChange={(e) => onFormDataChange({ ...formData, location: e.target.value })}
            placeholder="Location"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
          placeholder="Add details..."
          rows={2}
        />
      </div>

      <Button onClick={onSubmit} className="w-full" disabled={!formData.title || !selectedDate}>
        {isEdit ? 'Update Event' : 'Add Event'}
      </Button>
    </div>
  );
}
