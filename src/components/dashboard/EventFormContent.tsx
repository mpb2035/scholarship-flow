import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X } from 'lucide-react';
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
  const [newAttendee, setNewAttendee] = useState('');
  const [newItem, setNewItem] = useState('');

  const addAttendee = () => {
    if (!newAttendee.trim()) return;
    onFormDataChange({ ...formData, attendees: [...(formData.attendees || []), newAttendee.trim()] });
    setNewAttendee('');
  };

  const removeAttendee = (index: number) => {
    const updated = [...(formData.attendees || [])];
    updated.splice(index, 1);
    onFormDataChange({ ...formData, attendees: updated });
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    onFormDataChange({ ...formData, required_items: [...(formData.required_items || []), newItem.trim()] });
    setNewItem('');
  };

  const removeItem = (index: number) => {
    const updated = [...(formData.required_items || [])];
    updated.splice(index, 1);
    onFormDataChange({ ...formData, required_items: updated });
  };

  const isMeetingType = formData.meeting_type === 'meeting';

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
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
              <Calendar mode="single" selected={selectedDate} onSelect={onDateChange} initialFocus className={cn("p-3 pointer-events-auto")} />
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

      {/* Attendees - shown for meetings */}
      {isMeetingType && (
        <div className="space-y-2">
          <Label>Attendees</Label>
          <div className="flex gap-2">
            <Input
              value={newAttendee}
              onChange={(e) => setNewAttendee(e.target.value)}
              placeholder="Add attendee name"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee())}
            />
            <Button type="button" size="sm" variant="outline" onClick={addAttendee} disabled={!newAttendee.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {formData.attendees && formData.attendees.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {formData.attendees.map((name, i) => (
                <Badge key={i} variant="secondary" className="text-xs pr-1">
                  {name}
                  <button onClick={() => removeAttendee(i)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Required Items - shown for meetings */}
      {isMeetingType && (
        <div className="space-y-2">
          <Label>Required Items</Label>
          <div className="flex gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="e.g. Slides, Report, Agenda"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
            />
            <Button type="button" size="sm" variant="outline" onClick={addItem} disabled={!newItem.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {formData.required_items && formData.required_items.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {formData.required_items.map((item, i) => (
                <Badge key={i} variant="outline" className="text-xs pr-1">
                  {item}
                  <button onClick={() => removeItem(i)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      <Button onClick={onSubmit} className="w-full" disabled={!formData.title || !selectedDate}>
        {isEdit ? 'Update Event' : 'Add Event'}
      </Button>
    </div>
  );
}
