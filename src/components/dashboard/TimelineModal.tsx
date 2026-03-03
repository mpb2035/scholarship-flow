import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Matter } from '@/types/matter';
import { History, Copy, Check, Clock, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInDays, addDays, getDay, format } from 'date-fns';

interface TimelineEvent {
  date: string;
  status: string;
  sortDate: Date;
}

interface TimelineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matter: Matter | null;
}

// Brunei Darussalam public holidays (fixed + estimated dates for moveable holidays)
// Moveable Islamic holidays are approximated for 2024-2027 range
function getBruneiPublicHolidays(year: number): Set<string> {
  const holidays = new Set<string>();

  const fixed = [
    `${year}-01-01`, // New Year
    `${year}-02-23`, // National Day
    `${year}-03-01`, // Anniversary of Royal Brunei Armed Forces
    `${year}-05-31`, // Anniversary of Royal Brunei Malay Regiment
    `${year}-07-15`, // Sultan's Birthday
    `${year}-12-25`, // Christmas Day
  ];
  fixed.forEach(d => holidays.add(d));

  // Approximate moveable Islamic holidays by year
  const moveableByYear: Record<number, string[]> = {
    2024: [
      '2024-01-01', // Awal Muharram (approx)
      '2024-02-08', // Israk Mi'raj
      '2024-03-12', '2024-03-13', // Start of Ramadan
      '2024-03-27', // Nuzul Al-Quran
      '2024-04-10', '2024-04-11', '2024-04-12', // Hari Raya Aidilfitri
      '2024-06-17', '2024-06-18', // Hari Raya Aidiladha
      '2024-07-08', // Awal Muharram
      '2024-09-16', // Maulud Nabi
    ],
    2025: [
      '2025-01-27', // Israk Mi'raj
      '2025-03-01', '2025-03-02', // Start of Ramadan
      '2025-03-15', // Nuzul Al-Quran
      '2025-03-30', '2025-03-31', '2025-04-01', // Hari Raya Aidilfitri
      '2025-06-06', '2025-06-07', // Hari Raya Aidiladha
      '2025-06-27', // Awal Muharram
      '2025-09-05', // Maulud Nabi
    ],
    2026: [
      '2026-01-16', // Israk Mi'raj
      '2026-02-18', '2026-02-19', // Start of Ramadan
      '2026-03-04', // Nuzul Al-Quran
      '2026-03-20', '2026-03-21', '2026-03-22', // Hari Raya Aidilfitri
      '2026-05-27', '2026-05-28', // Hari Raya Aidiladha
      '2026-06-17', // Awal Muharram
      '2026-08-26', // Maulud Nabi
    ],
    2027: [
      '2027-01-06', // Israk Mi'raj
      '2027-02-08', '2027-02-09', // Start of Ramadan
      '2027-02-21', // Nuzul Al-Quran
      '2027-03-09', '2027-03-10', '2027-03-11', // Hari Raya Aidilfitri
      '2027-05-16', '2027-05-17', // Hari Raya Aidiladha
      '2027-06-06', // Awal Muharram
      '2027-08-15', // Maulud Nabi
    ],
  };

  (moveableByYear[year] || []).forEach(d => holidays.add(d));
  return holidays;
}

function getWorkingDaysBetween(startDate: Date, endDate: Date): number {
  const start = startDate < endDate ? startDate : endDate;
  const end = startDate < endDate ? endDate : startDate;

  // Collect holidays for all years in range
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();
  const allHolidays = new Set<string>();
  for (let y = startYear; y <= endYear; y++) {
    getBruneiPublicHolidays(y).forEach(h => allHolidays.add(h));
  }

  let workingDays = 0;
  let current = addDays(start, 1); // Start counting from next day

  while (current <= end) {
    const dayOfWeek = getDay(current); // 0=Sun, 5=Fri
    const isFriday = dayOfWeek === 5;
    const isSunday = dayOfWeek === 0;
    const dateStr = format(current, 'yyyy-MM-dd');
    const isHoliday = allHolidays.has(dateStr);

    if (!isFriday && !isSunday && !isHoliday) {
      workingDays++;
    }
    current = addDays(current, 1);
  }

  return workingDays;
}

