import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Plus, Edit2, Trash2, Clock, MapPin, CalendarCheck, Pin, PinOff, Bell, Users } from 'lucide-react';
import { format, differenceInDays, isToday, isTomorrow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Meeting, MeetingInput } from '@/types/meeting';
import { Reminder, ReminderInput } from '@/hooks/useReminders';
import { EventFormContent } from './EventFormContent';
import { MeetingScorecard } from './MeetingScorecard';

interface UpcomingEventsCardProps {
  meetings: Meeting[];
  onAdd: (input: MeetingInput) => Promise<any>;
  onUpdate: (id: string, input: Partial<MeetingInput>) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
  reminders: Reminder[];
  onAddReminder: (input: ReminderInput) => Promise<any>;
  onUpdateReminder: (id: string, input: Partial<ReminderInput & { is_done: boolean; is_pinned: boolean }>) => Promise<any>;
  onDeleteReminder: (id: string) => Promise<void>;
}

export function UpcomingEventsCard({ meetings, onAdd, onUpdate, onDelete, reminders, onAddReminder, onUpdateReminder, onDeleteReminder }: UpcomingEventsCardProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [formData, setFormData] = useState<MeetingInput>({
    title: '', description: '', meeting_date: '', meeting_time: '', location: '', meeting_type: 'meeting', attendees: [], required_items: [],
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [newReminderTitle, setNewReminderTitle] = useState('');

  const resetForm = () => {
    setFormData({ title: '', description: '', meeting_date: '', meeting_time: '', location: '', meeting_type: 'meeting', attendees: [], required_items: [] });
    setSelectedDate(undefined);
  };

  const handleAdd = async () => {
    if (!formData.title || !selectedDate) return;
    await onAdd({ ...formData, meeting_date: format(selectedDate, 'yyyy-MM-dd') });
    resetForm();
    setIsAddOpen(false);
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title, description: meeting.description || '', meeting_date: meeting.meeting_date,
      meeting_time: meeting.meeting_time || '', location: meeting.location || '', meeting_type: meeting.meeting_type,
    });
    setSelectedDate(new Date(meeting.meeting_date));
  };

  const handleUpdate = async () => {
    if (!editingMeeting || !formData.title || !selectedDate) return;
    await onUpdate(editingMeeting.id, { ...formData, meeting_date: format(selectedDate, 'yyyy-MM-dd') });
    resetForm();
    setEditingMeeting(null);
  };

  const handleAddReminder = async () => {
    if (!newReminderTitle.trim()) return;
    await onAddReminder({ title: newReminderTitle.trim() });
    setNewReminderTitle('');
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

  const activeReminders = reminders.filter(r => !r.is_done);
  const completedReminders = reminders.filter(r => r.is_done);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-primary" />
          Upcoming Events & Reminders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="events">
          <TabsList className="mb-4">
            <TabsTrigger value="events">
              <CalendarCheck className="h-4 w-4 mr-1" />
              Events
              {meetings.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{meetings.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="reminders">
              <Bell className="h-4 w-4 mr-1" />
              Reminders
              {activeReminders.length > 0 && <Badge variant="destructive" className="ml-1 text-xs">{activeReminders.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events">
            <div className="flex justify-end mb-3">
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => { resetForm(); setIsAddOpen(true); }}>
                    <Plus className="h-4 w-4 mr-1" /> Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add New Event</DialogTitle></DialogHeader>
                  <EventFormContent
                    isEdit={false}
                    formData={formData}
                    selectedDate={selectedDate}
                    onFormDataChange={setFormData}
                    onDateChange={setSelectedDate}
                    onSubmit={handleAdd}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {meetings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No upcoming events</p>
                <p className="text-sm">Add your first event to get started</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {meetings.slice(0, 5).map((meeting) => (
                  <div key={meeting.id} className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{meeting.title}</span>
                        <Badge className={cn("text-xs", getTypeColor(meeting.meeting_type))}>{meeting.meeting_type}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" />{getDateLabel(meeting.meeting_date)}</span>
                        {meeting.meeting_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{meeting.meeting_time}</span>}
                        {meeting.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{meeting.location}</span>}
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
                          <DialogHeader><DialogTitle>Edit Event</DialogTitle></DialogHeader>
                          <EventFormContent
                            isEdit={true}
                            formData={formData}
                            selectedDate={selectedDate}
                            onFormDataChange={setFormData}
                            onDateChange={setSelectedDate}
                            onSubmit={handleUpdate}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(meeting.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {meetings.length > 5 && (
                  <p className="text-sm text-center text-muted-foreground pt-2">+{meetings.length - 5} more events</p>
                )}
              </div>
            )}
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders">
            <div className="flex gap-2 mb-4">
              <Input
                value={newReminderTitle}
                onChange={(e) => setNewReminderTitle(e.target.value)}
                placeholder="Add a reminder (e.g. Pending response from Dept A)"
                onKeyDown={(e) => e.key === 'Enter' && handleAddReminder()}
              />
              <Button size="sm" onClick={handleAddReminder} disabled={!newReminderTitle.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {activeReminders.length === 0 && completedReminders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No reminders yet</p>
                <p className="text-sm">Pin pending items you're waiting for</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {activeReminders.map((reminder) => (
                  <div key={reminder.id} className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    reminder.is_pinned ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800" : "bg-card hover:bg-muted/50"
                  )}>
                    <Checkbox
                      checked={reminder.is_done}
                      onCheckedChange={(checked) => onUpdateReminder(reminder.id, { is_done: !!checked })}
                    />
                    <span className="flex-1 text-sm">{reminder.title}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => onUpdateReminder(reminder.id, { is_pinned: !reminder.is_pinned })}
                        title={reminder.is_pinned ? 'Unpin' : 'Pin'}
                      >
                        {reminder.is_pinned ? <Pin className="h-3.5 w-3.5 text-amber-600" /> : <PinOff className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDeleteReminder(reminder.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}

                {completedReminders.length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground pt-2 font-medium">Completed ({completedReminders.length})</p>
                    {completedReminders.map((reminder) => (
                      <div key={reminder.id} className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30 opacity-60">
                        <Checkbox
                          checked={true}
                          onCheckedChange={() => onUpdateReminder(reminder.id, { is_done: false })}
                        />
                        <span className="flex-1 text-sm line-through">{reminder.title}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDeleteReminder(reminder.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
