import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon, Clock, MapPin, Users, FileText, Timer, ChevronRight } from 'lucide-react';
import { format, differenceInDays, differenceInHours, differenceInMinutes, isToday, isTomorrow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Meeting } from '@/types/meeting';

interface MeetingScorecardProps {
  meetings: Meeting[];
}

function getCountdown(dateStr: string, timeStr: string | null) {
  const now = new Date();
  const meetingDate = new Date(dateStr);
  
  if (timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    meetingDate.setHours(h, m, 0, 0);
  } else {
    meetingDate.setHours(9, 0, 0, 0);
  }

  const totalMinutes = differenceInMinutes(meetingDate, now);
  if (totalMinutes <= 0) return { label: 'Now', urgent: true, days: 0, hours: 0, minutes: 0 };

  const days = differenceInDays(meetingDate, now);
  const hours = differenceInHours(meetingDate, now) % 24;
  const minutes = totalMinutes % 60;

  let label = '';
  if (days > 0) label = `${days}d ${hours}h`;
  else if (hours > 0) label = `${hours}h ${minutes}m`;
  else label = `${minutes}m`;

  return { label, urgent: totalMinutes < 120, days, hours, minutes };
}

function getUrgencyColor(dateStr: string) {
  const days = differenceInDays(new Date(dateStr), new Date());
  if (days <= 0) return 'border-red-500 bg-red-50 dark:bg-red-950/30';
  if (days <= 1) return 'border-amber-500 bg-amber-50 dark:bg-amber-950/30';
  if (days <= 3) return 'border-blue-500 bg-blue-50 dark:bg-blue-950/30';
  return 'border-border bg-card';
}

export function MeetingScorecard({ meetings }: MeetingScorecardProps) {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const meetingTypeEvents = meetings.filter(m => m.meeting_type === 'meeting');

  if (meetingTypeEvents.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        <Users className="h-8 w-8 mx-auto mb-1 opacity-40" />
        <p>No upcoming meetings</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {meetingTypeEvents.slice(0, 4).map((meeting) => {
          const countdown = getCountdown(meeting.meeting_date, meeting.meeting_time);
          const dateLabel = isToday(new Date(meeting.meeting_date))
            ? 'Today'
            : isTomorrow(new Date(meeting.meeting_date))
            ? 'Tomorrow'
            : format(new Date(meeting.meeting_date), 'EEE, dd MMM');

          return (
            <button
              key={meeting.id}
              onClick={() => setSelectedMeeting(meeting)}
              className={cn(
                "relative p-3 rounded-xl border-2 text-left transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer",
                getUrgencyColor(meeting.meeting_date)
              )}
            >
              {/* Countdown badge */}
              <div className="flex items-center justify-between mb-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-mono font-bold",
                    countdown.urgent ? "border-red-500 text-red-600 bg-red-100 dark:bg-red-900/50" : "border-primary/30 text-primary"
                  )}
                >
                  <Timer className="h-3 w-3 mr-1" />
                  {countdown.label}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Title */}
              <p className="font-semibold text-sm truncate mb-1.5">{meeting.title}</p>

              {/* Date & Time */}
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
                <CalendarIcon className="h-3 w-3 shrink-0" />
                <span>{dateLabel}</span>
                {meeting.meeting_time && (
                  <>
                    <Clock className="h-3 w-3 shrink-0 ml-1" />
                    <span>{meeting.meeting_time}</span>
                  </>
                )}
              </div>

              {/* Location */}
              {meeting.location && (
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{meeting.location}</span>
                </div>
              )}

              {/* Footer badges */}
              <div className="flex items-center gap-2 mt-2">
                {meeting.attendees && meeting.attendees.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] py-0">
                    <Users className="h-3 w-3 mr-1" />
                    {meeting.attendees.length}
                  </Badge>
                )}
                {meeting.required_items && meeting.required_items.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] py-0">
                    <FileText className="h-3 w-3 mr-1" />
                    {meeting.required_items.length}
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {meetingTypeEvents.length > 4 && (
        <p className="text-xs text-center text-muted-foreground mt-2">+{meetingTypeEvents.length - 4} more meetings</p>
      )}

      {/* Meeting Detail Dialog */}
      <Dialog open={!!selectedMeeting} onOpenChange={(open) => !open && setSelectedMeeting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Meeting Details
            </DialogTitle>
          </DialogHeader>
          {selectedMeeting && <MeetingDetailContent meeting={selectedMeeting} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function MeetingDetailContent({ meeting }: { meeting: Meeting }) {
  const countdown = getCountdown(meeting.meeting_date, meeting.meeting_time);
  const dateLabel = format(new Date(meeting.meeting_date), 'EEEE, dd MMMM yyyy');

  return (
    <ScrollArea className="max-h-[60vh]">
      <div className="space-y-5 pr-2">
        {/* Title & Countdown */}
        <div>
          <h3 className="text-lg font-bold">{meeting.title}</h3>
          <Badge
            variant="outline"
            className={cn(
              "mt-1 font-mono",
              countdown.urgent ? "border-red-500 text-red-600" : "border-primary/30 text-primary"
            )}
          >
            <Timer className="h-3.5 w-3.5 mr-1" />
            {countdown.label} remaining
          </Badge>
        </div>

        {/* Date, Time, Location */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{dateLabel}</span>
          </div>
          {meeting.meeting_time && (
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{meeting.meeting_time}</span>
            </div>
          )}
          {meeting.location && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{meeting.location}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {meeting.description && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description</h4>
            <p className="text-sm bg-muted/50 rounded-lg p-3">{meeting.description}</p>
          </div>
        )}

        {/* Required Items */}
        {meeting.required_items && meeting.required_items.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" /> Required for Meeting
            </h4>
            <div className="space-y-1.5">
              {meeting.required_items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50 border">
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendees */}
        {meeting.attendees && meeting.attendees.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> Attendees ({meeting.attendees.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {meeting.attendees.map((name, i) => (
                <Badge key={i} variant="secondary" className="text-xs py-1 px-2.5">
                  {name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
