import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Plus, Edit2, Trash2, Clock, MapPin, CalendarCheck } from 'lucide-react';
import { format, differenceInDays, isToday, isTomorrow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Meeting, MeetingInput } from '@/types/meeting';

interface UpcomingEventsCardProps {
  meetings: Meeting[];
  onAdd: (input: MeetingInput) => Promise<any>;
  onUpdate: (id: string, input: Partial<MeetingInput>) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
}

export function UpcomingEventsCard({ meetings, onAdd, onUpdate, onDelete }: UpcomingEventsCardProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [formData, setFormData] = useState<MeetingInput>({
    title: '',
    description: '',
    meeting_date: '',
    meeting_time: '',
    location: '',
    meeting_type: 'meeting',
  });
  const [selectedDate, setSelectedDate] = useState<Date>();

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      meeting_date: '',
      meeting_time: '',
      location: '',
      meeting_type: 'meeting',
    });
    setSelectedDate(undefined);
  };

  const handleAdd = async () => {
    if (!formData.title || !selectedDate) return;
    
    await onAdd({
      ...formData,
      meeting_date: format(selectedDate, 'yyyy-MM-dd'),
    });
    resetForm();
    setIsAddOpen(false);
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description || '',
      meeting_date: meeting.meeting_date,
      meeting_time: meeting.meeting_time || '',
      location: meeting.location || '',
      meeting_type: meeting.meeting_type,
    });
    setSelectedDate(new Date(meeting.meeting_date));
  };

  const handleUpdate = async () => {
    if (!editingMeeting || !formData.title || !selectedDate) return;
    
    await onUpdate(editingMeeting.id, {
      ...formData,
      meeting_date: format(selectedDate, 'yyyy-MM-dd'),
    });
    resetForm();
    setEditingMeeting(null);
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    const days = differenceInDays(date, new Date());
    if (days < 7) return `In ${days} days`;
    return format(date, 'MMM dd');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'event': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'reminder': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'deadline': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return '';
    }
  };

  const FormContent = ({ isEdit }: { isEdit: boolean }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Time</Label>
          <Input
            type="time"
            value={formData.meeting_time}
            onChange={(e) => setFormData(prev => ({ ...prev, meeting_time: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select 
            value={formData.meeting_type} 
            onValueChange={(v: 'meeting' | 'event' | 'reminder' | 'deadline') => 
              setFormData(prev => ({ ...prev, meeting_type: v }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
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
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Location"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Add details..."
          rows={2}
        />
      </div>

      <Button 
        onClick={isEdit ? handleUpdate : handleAdd} 
        className="w-full"
        disabled={!formData.title || !selectedDate}
      >
        {isEdit ? 'Update Event' : 'Add Event'}
      </Button>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-primary" />
          Upcoming Events
        </CardTitle>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => { resetForm(); setIsAddOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <FormContent isEdit={false} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {meetings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No upcoming events</p>
            <p className="text-sm">Add your first event to get started</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {meetings.slice(0, 5).map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{meeting.title}</span>
                    <Badge className={cn("text-xs", getTypeColor(meeting.meeting_type))}>
                      {meeting.meeting_type}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {getDateLabel(meeting.meeting_date)}
                    </span>
                    {meeting.meeting_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {meeting.meeting_time}
                      </span>
                    )}
                    {meeting.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {meeting.location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <Dialog open={editingMeeting?.id === meeting.id} onOpenChange={(open) => !open && setEditingMeeting(null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(meeting)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Event</DialogTitle>
                      </DialogHeader>
                      <FormContent isEdit={true} />
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(meeting.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {meetings.length > 5 && (
              <p className="text-sm text-center text-muted-foreground pt-2">
                +{meetings.length - 5} more events
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