function buildTimeline(matter: Matter): TimelineEvent[] {
  const timelineEvents: TimelineEvent[] = [];
  const dateFields: { key: keyof Matter; label: string }[] = [
    { key: 'dsmSubmittedDate', label: 'Dept Submitted' },
    { key: 'sutheReceivedDate', label: 'SUT HE Received' },
    { key: 'suthePassToDepartmentDate', label: 'SUT HE Passed to Department' },
    { key: 'sutheSubmittedToHuDate', label: 'SUT HE Submitted to HU' },
    { key: 'huReturnedToSutheDate', label: 'HU Returned to SUT HE' },
    { key: 'queryIssuedDate', label: 'Query Issued to Dept' },
    { key: 'queryResponseDate', label: 'Query Response Received' },
    { key: 'secondQueryIssuedDate', label: '2nd Query Issued to Dept' },
    { key: 'secondQueryResponseDate', label: '2nd Query Response Received' },
    { key: 'secondSutheSubmittedToHuDate', label: '2nd SUT HE Submitted to HU' },
    { key: 'signedDate', label: 'Approved & Signed' },
  ];

  dateFields.forEach(({ key, label }) => {
    const dateValue = matter[key];
    if (dateValue && typeof dateValue === 'string') {
      timelineEvents.push({ date: dateValue, status: label, sortDate: new Date(dateValue) });
    }
  });

  timelineEvents.sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());
  return timelineEvents;
}

function formatDateDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateForCopy(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

function getDaysBetween(date1: Date, date2: Date): number {
  return Math.abs(differenceInDays(date2, date1));
}

export function TimelineModal({ open, onOpenChange, matter }: TimelineModalProps) {
  const [copied, setCopied] = useState(false);

  if (!matter) return null;

  const timeline = buildTimeline(matter);
  const today = new Date();
  const latestEvent = timeline.length > 0 ? timeline[timeline.length - 1] : null;
  const daysSinceLatest = latestEvent ? getDaysBetween(latestEvent.sortDate, today) : 0;
  const workingDaysSinceLatest = latestEvent ? getWorkingDaysBetween(latestEvent.sortDate, today) : 0;

  const handleCopyHistory = async () => {
    const historyText = timeline
      .map((event, index) => {
        const daysPart = index > 0
          ? ` (+${getDaysBetween(timeline[index - 1].sortDate, event.sortDate)}d / ${getWorkingDaysBetween(timeline[index - 1].sortDate, event.sortDate)}wd)`
          : '';
        return `${formatDateForCopy(event.date)} - ${event.status}${daysPart}`;
      })
      .join('\n');

    const latestNote = latestEvent
      ? `\n\nDays since last update: ${daysSinceLatest} calendar days / ${workingDaysSinceLatest} working days`
      : '';

    try {
      await navigator.clipboard.writeText(historyText + latestNote);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-lg gold-text flex items-center gap-2">
            <History className="h-5 w-5" />
            Case Timeline
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-mono">{matter.caseId}</p>
        </DialogHeader>

        <div className="py-4">
          {timeline.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No timeline events recorded
            </p>
          ) : (
            <div className="relative pl-6">
              <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-border" />

              <div className="space-y-6">
                {timeline.map((event, index) => {
                  const daysSincePrevious = index > 0
                    ? getDaysBetween(timeline[index - 1].sortDate, event.sortDate)
                    : 0;
                  const workingDaysSincePrevious = index > 0
                    ? getWorkingDaysBetween(timeline[index - 1].sortDate, event.sortDate)
                    : 0;

                  return (
                    <div key={index} className="relative flex gap-4">
                      <div
                        className={cn(
                          'absolute left-[-18px] top-1 w-3 h-3 rounded-full border-2',
                          index === timeline.length - 1
                            ? 'bg-primary border-primary'
                            : 'bg-card border-muted-foreground'
                        )}
                      />

                      {index > 0 && (
                        <div className="absolute left-[-24px] -top-4 flex gap-1">
                          <span className="text-[10px] text-muted-foreground font-mono bg-card px-1">+{daysSincePrevious}d</span>
                          <span className="text-[10px] text-primary font-mono bg-card px-1">+{workingDaysSincePrevious}wd</span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-mono font-bold text-sm text-foreground">
                          {formatDateDisplay(event.date)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {event.status}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Days since latest update - Calendar & Working */}
          {latestEvent && (
            <div className="mt-6 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[11px] text-muted-foreground">Calendar Days</p>
                    <p className="font-mono font-bold text-primary">{daysSinceLatest} days</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50">
                  <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[11px] text-muted-foreground">Working Days</p>
                    <p className="font-mono font-bold text-primary">{workingDaysSinceLatest} days</p>
                    <p className="text-[10px] text-muted-foreground">Excl. Fri, Sun & PH</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {timeline.length > 0 && (
          <div className="pt-2 border-t border-border">
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleCopyHistory}>
              {copied ? (
                <><Check className="h-4 w-4 text-success" /> Copied!</>
              ) : (
                <><Copy className="h-4 w-4" /> Copy Case History</>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
